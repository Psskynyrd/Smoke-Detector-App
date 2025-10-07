import { Alert, PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device, Subscription } from "react-native-ble-plx";

import { Buffer } from "buffer";
import { create } from "zustand";

// ESP32 UUIDs
const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const WRITE_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const NOTIFY_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

// Message types
export const MESSAGE_TYPES = {
  SMOKE_ALERT: "smoke_alert",
  STATUS_UPDATE: "status_update",
  DEVICE_INFO: "device_info",
  USER_MESSAGE: "user_message",
};

export interface BLEMessage {
  id: string;
  type: string;
  content: string;
  timestamp: Date;
  deviceId: string;
  deviceName?: string;
  isIncoming: boolean;
}

export interface BLEDeviceInfo {
  id: string;
  name: string;
  rssi?: number;
  isESP32: boolean;
  lastSeen: Date;
}

interface BLEState {
  // Manager and Connection
  manager: BleManager | null;
  connectedDevice: Device | null;
  discoveredDevices: Map<string, BLEDeviceInfo>;

  // Status
  isScanning: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  bleReady: boolean;

  // Messages
  messages: BLEMessage[];
  unreadCount: number;
  lastMessage: BLEMessage | null;

  // Subscriptions
  stateSubscription: Subscription | null;
  notificationSubscription: Subscription | null;

  // Actions
  initialize: () => Promise<void>;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  connectToDevice: (device: BLEDeviceInfo) => Promise<boolean>;
  disconnect: () => Promise<void>;
  sendMessage: (message: string, type?: string) => Promise<boolean>;
  clearMessages: () => void;
  markMessagesAsRead: () => void;
  cleanup: () => void;

  // Getters
  getESP32Devices: () => BLEDeviceInfo[];
  getMessagesByType: (type: string) => BLEMessage[];

  messageBuffer: string;
  isReceivingChunked: boolean;

  processCompleteMessage: (content: string, deviceInfo: BLEDeviceInfo) => void;
}

async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      const allGranted = Object.values(granted).every(
        (permission) => permission === PermissionsAndroid.RESULTS.GRANTED,
      );

      if (!allGranted) {
        Alert.alert(
          "Permissions required",
          "Please grant all Bluetooth permissions",
        );
        return false;
      }
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          "Permission required",
          "Location permission is required for BLE",
        );
        return false;
      }
    }
  }
  return true;
}

export const useBLEStore = create<BLEState>((set, get) => ({
  // Initial state
  manager: null,
  connectedDevice: null,
  discoveredDevices: new Map(),
  isScanning: false,
  isConnected: false,
  isConnecting: false,
  bleReady: false,
  messages: [],
  unreadCount: 0,
  lastMessage: null,
  stateSubscription: null,
  notificationSubscription: null,
  messageBuffer: "",
  isReceivingChunked: false,

  initialize: async () => {
    const { manager, stateSubscription } = get();

    // Clean up existing subscription
    if (stateSubscription) {
      stateSubscription.remove();
    }

    // Create new manager if doesn't exist
    if (!manager) {
      const newManager = new BleManager();
      set({ manager: newManager });

      const permissionGranted = await requestPermissions();
      if (!permissionGranted) return;

      const subscription = newManager.onStateChange((state) => {
        console.log("BLE State:", state);
        set({ bleReady: state === "PoweredOn" });
      }, true);

      set({ stateSubscription: subscription });
    }
  },

  startScanning: async () => {
    const { bleReady, isConnected, manager } = get();

    if (!manager) {
      Alert.alert("Error", "BLE Manager not initialized");
      return;
    }

    if (!bleReady) {
      Alert.alert("Bluetooth not ready", "Please ensure Bluetooth is enabled");
      return;
    }

    if (isConnected) {
      Alert.alert("Already connected", "Disconnect current device first");
      return;
    }

    set({ isScanning: true, discoveredDevices: new Map() });

    const scanTimeout = setTimeout(() => {
      manager.stopDeviceScan();
      set({ isScanning: false });
    }, 15000);

    manager.startDeviceScan(
      null,
      { allowDuplicates: false },
      (error, scannedDevice) => {
        if (error) {
          console.error("Scan error:", error);
          Alert.alert("Scan error", error.message);
          set({ isScanning: false });
          clearTimeout(scanTimeout);
          return;
        }

        if (scannedDevice && scannedDevice.name) {
          const isESP32 =
            scannedDevice.name?.toLowerCase().includes("esp32") ||
            scannedDevice.name === "ESP32_BLE_Server" ||
            scannedDevice.name === "ESP32_BLE";

          const deviceInfo: BLEDeviceInfo = {
            id: scannedDevice.id,
            name: scannedDevice.name,
            rssi: scannedDevice.rssi || undefined,
            isESP32,
            lastSeen: new Date(),
          };

          set((state) => ({
            discoveredDevices: new Map(
              state.discoveredDevices.set(scannedDevice.id, deviceInfo),
            ),
          }));
        }
      },
    );
  },

  stopScanning: () => {
    const { manager } = get();
    if (manager) {
      manager.stopDeviceScan();
    }
    set({ isScanning: false });
  },

  connectToDevice: async (deviceInfo: BLEDeviceInfo): Promise<boolean> => {
    const { manager, isScanning } = get();

    if (!manager) {
      Alert.alert("Error", "BLE Manager not initialized");
      return false;
    }

    try {
      set({ isConnecting: true });

      if (isScanning) {
        manager.stopDeviceScan();
        set({ isScanning: false });
      }

      const connectedDevice = await manager.connectToDevice(deviceInfo.id, {
        timeout: 10000,
      });

      const deviceWithServices =
        await connectedDevice.discoverAllServicesAndCharacteristics();

      // Request larger MTU for better performance
      try {
        const mtu = await deviceWithServices.requestMTU(512);
        console.log("MTU negotiated:", mtu);
      } catch (mtuError) {
        console.log("MTU negotiation failed, using default:", mtuError);
      }

      set({
        connectedDevice: deviceWithServices,
        isConnected: true,
        isConnecting: false,
      });

      // Disconnect handler
      deviceWithServices.onDisconnected((error) => {
        try {
          console.log("Device disconnected:", error);

          // Only update state if still mounted
          const currentState = get();
          if (currentState.connectedDevice?.id === deviceInfo.id) {
            set({
              isConnected: false,
              connectedDevice: null,
            });

            const disconnectMessage: BLEMessage = {
              id: Date.now().toString(),
              type: MESSAGE_TYPES.STATUS_UPDATE,
              content: "Device disconnected",
              timestamp: new Date(),
              deviceId: deviceInfo.id,
              deviceName: deviceInfo.name,
              isIncoming: true,
            };

            set((state) => ({
              messages: [disconnectMessage, ...state.messages],
              lastMessage: disconnectMessage,
              unreadCount: state.unreadCount + 1,
            }));
          }
        } catch (error) {
          console.error("Error handling disconnect:", error);
        }
      });

      // Set up notifications
      try {
        const subscription = deviceWithServices.monitorCharacteristicForService(
          SERVICE_UUID,
          NOTIFY_UUID,
          (err, characteristic) => {
            if (err) {
              console.error("Notify error:", err);
              return;
            }

            if (characteristic?.value) {
              try {
                const content = Buffer.from(
                  characteristic.value,
                  "base64",
                ).toString("utf8");

                const currentState = get();

                // Check if this looks like a chunked message
                const isLikelyChunked =
                  content.length >= 100 || currentState.isReceivingChunked;

                if (isLikelyChunked) {
                  // Accumulate chunks
                  const newBuffer = currentState.messageBuffer + content;

                  set({
                    messageBuffer: newBuffer,
                    isReceivingChunked: true,
                  });

                  // Wait for more chunks (timeout approach)
                  setTimeout(() => {
                    const state = get();
                    if (state.isReceivingChunked && state.messageBuffer) {
                      get().processCompleteMessage(
                        state.messageBuffer,
                        deviceInfo,
                      );
                      set({
                        messageBuffer: "",
                        isReceivingChunked: false,
                      });
                    }
                  }, 200); // 200ms timeout
                } else {
                  // Complete message in single packet
                  get().processCompleteMessage(content, deviceInfo);
                }
              } catch (decodeError) {
                console.error("Decode error:", decodeError);
                // Reset buffer on error
                set({
                  messageBuffer: "",
                  isReceivingChunked: false,
                });
              }
            }
          },
        );

        set({ notificationSubscription: subscription });

        const connectMessage: BLEMessage = {
          id: Date.now().toString(),
          type: MESSAGE_TYPES.STATUS_UPDATE,
          content: `Connected to ${deviceInfo.name}`,
          timestamp: new Date(),
          deviceId: deviceInfo.id,
          deviceName: deviceInfo.name,
          isIncoming: true,
        };

        set((state) => ({
          messages: [connectMessage, ...state.messages],
          lastMessage: connectMessage,
          unreadCount: state.unreadCount + 1,
        }));

        return true;
      } catch (notifyError) {
        console.error("Failed to enable notifications:", notifyError);
        return false;
      }
    } catch (err: any) {
      console.error("Connection error:", err);
      set({
        isConnected: false,
        connectedDevice: null,
        isConnecting: false,
      });
      Alert.alert("Connection Failed", err.message);
      return false;
    }
  },

  disconnect: async () => {
    const { connectedDevice, notificationSubscription } = get();

    // Remove notification subscription
    if (notificationSubscription) {
      notificationSubscription.remove();
      set({ notificationSubscription: null });
    }

    if (connectedDevice) {
      try {
        await connectedDevice.cancelConnection();
      } catch (err) {
        console.error("Disconnect error:", err);
      }
    }

    set({
      connectedDevice: null,
      isConnected: false,
    });
  },

  sendMessage: async (
    message: string,
    type: string = MESSAGE_TYPES.USER_MESSAGE,
  ): Promise<boolean> => {
    const { connectedDevice, isConnected } = get();

    if (!connectedDevice || !isConnected) {
      Alert.alert("Not connected", "Please connect to a device first");
      return false;
    }

    const formattedMessage =
      type !== MESSAGE_TYPES.USER_MESSAGE ? `${type}:${message}` : message;

    const base64msg = Buffer.from(formattedMessage, "utf8").toString("base64");

    try {
      await connectedDevice.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        WRITE_UUID,
        base64msg,
      );

      const sentMessage: BLEMessage = {
        id: Date.now().toString(),
        type,
        content: message,
        timestamp: new Date(),
        deviceId: connectedDevice.id,
        deviceName: connectedDevice.name || "Unknown",
        isIncoming: false,
      };

      set((state) => ({
        messages: [sentMessage, ...state.messages],
        lastMessage: sentMessage,
      }));

      return true;
    } catch (err: any) {
      console.error("Write error:", err);
      Alert.alert("Send Failed", err.message);
      return false;
    }
  },

  clearMessages: () => {
    set({ messages: [], unreadCount: 0, lastMessage: null });
  },

  markMessagesAsRead: () => {
    set({ unreadCount: 0 });
  },

  cleanup: () => {
    const {
      connectedDevice,
      manager,
      stateSubscription,
      notificationSubscription,
    } = get();

    // Remove subscriptions
    if (stateSubscription) {
      stateSubscription.remove();
    }
    if (notificationSubscription) {
      notificationSubscription.remove();
    }

    // Stop scanning
    if (manager) {
      manager.stopDeviceScan();
    }

    // Disconnect device
    if (connectedDevice) {
      connectedDevice
        .cancelConnection()
        .catch((err) => console.error("Cleanup disconnect error:", err));
    }

    // DON'T destroy manager - just reset state
    set({
      connectedDevice: null,
      discoveredDevices: new Map(),
      isScanning: false,
      isConnected: false,
      isConnecting: false,
      stateSubscription: null,
      notificationSubscription: null,
      messageBuffer: "",
      isReceivingChunked: false,
    });
  },

  getESP32Devices: () => {
    const { discoveredDevices } = get();
    return Array.from(discoveredDevices.values()).filter(
      (device) => device.isESP32,
    );
  },

  getMessagesByType: (type: string) => {
    const { messages } = get();
    return messages.filter((message) => message.type === type);
  },

  processCompleteMessage: (content: string, deviceInfo: BLEDeviceInfo) => {
    let messageType = MESSAGE_TYPES.DEVICE_INFO;
    let messageContent = content;

    if (content.includes(":")) {
      const [type, ...contentParts] = content.split(":");
      if (Object.values(MESSAGE_TYPES).includes(type)) {
        messageType = type;
        messageContent = contentParts.join(":");
      }
    }

    const newMessage: BLEMessage = {
      id: Date.now().toString(),
      type: messageType,
      content: messageContent,
      timestamp: new Date(),
      deviceId: deviceInfo.id,
      deviceName: deviceInfo.name,
      isIncoming: true,
    };

    const currentState = get();
    if (currentState.isConnected) {
      set((state) => ({
        messages: [newMessage, ...state.messages],
        lastMessage: newMessage,
        unreadCount: state.unreadCount + 1,
      }));

      if (messageType === MESSAGE_TYPES.SMOKE_ALERT) {
        Alert.alert("🚨 Smoke Alert", messageContent, [
          { text: "Acknowledge", style: "default" },
        ]);
      }
    }
  },
}));

// Export hooks
export const useBLEConnection = () => {
  const {
    isConnected,
    connectedDevice,
    isConnecting,
    connectToDevice,
    disconnect,
  } = useBLEStore();

  return {
    isConnected,
    connectedDevice,
    isConnecting,
    connectToDevice,
    disconnect,
  };
};

export const useBLEMessages = () => {
  const {
    messages,
    lastMessage,
    unreadCount,
    sendMessage,
    clearMessages,
    markMessagesAsRead,
    getMessagesByType,
  } = useBLEStore();

  return {
    messages,
    lastMessage,
    unreadCount,
    sendMessage,
    clearMessages,
    markMessagesAsRead,
    getMessagesByType,
  };
};

export const useBLEScanning = () => {
  const {
    discoveredDevices,
    isScanning,
    startScanning,
    stopScanning,
    getESP32Devices,
  } = useBLEStore();

  return {
    discoveredDevices: Array.from(discoveredDevices.values()),
    isScanning,
    startScanning,
    stopScanning,
    getESP32Devices,
  };
};

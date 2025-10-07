import AsyncStorage from "@react-native-async-storage/async-storage";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Storage key
const STORAGE_KEY = "ble-storage";

// Types
export interface SavedDevice {
  id: string;
  name: string;
  lastConnected: string; // ISO date string
  connectionCount: number;
}

export interface BLESettings {
  autoReconnect: boolean;
  notificationsEnabled: boolean;
  backgroundMode: boolean;
  lastDeviceId?: string;
}

export interface StoredMessage {
  id: string;
  type: string;
  content: string;
  timestamp: string; // ISO date string
  deviceId: string;
  deviceName?: string;
  isIncoming: boolean;
}

export interface SensorData {
  fire: string;
  raw_smoke: number;
  smoke: number;
  temperature: number;
  humidity: number;
}

interface PersistentBLEState {
  // Persisted data
  savedDevices: SavedDevice[];
  settings: BLESettings;
  messageHistory: StoredMessage[];
  sensorData: SensorData[];

  // Actions
  addSavedDevice: (device: SavedDevice) => void;
  removeSavedDevice: (deviceId: string) => void;
  updateDeviceConnection: (deviceId: string, deviceName: string) => void;
  getSavedDevice: (deviceId: string) => SavedDevice | undefined;
  getMostRecentDevice: () => SavedDevice | undefined;

  addSensorData: (data: SensorData) => void;
  getSensorData: () => SensorData | undefined;
  clearSensorData: () => void;
  clearAllSensorData: () => void;

  updateSettings: (settings: Partial<BLESettings>) => void;

  addMessage: (message: StoredMessage) => void;
  getMessagesByDevice: (deviceId: string) => StoredMessage[];
  clearMessages: (deviceId?: string) => void;
  clearAllData: () => void;
}

// Default settings
const defaultSettings: BLESettings = {
  autoReconnect: true,
  notificationsEnabled: true,
  backgroundMode: false,
};

export const usePersistentBLEStore = create<PersistentBLEState>()(
  persist(
    (set, get) => ({
      // Initial state
      savedDevices: [],
      settings: defaultSettings,
      messageHistory: [],
      sensorData: [],

      // Device management
      addSavedDevice: (device) => {
        set((state) => {
          const existing = state.savedDevices.find((d) => d.id === device.id);
          if (existing) {
            return state; // Already exists
          }
          return {
            savedDevices: [...state.savedDevices, device],
          };
        });
      },

      removeSavedDevice: (deviceId) => {
        set((state) => ({
          savedDevices: state.savedDevices.filter((d) => d.id !== deviceId),
        }));
      },

      updateDeviceConnection: (deviceId, deviceName) => {
        set((state) => {
          const existing = state.savedDevices.find((d) => d.id === deviceId);

          if (existing) {
            // Update existing device
            return {
              savedDevices: state.savedDevices.map((d) =>
                d.id === deviceId
                  ? {
                      ...d,
                      name: deviceName,
                      lastConnected: new Date().toISOString(),
                      connectionCount: d.connectionCount + 1,
                    }
                  : d,
              ),
              settings: {
                ...state.settings,
                lastDeviceId: deviceId,
              },
            };
          } else {
            // Add new device
            const newDevice: SavedDevice = {
              id: deviceId,
              name: deviceName,
              lastConnected: new Date().toISOString(),
              connectionCount: 1,
            };
            return {
              savedDevices: [...state.savedDevices, newDevice],
              settings: {
                ...state.settings,
                lastDeviceId: deviceId,
              },
            };
          }
        });
      },

      getSavedDevice: (deviceId) => {
        return get().savedDevices.find((d) => d.id === deviceId);
      },

      getMostRecentDevice: () => {
        const devices = get().savedDevices;
        if (devices.length === 0) return undefined;

        return devices.reduce((mostRecent, current) => {
          const currentDate = new Date(current.lastConnected);
          const mostRecentDate = new Date(mostRecent.lastConnected);
          return currentDate > mostRecentDate ? current : mostRecent;
        });
      },

      // Sensor data management
      addSensorData: (data) => {
        set((state) => ({
          sensorData: [...state.sensorData, data],
        }));
      },
      getSensorData: () => {
        const data = get().sensorData;
        return data.length > 0 ? data[data.length - 1] : undefined;
      },
      clearSensorData: () => {
        set({ sensorData: [] });
      },
      clearAllSensorData: () => {
        set({ sensorData: [] });
      },

      // Settings management
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        }));
      },

      // Message management
      addMessage: (message) => {
        set((state) => {
          // Keep only last 1000 messages to prevent storage bloat
          const newHistory = [message, ...state.messageHistory].slice(0, 1000);
          return {
            messageHistory: newHistory,
          };
        });
      },

      getMessagesByDevice: (deviceId) => {
        return get().messageHistory.filter((m) => m.deviceId === deviceId);
      },

      clearMessages: (deviceId) => {
        if (deviceId) {
          set((state) => ({
            messageHistory: state.messageHistory.filter(
              (m) => m.deviceId !== deviceId,
            ),
          }));
        } else {
          set({ messageHistory: [] });
        }
      },

      clearAllData: () => {
        set({
          savedDevices: [],
          settings: defaultSettings,
          messageHistory: [],
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      // Optionally specify which keys to persist
      partialize: (state) => ({
        savedDevices: state.savedDevices,
        settings: state.settings,
        messageHistory: state.messageHistory,
      }),
    },
  ),
);

// Helper hooks
export const useSavedDevices = () => {
  const {
    savedDevices,
    addSavedDevice,
    removeSavedDevice,
    updateDeviceConnection,
    getSavedDevice,
    getMostRecentDevice,
  } = usePersistentBLEStore();

  return {
    savedDevices,
    addSavedDevice,
    removeSavedDevice,
    updateDeviceConnection,
    getSavedDevice,
    getMostRecentDevice,
  };
};

export const useBLESettings = () => {
  const { settings, updateSettings } = usePersistentBLEStore();
  return {
    settings,
    updateSettings,
  };
};

export const useMessageHistory = () => {
  const { messageHistory, addMessage, getMessagesByDevice, clearMessages } =
    usePersistentBLEStore();

  return {
    messageHistory,
    addMessage,
    getMessagesByDevice,
    clearMessages,
  };
};

export const useSensorData = () => {
  const { sensorData, addSensorData, getSensorData, clearSensorData } =
    usePersistentBLEStore();
  return {
    sensorData,
    addSensorData,
    getSensorData,
    clearSensorData,
  };
};

// Manual storage operations (if needed)
export const storageUtils = {
  // Clear all BLE storage
  clearStorage: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log("BLE storage cleared");
    } catch (error) {
      console.error("Failed to clear storage:", error);
    }
  },

  // Get raw storage data
  getStorageData: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to get storage data:", error);
      return null;
    }
  },

  // Export storage data (for backup)
  exportData: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data;
    } catch (error) {
      console.error("Failed to export data:", error);
      return null;
    }
  },

  // Import storage data (from backup)
  importData: async (jsonString: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, jsonString);
      console.log("Data imported successfully");
      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  },
};

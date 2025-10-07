// ====================================
// 1. Install required packages
// ====================================
// npm install react-native-background-actions
// npm install @notifee/react-native
// ====================================
// 2. BLE Background Service
// ====================================
import notifee, { AndroidImportance } from "@notifee/react-native";
import BackgroundService from "react-native-background-actions";

import { BLEDeviceInfo, useBLEStore } from "../store/ble.store";
import { usePersistentBLEStore } from "../store/persistanceBLE.store";

interface BackgroundTaskOptions {
  taskName: string;
  taskTitle: string;
  taskDesc: string;
  taskIcon: {
    name: string;
    type: string;
  };
  color?: string;
  parameters?: any;
}

// Background task that keeps BLE alive
const bleBackgroundTask = async (taskData: any) => {
  const { delay } = taskData;

  await new Promise(async (resolve) => {
    // This keeps the service running
    for (let i = 0; BackgroundService.isRunning(); i++) {
      console.log("BLE background service running...", i);

      // Check connection status every 5 seconds
      const state = useBLEStore.getState();

      if (!state.isConnected && state.connectedDevice) {
        console.log("Connection lost, attempting reconnect...");
        // Could trigger reconnection logic here
      }

      // Update notification with current status
      await updateServiceNotification(
        state.isConnected ? "Connected" : "Disconnected",
        state.connectedDevice?.name || "No device",
      );

      // Wait before next check
      await new Promise((resolve: any) => setTimeout(resolve, delay));
    }
  });
};

// Update the foreground service notification
const updateServiceNotification = async (
  status: string,
  deviceName: string,
) => {
  try {
    await notifee.displayNotification({
      id: "ble-service",
      title: "BLE Service Active",
      body: `${status} - ${deviceName}`,
      android: {
        channelId: "ble-service-channel",
        asForegroundService: true,
        ongoing: true,
        pressAction: {
          id: "default",
        },
      },
    });
  } catch (error) {
    console.error("Failed to update notification:", error);
  }
};

// ====================================
// 3. Background Service Manager
// ====================================
export const BLEBackgroundService = {
  // Start background service
  start: async () => {
    try {
      // Create notification channel
      await notifee.createChannel({
        id: "ble-service-channel",
        name: "BLE Service",
        importance: AndroidImportance.LOW,
        sound: undefined,
      });

      const options: BackgroundTaskOptions = {
        taskName: "BLE Background Service",
        taskTitle: "BLE Service Active",
        taskDesc: "Maintaining BLE connection",
        taskIcon: {
          name: "ic_launcher",
          type: "mipmap",
        },
        color: "#00ff00",
        parameters: {
          delay: 5000, // Check every 5 seconds
        },
      };

      await BackgroundService.start(bleBackgroundTask, options);
      console.log("BLE background service started");

      // Update persistent settings
      usePersistentBLEStore.getState().updateSettings({
        backgroundMode: true,
      });

      return true;
    } catch (error) {
      console.error("Failed to start background service:", error);
      return false;
    }
  },

  // Stop background service
  stop: async () => {
    try {
      await BackgroundService.stop();
      await notifee.cancelNotification("ble-service");
      console.log("BLE background service stopped");

      // Update persistent settings
      usePersistentBLEStore.getState().updateSettings({
        backgroundMode: false,
      });

      return true;
    } catch (error) {
      console.error("Failed to stop background service:", error);
      return false;
    }
  },

  // Check if service is running
  isRunning: () => {
    return BackgroundService.isRunning();
  },

  // Update service notification
  updateNotification: updateServiceNotification,
};

// ====================================
// 4. Auto-reconnect Logic
// ====================================
export const setupAutoReconnect = () => {
  const { isConnected, connectedDevice, connectToDevice } =
    useBLEStore.getState();
  const { settings, getMostRecentDevice } = usePersistentBLEStore.getState();

  if (!settings.autoReconnect) {
    console.log("Auto-reconnect disabled");
    return;
  }

  if (isConnected) {
    console.log("Already connected");
    return;
  }

  // Try to reconnect to last device
  const lastDevice = getMostRecentDevice();
  if (lastDevice) {
    console.log("Attempting auto-reconnect to:", lastDevice.name);

    setTimeout(() => {
      connectToDevice({
        id: lastDevice.id,
        name: lastDevice.name,
        isESP32: true,
        lastSeen: new Date(),
      });
    }, 2000); // Wait 2 seconds before reconnecting
  } else {
    console.log("No previous device found for auto-reconnect");
  }
};

// ====================================
// 5. Integration with existing BLE store
// ====================================

// Add these to your existing useBLEStore.ts:

// In connectToDevice function, after successful connection:
export const enhancedConnectToDevice = async (deviceInfo: BLEDeviceInfo) => {
  const success = await useBLEStore.getState().connectToDevice(deviceInfo);

  if (success) {
    // Save device to persistent storage
    usePersistentBLEStore
      .getState()
      .updateDeviceConnection(deviceInfo.id, deviceInfo.name);

    // Start background service if enabled
    const { settings } = usePersistentBLEStore.getState();
    if (settings.backgroundMode) {
      await BLEBackgroundService.start();
    }
  }

  return success;
};

// In disconnect function:
export const enhancedDisconnect = async () => {
  await useBLEStore.getState().disconnect();

  // Stop background service
  if (BLEBackgroundService.isRunning()) {
    await BLEBackgroundService.stop();
  }
};

// When receiving messages, save to history:
export const saveMessageToHistory = (message: any) => {
  const storedMessage = {
    id: message.id,
    type: message.type,
    content: message.content,
    timestamp: message.timestamp.toISOString(),
    deviceId: message.deviceId,
    deviceName: message.deviceName,
    isIncoming: message.isIncoming,
  };

  usePersistentBLEStore.getState().addMessage(storedMessage);
};

// ====================================
// 6. Usage Example Component
// ====================================

/*
import React, { useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import { BLEBackgroundService, setupAutoReconnect } from './BLEBackgroundService';
import { useBLESettings } from './usePersistentBLEStore';

const BLEControlScreen = () => {
  const { settings, updateSettings } = useBLESettings();

  useEffect(() => {
    // Setup auto-reconnect on app start
    setupAutoReconnect();
  }, []);

  const toggleBackgroundMode = async () => {
    if (settings.backgroundMode) {
      await BLEBackgroundService.stop();
    } else {
      await BLEBackgroundService.start();
    }
  };

  return (
    <View>
      <Text>Background Mode: {settings.backgroundMode ? 'ON' : 'OFF'}</Text>
      <Button 
        title={settings.backgroundMode ? "Stop Background" : "Start Background"}
        onPress={toggleBackgroundMode}
      />
      
      <Button
        title="Toggle Auto-Reconnect"
        onPress={() => updateSettings({ autoReconnect: !settings.autoReconnect })}
      />
    </View>
  );
};
*/

import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { BleManager, Characteristic, Device } from "react-native-ble-plx";

import { Buffer } from "buffer";

import { ScreenWrapper, Typo } from "@/components";

// Updated UUIDs to match ESP32 code
const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const WRITE_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const NOTIFY_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

const manager = new BleManager();

async function requestPermissions() {
  if (Platform.OS === "android") {
    if (Platform.Version >= 31) {
      // Android 12+
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      // Check if all permissions were granted
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
      // Android 6 - 11
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

const BLEExample: React.FC = () => {
  const [device, setDevice] = useState<Device | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const init = async () => {
      const permissionGranted = await requestPermissions();
      if (!permissionGranted) return;

      const subscription = manager.onStateChange((state) => {
        console.log("BLE State:", state);
        if (state === "PoweredOn") {
          setMessages((prev) => [...prev, "BLE is ready"]);
          subscription.remove();
        } else {
          setMessages((prev) => [...prev, `BLE State: ${state}`]);
        }
      }, true);
    };

    init();

    return () => {
      if (device) {
        device.cancelConnection();
      }
      manager.destroy();
    };
  }, []);

  const scanAndConnect = () => {
    if (isScanning) {
      manager.stopDeviceScan();
      setIsScanning(false);
      return;
    }

    setIsScanning(true);
    setMessages((prev) => [...prev, "Starting scan..."]);

    // Clear any existing connection
    if (device) {
      device.cancelConnection();
      setDevice(null);
      setIsConnected(false);
    }

    const scanTimeout = setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
      setMessages((prev) => [...prev, "Scan timeout - no ESP32 found"]);
    }, 15000); // Increased to 15 seconds

    // Scan with service UUID filter for better results
    manager.startDeviceScan(
      [SERVICE_UUID], // Filter by service UUID
      { allowDuplicates: false }, // Don't show duplicates
      (error, scannedDevice) => {
        if (error) {
          console.error("Scan error:", error);
          setMessages((prev) => [...prev, `Scan error: ${error.message}`]);
          setIsScanning(false);
          clearTimeout(scanTimeout);
          return;
        }

        if (scannedDevice) {
          console.log(
            `Found device: ${scannedDevice.name || "Unknown"} (${scannedDevice.id})`,
          );
          setMessages((prev) => [
            ...prev, 
            `Found: ${scannedDevice.name || "Unknown"} (${scannedDevice.id.substring(0, 8)}...)`
          ]);

          // Check for ESP32 by name or if it has our service
          if (
            scannedDevice.name?.toLowerCase().includes("esp32") ||
            scannedDevice.name === "ESP32_BLE_Server" ||
            scannedDevice.serviceUUIDs?.includes(SERVICE_UUID.toLowerCase())
          ) {
            clearTimeout(scanTimeout);
            setMessages((prev) => [
              ...prev,
              `Found ESP32: ${scannedDevice.name || scannedDevice.id}`,
            ]);
            manager.stopDeviceScan();
            setIsScanning(false);

            connectToDevice(scannedDevice);
          }
        }
      }
    );
  };

  // Alternative scan method without service filter
  const scanAllDevices = () => {
    console.log("Scanning all devices...");
    
    if (isScanning) {
      manager.stopDeviceScan();
      setIsScanning(false);
      return;
    }

    setIsScanning(true);
    setMessages((prev) => [...prev, "Scanning all devices..."]);

    // Clear any existing connection
    if (device) {
      device.cancelConnection();
      setDevice(null);
      setIsConnected(false);
    }

    const foundDevices = new Set();
    
    const scanTimeout = setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
      setMessages((prev) => [...prev, "Scan completed"]);
    }, 15000);

    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.error("Scan error:", error);
        setMessages((prev) => [...prev, `Scan error: ${error.message}`]);
        setIsScanning(false);
        clearTimeout(scanTimeout);
        return;
      }

      if (scannedDevice && !foundDevices.has(scannedDevice.id)) {
        foundDevices.add(scannedDevice.id);
        
        console.log(
          `Found device: ${scannedDevice.name || "Unknown"} (${scannedDevice.id})`,
        );

        const deviceInfo = `${scannedDevice.name || "Unknown"} (${scannedDevice.id.substring(0, 8)}...)`;
        setMessages((prev) => [...prev, `Found: ${deviceInfo}`]);

        // Check for ESP32 by name
        if (
          scannedDevice.name?.toLowerCase().includes("esp32") ||
          scannedDevice.name === "ESP32_BLE_Server" ||
          scannedDevice.name === "ESP32_BLE"
        ) {
          clearTimeout(scanTimeout);
          setMessages((prev) => [
            ...prev,
            `🎯 ESP32 Found: ${scannedDevice.name}`,
          ]);
          manager.stopDeviceScan();
          setIsScanning(false);

          connectToDevice(scannedDevice);
        }
      }
    });
  };

  const connectToDevice = async (scannedDevice: Device) => {
    try {
      setMessages((prev) => [...prev, "Connecting..."]);

      const connectedDevice = await scannedDevice.connect({
        timeout: 10000, // Increased to 10 seconds
      });

      setMessages((prev) => [...prev, "Connected! Discovering services..."]);

      // Discover services and characteristics
      const deviceWithServices =
        await connectedDevice.discoverAllServicesAndCharacteristics();

      setDevice(deviceWithServices);
      setIsConnected(true);

      // Log discovered services
      const services = await deviceWithServices.services();
      setMessages((prev) => [...prev, `Found ${services.length} services`]);
      
      services.forEach((service) => {
        console.log(`Service: ${service.uuid}`);
        setMessages((prev) => [...prev, `Service: ${service.uuid}`]);
      });

      // Set up disconnect handler
      deviceWithServices.onDisconnected((error) => {
        console.log("Device disconnected:", error);
        setIsConnected(false);
        setDevice(null);
        setMessages((prev) => [...prev, "Device disconnected"]);
      });

      // Set up notifications
      try {
        await deviceWithServices.monitorCharacteristicForService(
          SERVICE_UUID,
          NOTIFY_UUID,
          (err, characteristic) => {
            if (err) {
              console.error("Notify error:", err);
              setMessages((prev) => [...prev, `Notify error: ${err.message}`]);
              return;
            }

            if (characteristic?.value) {
              try {
                const msg = Buffer.from(
                  characteristic.value,
                  "base64",
                ).toString("utf8");
                setMessages((prev) => [...prev, `📨 ESP32: ${msg}`]);
              } catch (decodeError: any) {
                console.error("Decode error:", decodeError);
                setMessages((prev) => [
                  ...prev,
                  `Decode error: ${decodeError.message}`,
                ]);
              }
            }
          },
        );
        setMessages((prev) => [...prev, "✅ Notifications enabled"]);
      } catch (notifyError: any) {
        console.error("Failed to enable notifications:", notifyError);
        setMessages((prev) => [
          ...prev,
          `⚠️ Notification setup failed: ${notifyError.message}`,
        ]);
      }
    } catch (err: any) {
      console.error("Connection error:", err);
      setMessages((prev) => [...prev, `❌ Connection failed: ${err.message}`]);
      setIsConnected(false);
      setDevice(null);
    }
  };

  const sendMessage = async () => {
    if (!device || !isConnected) {
      Alert.alert("Not connected", "Please connect to ESP32 first");
      return;
    }

    const message = `Hello ESP32! Time: ${new Date().toLocaleTimeString()}`;
    const base64msg = Buffer.from(message, "utf8").toString("base64");

    try {
      await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        WRITE_UUID,
        base64msg,
      );
      setMessages((prev) => [...prev, `📤 Sent: ${message}`]);
    } catch (err: any) {
      console.error("Write error:", err);
      setMessages((prev) => [...prev, `❌ Send failed: ${err.message}`]);
    }
  };

  const disconnect = async () => {
    if (device) {
      try {
        await device.cancelConnection();
        setDevice(null);
        setIsConnected(false);
        setMessages((prev) => [...prev, "🔌 Disconnected"]);
      } catch (err) {
        console.error("Disconnect error:", err);
      }
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ScreenWrapper>
      <View style={{ padding: 20 }}>
        <Typo>BLE Chat (ESP32 ↔ RN)</Typo>
        <Typo className="mb-4 text-base">
          Service UUID: {SERVICE_UUID}
        </Typo>

        <View style={{ flexDirection: "row", gap: 10, marginVertical: 20 }}>
          <Button
            title={isScanning ? "Stop Scan" : "Smart Scan"}
            onPress={scanAndConnect}
            disabled={isConnected}
          />
          <Button
            title="Scan All"
            onPress={scanAllDevices}
            disabled={isConnected || isScanning}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
          <Button
            title="Send Message"
            onPress={sendMessage}
            disabled={!isConnected}
          />
          <Button
            title="Disconnect"
            onPress={disconnect}
            disabled={!isConnected}
          />
          <Button
            title="Clear"
            onPress={clearMessages}
          />
        </View>

        <Typo className="mb-2 font-bold">
          Status:{" "}
          {isConnected
            ? "🟢 Connected"
            : isScanning
              ? "🔄 Scanning..."
              : "🔴 Disconnected"}
        </Typo>

        <ScrollView className="h-96 bg-gray-100 p-4 rounded-lg" style={{ marginTop: 10 }}>
          {messages.map((m, i) => (
            <Typo key={i} className="mb-2 text-lg">
              [{new Date().toLocaleTimeString()}] {m}
            </Typo>
          ))}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default BLEExample;
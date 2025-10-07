import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

import {
  BLEBackgroundService,
  enhancedConnectToDevice,
  enhancedDisconnect,
  saveMessageToHistory,
  setupAutoReconnect,
} from "../../services/backgroundService";

import { Button, Typo } from "@/components";
import { colors } from "@/constants/theme";
import {
  useBLEConnection,
  useBLEMessages,
  useBLEScanning,
  useBLEStore,
} from "@/store/ble.store";
import useDeviceStore from "@/store/device.store";
import {
  SensorData,
  useBLESettings,
  useSensorData,
} from "@/store/persistanceBLE.store";

const SmokeAlarmApp = () => {
  const navigation = useNavigation();
  const isMounted = useRef(true);
  const vibrationStarted = useRef(false);

  const [deviceData, setDeviceData] = useState<any>();
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [backgroundServiceActive, setBackgroundServiceActive] = useState(false);

  const { initialize, cleanup, bleReady } = useBLEStore();
  const {
    isConnected,
    connectedDevice,
    isConnecting,
    connectToDevice,
    disconnect,
  } = useBLEConnection();
  const { lastMessage, unreadCount, markMessagesAsRead, sendMessage } =
    useBLEMessages();
  const { discoveredDevices, isScanning, startScanning, stopScanning } =
    useBLEScanning();

  const { settings, updateSettings } = useBLESettings();

  const { addSensorData, getSensorData, clearSensorData } = useSensorData();

  const {
    isShowFireDetector,
    isShowHumidity,
    isShowSmokeDetector,
    isShowTemperature,
  } = useDeviceStore();

  useEffect(() => {
    isMounted.current = true;
    // initialize();
    const init = async () => {
      await initialize();

      // Check background service status
      const isRunning = BLEBackgroundService.isRunning();
      setBackgroundServiceActive(isRunning);

      // Setup auto-reconnect if enabled
      if (settings.autoReconnect && bleReady) {
        setTimeout(() => {
          setupAutoReconnect();
        }, 1000);
      }
    };

    init();

    return () => {
      isMounted.current = false;
      // Stop vibration on unmount
      Vibration.cancel();
      // DON'T call cleanup here - it will break hot reload
      // Only cleanup on app close, not component unmount
    };
  }, []);

  useEffect(() => {
    if (lastMessage && isConnected) {
      saveMessageToHistory(lastMessage);
    }
  }, [lastMessage]);

  // Handle messages
  useEffect(() => {
    if (!lastMessage?.content || !isMounted.current) return;

    try {
      const type = lastMessage.content.split(":")[0];

      if (type === "S") {
        const sensorDataString = lastMessage.content.split(":")[1];
        const parts = sensorDataString.split("|");
        const persistSensorData: SensorData = {
          fire: parts[0],
          raw_smoke: parseFloat(parts[1]),
          smoke: parseFloat(parts[2]),
          temperature: parseFloat(parts[3]),
          humidity: parseFloat(parts[4]),
        };
        addSensorData(persistSensorData);
        console.log("Received sensor data:", lastMessage);

        setSensorData((prev) => [...prev, parts]);
      }

      if (unreadCount > 0) {
        markMessagesAsRead();
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }, [lastMessage]);

  const isFireDetected = sensorData[sensorData.length - 1]?.[0] == 1;
  const airQualityValue = sensorData[sensorData.length - 1]?.[1] / 10;
  const isSmokeDetected = sensorData[sensorData.length - 1]?.[2] >= 1.5;
  const temperature = sensorData[sensorData.length - 1]?.[3];
  const humidity = sensorData[sensorData.length - 1]?.[4];

  // Handle vibration with proper cleanup
  useEffect(() => {
    if (isFireDetected && !vibrationStarted.current) {
      vibrationStarted.current = true;
      Vibration.vibrate([0, 500, 200, 500, 200, 500], true);
    } else if (!isFireDetected && vibrationStarted.current) {
      vibrationStarted.current = false;
      Vibration.cancel();
    }

    // Cleanup vibration
    return () => {
      try {
        if (vibrationStarted.current) {
          Vibration.cancel();
          vibrationStarted.current = false;
        }
      } catch (error) {
        // Ignore cleanup errors
        console.warn("Vibration cleanup error:", error);
      }
    };
  }, [isFireDetected]);

  const handleConnectDeviceBtnPress = async () => {
    if (!isMounted.current) return;

    console.log("Connect Device button pressed", bleReady, isScanning);

    try {
      await startScanning();
    } catch (error) {
      console.error("Scan error:", error);
    }
  };

  const handleConnect = async (device: any) => {
    if (!isMounted.current) return;

    try {
      const success = await connectToDevice(device);
      if (success && isMounted.current) {
        setDeviceData(device);
        console.log("Successfully connected to", device.name);
      }
    } catch (error) {
      console.error("Connect error:", error);
    }
  };

  const handleDeviceModalOpen = () => {
    navigation.navigate("DeviceSettingModal" as never);
  };

  const getSignalStrengthColor = (rssi: any) => {
    if (!rssi) return "#9CA3AF";
    if (rssi > -50) return "#10B981";
    if (rssi > -70) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <View className="flex-1 bg-gray-100">
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      <View className="bg-blue-600 px-6 py-4">
        <Typo className="text-white text-3xl font-semibold text-center">
          Fire Detector
        </Typo>
      </View>

      <ScrollView className="flex-1">
        <View
          className="px-6 py-12 items-center"
          style={{
            backgroundColor: isFireDetected
              ? colors.warning
              : isSmokeDetected
                ? colors.alert
                : colors.primary,
          }}>
          <View className="mb-6">
            {!isFireDetected && !isSmokeDetected && (
              <FontAwesome6
                name="house"
                size={64}
                color="white"
                iconStyle="solid"
              />
            )}

            {isSmokeDetected && !isFireDetected && (
              <FontAwesome6
                name="house-circle-exclamation"
                size={64}
                color="white"
                iconStyle="solid"
              />
            )}

            {isFireDetected && (
              <FontAwesome6
                name="house-fire"
                size={64}
                color="white"
                iconStyle="solid"
              />
            )}
          </View>

          <Typo className="text-white text-3xl font-bold">
            {isFireDetected ? "Fire" : isSmokeDetected ? "Smoke/Gas" : "Normal"}
          </Typo>
        </View>

        {!isConnected && (
          <View>
            <Button
              onPress={handleConnectDeviceBtnPress}
              className="bg-blue-400 mx-4 mt-6 rounded-xl px-6 py-12 items-center shadow-sm">
              <Typo className="font-bold text-xl mr-2">
                {isScanning
                  ? "Scanning..."
                  : isConnecting
                    ? "Connecting..."
                    : "Connect Device"}
              </Typo>
              {!isScanning && !isConnecting && (
                <FontAwesome6
                  name="link"
                  size={20}
                  iconStyle="solid"
                  className="ml-2"
                />
              )}
            </Button>
          </View>
        )}

        {!isConnected && isScanning && discoveredDevices.length > 0 && (
          <ScrollView className="mx-4" showsVerticalScrollIndicator={false}>
            {discoveredDevices.map((device) => {
              const isCurrentDevice = connectedDevice?.id === device.id;

              return (
                <TouchableOpacity
                  key={device.id}
                  onPress={() => handleConnect(device)}
                  disabled={isConnecting || isCurrentDevice || isConnected}
                  className={`bg-white border rounded-xl p-4 mb-3 ${
                    isCurrentDevice
                      ? "border-green-300 bg-green-50"
                      : device.isESP32
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200"
                  }`}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View
                        className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                          device.isESP32 ? "bg-blue-100" : "bg-gray-100"
                        }`}>
                        <FontAwesome6
                          name="bluetooth"
                          size={20}
                          color={device.isESP32 ? "#3B82F6" : "#6B7280"}
                          iconStyle="brand"
                        />
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Typo className="text-gray-900 font-medium">
                            {device.name}
                          </Typo>
                          {device.isESP32 && (
                            <View className="ml-2 px-2 py-0.5 bg-blue-100 rounded">
                              <Typo className="text-blue-600 text-xs font-medium">
                                ESP32
                              </Typo>
                            </View>
                          )}
                        </View>
                        <View className="flex-row items-center mt-1">
                          <FontAwesome6
                            name="signal"
                            size={12}
                            color={getSignalStrengthColor(device.rssi)}
                            iconStyle="solid"
                          />
                          <Typo className="text-gray-500 text-sm ml-2">
                            {device.rssi ? `${device.rssi} dBm` : "Unknown"}
                          </Typo>
                        </View>
                      </View>
                    </View>

                    {isConnecting && isCurrentDevice ? (
                      <ActivityIndicator size="small" color="#3B82F6" />
                    ) : isCurrentDevice ? (
                      <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                        <FontAwesome6
                          name="check"
                          size={12}
                          color="white"
                          iconStyle="solid"
                        />
                      </View>
                    ) : (
                      <FontAwesome6
                        name="chevron-right"
                        size={16}
                        color="#D1D5DB"
                        iconStyle="solid"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {isScanning && (
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Typo className="text-blue-700 ml-3">
                    Searching for devices...
                  </Typo>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {isConnected && (
          <View className="bg-white mx-4 mt-6 rounded-2xl px-6 py-6 shadow-lg border border-gray-100">
            {/* Device Header */}
            <View className="flex-row items-center mb-6">
              <View className="w-14 h-14 bg-blue-500 rounded-2xl items-center justify-center mr-4 shadow-md">
                <FontAwesome6
                  name="microchip"
                  size={22}
                  color="white"
                  iconStyle="solid"
                />
              </View>
              <View className="flex-1">
                <Typo className="text-gray-900 text-xl font-bold">
                  {deviceData?.name || "Connected Device"}
                </Typo>
                <View className="flex-row items-center mt-1">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <Typo className="text-green-600 text-sm font-medium">
                    Online (BLE)
                  </Typo>
                </View>
              </View>
              <TouchableOpacity
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                onPress={handleDeviceModalOpen}>
                <FontAwesome6
                  name="gear"
                  size={20}
                  color="#6B7280"
                  iconStyle="solid"
                />
              </TouchableOpacity>
            </View>

            {/* Sensors Grid */}
            <View className="space-y-4">
              {/* Fire Sensor */}
              {isShowFireDetector && (
                <View className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-red-500 rounded-lg items-center justify-center mr-3">
                        <FontAwesome6
                          name="fire"
                          size={16}
                          color="white"
                          iconStyle="solid"
                        />
                      </View>
                      <View className="flex-1">
                        <Typo className="text-gray-900 font-semibold text-base">
                          Fire Detection
                        </Typo>
                        <Typo className="text-gray-500 text-sm">
                          Status Monitor
                        </Typo>
                      </View>
                    </View>
                    <View
                      className={`px-3 py-1 rounded-full`}
                      style={{
                        backgroundColor: isFireDetected ? "#FEE2E2" : "#BBF7D0",
                      }}>
                      <Typo
                        className={`text-sm font-medium ${
                          !isFireDetected ? "text-green-700" : "text-red-700"
                        }`}>
                        {isFireDetected ? "Detected" : "Not Detected"}
                      </Typo>
                    </View>
                  </View>
                </View>
              )}

              {/* Smoke Detector */}
              {isShowSmokeDetector && (
                <View className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-orange-500 rounded-lg items-center justify-center mr-3">
                        <FontAwesome6
                          name="cloud"
                          size={16}
                          color="white"
                          iconStyle="solid"
                        />
                      </View>
                      <View className="flex-1">
                        <Typo className="text-gray-900 font-semibold text-base">
                          Smoke/Gas Detection
                        </Typo>
                        <Typo className="text-gray-500 text-sm">
                          Air Quality
                        </Typo>
                      </View>
                    </View>
                    <View
                      className={`px-3 py-1 rounded-full `}
                      style={{
                        backgroundColor: !isSmokeDetected
                          ? "#BBF7D0"
                          : "#FED7AA",
                      }}>
                      <Typo
                        className={`text-sm font-medium ${
                          !isSmokeDetected
                            ? "text-green-700"
                            : "text-orange-700"
                        }`}>
                        {airQualityValue || "N/A"}
                      </Typo>
                    </View>
                  </View>
                </View>
              )}

              {/* Environmental Readings */}
              <View className="flex-row space-x-3">
                {isShowTemperature && (
                  <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <View className="flex-row items-center mb-2">
                      <View className="w-8 h-8 bg-blue-500 rounded-lg items-center justify-center mr-2">
                        <FontAwesome6
                          name="temperature-half"
                          size={12}
                          color="white"
                          iconStyle="solid"
                        />
                      </View>
                      <Typo className="text-gray-700 font-medium text-sm">
                        Temperature
                      </Typo>
                    </View>
                    <Typo className="text-blue-600 font-bold text-2xl">
                      {temperature || "--"}°
                    </Typo>
                    <Typo className="text-gray-500 text-xs mt-1">Celsius</Typo>
                  </View>
                )}

                {isShowHumidity && (
                  <View className="flex-1 bg-teal-50 rounded-xl p-4 border border-teal-100">
                    <View className="flex-row items-center mb-2">
                      <View className="w-8 h-8 bg-teal-500 rounded-lg items-center justify-center mr-2">
                        <FontAwesome6
                          name="droplet"
                          size={12}
                          color="white"
                          iconStyle="solid"
                        />
                      </View>
                      <Typo className="text-gray-700 font-medium text-sm">
                        Humidity
                      </Typo>
                    </View>
                    <Typo className="text-teal-600 font-bold text-2xl">
                      {humidity || "--"}%
                    </Typo>
                    <Typo className="text-gray-500 text-xs mt-1">Relative</Typo>
                  </View>
                )}
              </View>
            </View>

            {/* Last Updated */}
            <View className="flex-row items-center justify-center mt-6 pt-4 border-t border-gray-100">
              <FontAwesome6
                name="clock"
                size={12}
                color="#6B7280"
                iconStyle="regular"
              />
              <Typo className="text-gray-500 text-sm ml-2">
                Last updated: {new Date().toLocaleTimeString()}
              </Typo>
            </View>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
};

export default SmokeAlarmApp;

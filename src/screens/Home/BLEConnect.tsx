import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenWrapper, Typo } from "@/components";
import {
  MESSAGE_TYPES,
  useBLEConnection,
  useBLEMessages,
  useBLEScanning,
  useBLEStore,
} from "@/store/ble.store";

const BLEConnect = () => {
  // Use the store hooks
  const navigation = useNavigation();
  const { initialize, cleanup, bleReady } = useBLEStore();
  const {
    isConnected,
    connectedDevice,
    isConnecting,
    connectToDevice,
    disconnect,
  } = useBLEConnection();
  const { lastMessage, unreadCount, sendMessage, markMessagesAsRead } =
    useBLEMessages();
  const {
    discoveredDevices,
    isScanning,
    startScanning,
    stopScanning,
    getESP32Devices,
  } = useBLEScanning();

  // Initialize BLE on component mount
  useEffect(() => {
    initialize();
    return cleanup; // Cleanup on unmount
  }, []);

  // Mark messages as read when viewing this screen
  useEffect(() => {
    console.log("lastMessage: ", lastMessage);

    if (unreadCount > 0) {
      markMessagesAsRead();
    }
  }, [unreadCount]);

  const handleConnect = async (device: any) => {
    const success = await connectToDevice(device);
    if (success) {
    //   navigation.goBack();
      console.log("Successfully connected to", device.name);
    }
  };

  const handleTestMessage = async () => {
    const success = await sendMessage(
      "Hello from app!",
      MESSAGE_TYPES.USER_MESSAGE,
    );
    if (success) {
      console.log("Test message sent");
    }
  };

  const getSignalStrengthColor = (rssi: any) => {
    if (!rssi) return "#9CA3AF";
    if (rssi > -50) return "#10B981";
    if (rssi > -70) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <ScreenWrapper backButton>
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="mb-6">
          <Typo className="text-2xl font-bold text-gray-900 mb-2">
            Bluetooth Connection
          </Typo>
          <Typo className="text-gray-500">
            Connect to your ESP32 smoke detection devices
          </Typo>
        </View>

        {/* BLE Status */}
        <View
          className={`p-3 rounded-lg mb-4 ${
            bleReady
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}>
          <View className="flex-row items-center">
            <FontAwesome6
              name="bluetooth"
              size={16}
              color={bleReady ? "#10B981" : "#EF4444"}
              iconStyle="brand"
            />
            <Typo
              className={`ml-2 font-medium ${
                bleReady ? "text-green-800" : "text-red-800"
              }`}>
              Bluetooth: {bleReady ? "Ready" : "Not Ready"}
            </Typo>
          </View>
        </View>

        {/* Connected Device Section */}
        {isConnected && connectedDevice && (
          <View className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-green-500 rounded-full items-center justify-center mr-3">
                  <FontAwesome6
                    name="check"
                    size={16}
                    color="white"
                    iconStyle="solid"
                  />
                </View>
                <View>
                  <Typo className="text-green-800 font-semibold">
                    Connected
                  </Typo>
                  {unreadCount > 0 && (
                    <View className="flex-row items-center mt-1">
                      <View className="w-4 h-4 bg-red-500 rounded-full items-center justify-center mr-1">
                        <Typo className="text-white text-xs font-bold">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </Typo>
                      </View>
                      <Typo className="text-green-700 text-xs">
                        New messages
                      </Typo>
                    </View>
                  )}
                </View>
              </View>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={handleTestMessage}
                  className="bg-blue-100 px-3 py-1 rounded-full">
                  <Typo className="text-blue-600 text-sm font-medium">
                    Test
                  </Typo>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={disconnect}
                  className="bg-red-100 px-3 py-1 rounded-full">
                  <Typo className="text-red-600 text-sm font-medium">
                    Disconnect
                  </Typo>
                </TouchableOpacity>
              </View>
            </View>

            <Typo className="text-gray-800 font-medium">
              {connectedDevice.name || "Unknown Device"}
            </Typo>
            <Typo className="text-gray-600 text-sm">
              ID: {connectedDevice.id.substring(0, 8)}...
            </Typo>

            {/* Last Message Display */}
            {lastMessage && (
              <View className="mt-3 p-3 bg-white rounded border border-green-200">
                <View className="flex-row items-center justify-between mb-1">
                  <Typo className="text-green-700 text-sm font-medium">
                    {lastMessage.isIncoming ? "📨 Received" : "📤 Sent"}
                  </Typo>
                  <Typo className="text-gray-500 text-xs">
                    {lastMessage.timestamp.toLocaleTimeString()}
                  </Typo>
                </View>
                <Typo className="text-gray-800 text-sm">
                  {lastMessage.content}
                </Typo>
                {lastMessage.type !== MESSAGE_TYPES.USER_MESSAGE && (
                  <View className="mt-1 px-2 py-0.5 bg-blue-100 rounded self-start">
                    <Typo className="text-blue-600 text-xs font-medium">
                      {lastMessage.type.replace("_", " ").toUpperCase()}
                    </Typo>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Scan Controls */}
        <View className="flex-row items-center justify-between mb-4">
          <Typo className="text-lg font-semibold text-gray-900">
            Available Devices ({discoveredDevices.length})
          </Typo>
          <TouchableOpacity
            onPress={isScanning ? stopScanning : startScanning}
            disabled={!bleReady || isConnecting}
            className={`flex-row items-center px-4 py-2 rounded-full ${
              isScanning
                ? "bg-gray-100"
                : !bleReady || isConnecting
                  ? "bg-gray-200"
                  : "bg-blue-500"
            }`}>
            {isScanning ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <FontAwesome6
                name="magnifying-glass"
                size={14}
                color={!bleReady || isConnecting ? "#9CA3AF" : "white"}
                iconStyle="solid"
              />
            )}
            <Typo
              className={`text-sm font-medium ml-2 ${
                isScanning
                  ? "text-gray-500"
                  : !bleReady || isConnecting
                    ? "text-gray-400"
                    : "text-white"
              }`}>
              {isScanning ? "Stop Scan" : "Scan"}
            </Typo>
          </TouchableOpacity>
        </View>

        {/* Device List */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {discoveredDevices.length === 0 && !isScanning ? (
            <View className="items-center justify-center py-12">
              <FontAwesome6
                name="bluetooth"
                size={48}
                color="#D1D5DB"
                iconStyle="brand"
              />
              <Typo className="text-gray-400 mt-3 text-center">
                No devices found
              </Typo>
              <Typo className="text-gray-400 text-sm text-center mt-1">
                Tap scan to discover devices
              </Typo>
            </View>
          ) : (
            discoveredDevices.map((device) => {
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
                          <Typo className="text-gray-400 text-xs ml-2">
                            • {device.lastSeen.toLocaleTimeString()}
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
            })
          )}

          {/* Scanning Indicator */}
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

        {/* ESP32 Quick Connect */}
        {getESP32Devices().length > 0 && !isConnected && (
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Typo className="text-blue-700 font-medium">
                  {getESP32Devices().length} ESP32 device(s) found
                </Typo>
                <Typo className="text-blue-600 text-sm">
                  Tap any ESP32 device above to connect
                </Typo>
              </View>
              <FontAwesome6
                name="microchip"
                size={20}
                color="#3B82F6"
                iconStyle="solid"
              />
            </View>
          </View>
        )}

        {/* Footer Info */}
        {/* <View className="bg-gray-50 rounded-lg p-3 mt-4">
          <View className="flex-row items-center">
            <FontAwesome6
              name="circle-info"
              size={16}
              color="#6B7280"
              iconStyle="solid"
            />
            <Typo className="text-gray-600 text-sm ml-2">
              Messages are available throughout the app once connected
            </Typo>
          </View>
        </View> */}
      </View>
    </ScreenWrapper>
  );
};

export default BLEConnect;

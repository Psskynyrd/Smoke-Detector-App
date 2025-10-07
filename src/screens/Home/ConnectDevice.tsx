import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

import { ScreenWrapper, Typo } from "@/components";

const ConnectDevice = () => {
  const navigation = useNavigation();

  const handleWifiConnect = () => {
    navigation.navigate("WifiConnect" as never);
  };

  const handleBluetoothConnect = () => {
    navigation.navigate("BLEConnect" as never);
  };

  return (
    <ScreenWrapper backButton>
      <View className="bg-white rounded-2xl mx-4 overflow-hidden">
        {/* Header */}
        <View className="px-6 pt-12 pb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Typo className="text-xl font-semibold text-gray-900">
              Connect Device
            </Typo>
            <FontAwesome6
              name="link"
              size={20}
              iconStyle="solid"
              className="ml-2"
            />
          </View>
          <Typo className="text-gray-500 text-base">
            Choose your preferred connection method
          </Typo>
        </View>

        {/* Connection Options */}
        <View className="py-12 px-6 pb-6 mt-6">
          {/* WiFi Option */}
          <TouchableOpacity
            onPress={handleWifiConnect}
            className="border-2 border-blue-200 rounded-xl p-4 mb-4 active:bg-blue-50"
            activeOpacity={0.7}>
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                <FontAwesome6
                  name="wifi"
                  size={20}
                  color="#3B82F6"
                  iconStyle="solid"
                />
              </View>
              <View className="flex-1">
                <Typo className="text-gray-900 text-lg font-semibold mb-1">
                  {/* Connect with WiFi */}
                  Connect with AP
                </Typo>
                <Typo className="text-gray-500 text-sm">
                  {/* Use your home network for stable connection */}
                  Use device's Access Point mode for initial setup
                </Typo>
              </View>
              <FontAwesome6
                name="chevron-right"
                size={16}
                color="#9CA3AF"
                iconStyle="solid"
              />
            </View>
          </TouchableOpacity>

          {/* Bluetooth Option */}
          <TouchableOpacity
            onPress={handleBluetoothConnect}
            className="border-2 border-blue-200 rounded-xl p-4"
            activeOpacity={0.7}>
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                <FontAwesome6
                  name="bluetooth"
                  size={20}
                  color="#3B82F6"
                  iconStyle="brand"
                />
              </View>
              <View className="flex-1">
                <Typo className="text-gray-900 text-lg font-semibold mb-1">
                  Connect with Bluetooth
                </Typo>
                <Typo className="text-gray-500 text-sm">
                  Quick pairing for nearby devices
                </Typo>
              </View>
              <FontAwesome6
                name="chevron-right"
                size={16}
                color="#9CA3AF"
                iconStyle="solid"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        {/* <View className="bg-gray-50 px-6 py-4">
          <Typo className="text-center text-gray-500 text-xs">
            Make sure your device is in pairing mode
          </Typo>
        </View> */}
      </View>
    </ScreenWrapper>
  );
};

export default ConnectDevice;

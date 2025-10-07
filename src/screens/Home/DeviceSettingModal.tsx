import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Alert, Text, Touchable, TouchableOpacity, View } from "react-native";

import { Button, Header, Input, ModalWrapper, Typo } from "@/components";
import { useBLEConnection, useBLEMessages } from "@/store/ble.store";
import useDeviceStore from "@/store/device.store";

const DeviceSettingModal = () => {
  const navigation = useNavigation();
  const { disconnect } = useBLEConnection();
  const { sendMessage } = useBLEMessages();
  const {
    toggleShowFireDetector,
    toggleShowHumidity,
    toggleShowSmokeDetector,
    toggleShowTemperature,
    isShowFireDetector,
    isShowHumidity,
    isShowSmokeDetector,
    isShowTemperature,
  } = useDeviceStore();

  const [wifiDetails, setWifiDetails] = React.useState({
    ssid: "",
    password: "",
  });

  return (
    <ModalWrapper>
      <Header title="Device Card Configs" />
      <View className="border-b border-gray-200 my-4"></View>
      <View>
        <View className="flex-row justify-between items-center">
          <Typo className="text-lg font-semibold mt-2">Fire Detector</Typo>
          <TouchableOpacity onPress={toggleShowFireDetector}>
            {isShowFireDetector ? (
              <FontAwesome6
                name="toggle-on"
                size={40}
                color="#4ade80"
                iconStyle="solid"
              />
            ) : (
              <FontAwesome6
                name="toggle-off"
                size={40}
                color="#d1d5db"
                iconStyle="solid"
              />
            )}
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-between items-center">
          <Typo className="text-lg font-semibold mt-2">Smoke/Gas Detector</Typo>
          <TouchableOpacity onPress={toggleShowSmokeDetector}>
            {isShowSmokeDetector ? (
              <FontAwesome6
                name="toggle-on"
                size={40}
                color="#4ade80"
                iconStyle="solid"
              />
            ) : (
              <FontAwesome6
                name="toggle-off"
                size={40}
                color="#d1d5db"
                iconStyle="solid"
              />
            )}
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-between items-center">
          <Typo className="text-lg font-semibold mt-2">Temperature</Typo>
          <TouchableOpacity onPress={toggleShowTemperature}>
            {isShowTemperature ? (
              <FontAwesome6
                name="toggle-on"
                size={40}
                color="#4ade80"
                iconStyle="solid"
              />
            ) : (
              <FontAwesome6
                name="toggle-off"
                size={40}
                color="#d1d5db"
                iconStyle="solid"
              />
            )}
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-between items-center">
          <Typo className="text-lg font-semibold mt-2">Humidity</Typo>
          <TouchableOpacity onPress={toggleShowHumidity}>
            {isShowHumidity ? (
              <FontAwesome6
                name="toggle-on"
                size={40}
                color="#4ade80"
                iconStyle="solid"
              />
            ) : (
              <FontAwesome6
                name="toggle-off"
                size={40}
                color="#d1d5db"
                iconStyle="solid"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* <View>
        <Typo className="font-semibold">Connect Device to Wifi</Typo>
        <View>
          <Typo className="text-xs mt-2">SSID</Typo>
          <Input
            placeholder="Enter SSID"
            onChangeText={(val) =>
              setWifiDetails({ ...wifiDetails, ssid: val })
            }
          />
          <Typo className="text-xs mt-2">Password</Typo>
          <Input
            placeholder="Enter Password"
            onChangeText={(val) =>
              setWifiDetails({ ...wifiDetails, password: val })
            }
          />
        </View>
        <Button
          onPress={() => {
            if (!wifiDetails.ssid || !wifiDetails.password)
              Alert.alert("Invalid wifi details", "Please enter wifi details");

            sendMessage(`WIFI:${wifiDetails.ssid}|${wifiDetails.password}`);
          }}
          className="mt-4 py-4">
          <Typo className="font-semibold text-white text-xl">
            Connect to Wifi
          </Typo>
        </Button>
      </View> */}

      <View className="border-b border-gray-200 my-4"></View>

      {/* <View>
        <Button
          onPress={() => {
            disconnect().then(() => {
              navigation.goBack();
            });
          }}
          className="bg-warning">
          Disconnect Device
        </Button>
      </View> */}
    </ModalWrapper>
  );
};

export default DeviceSettingModal;

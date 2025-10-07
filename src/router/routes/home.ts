import { Device } from "react-native-ble-plx";
import { BLEConnect, DeviceSettingModal, HardwareControl, Home, Statistics } from "../../screens";

import ConnectDeviceModal from "@/screens/Home/ConnectDevice";

export default [
  {
    name: "Home",
    component: Home,
    meta: {
      isActive: true,
      isPublic: true,
      showHeader: false,
      isTab: true,
      isModal: false,
    },
  },
  {
    name: "ConnectDeviceModal",
    component: ConnectDeviceModal,
    meta: {
      isActive: true,
      isPublic: true,
      showHeader: false,
      isTab: false,
      isModal: false,
    },
  },
  {
    name: "BLEConnect",
    component: BLEConnect,
    meta: {
      isActive: true,
      isPublic: true,
      showHeader: false,
      isTab: false,
      isModal: false,
    },
  },
  {
    name: "HardwareControl",
    component: HardwareControl,
    meta: {
      isActive: true,
      isPublic: true,
      showHeader: false,
      isTab: false,
      isModal: false,
    },
  },
  {
    name: "DeviceSettingModal",
    component: DeviceSettingModal,
    meta: {
      isActive: true,
      isPublic: true,
      showHeader: false,
      isTab: false,
      isModal: true,
    },
  },
  {
    name: "Statistics",
    component: Statistics,
    meta: {
      isActive: true,
      isPublic: true,
      showHeader: false,
      isTab: false,
      isModal: false,
    },
  },
];

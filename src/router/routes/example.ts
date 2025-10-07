import {
  BLEExample,
  ExampleTab,
  InputExample,
  ModalExample,
  ServiceExample,
  ThemeExample,
} from "../../screens";

export default [
  {
    name: "ExampleTab",
    component: ExampleTab,
    meta: {
      isActive: true,
      isPublic: true,
      showHeader: false,
      isTab: false,
      isModal: false,
    },
  },
  {
    name: "ModalExample",
    component: ModalExample,
    meta: {
      isActive: true,
      isPublic: true,
      showHeader: false,
      isTab: false,
      isModal: true,
    },
  },
  {
    name: "ThemeExample",
    component: ThemeExample,
    meta: {
      isActive: true,
      isPublic: true,
      showHeader: false,
      isTab: false,
      isModal: false,
    },
  },
  {
    name: "InputExample",
    component: InputExample,
    meta: {
      isActive: true,
      isPublic: true,
      showHeader: false,
      isTab: false,
      isModal: true,
    },
  },
  {
    name: "ServiceExample",
    component: ServiceExample,
    meta: {
      isActive: true,
      isPublic: true,
      showHeader: false,
      isTab: false,
      isModal: false,
    },
  },
  {
    name: "BLEExample",
    component: BLEExample,
    meta: {
      isActive: true,
      isPublic: true,
      showHeader: false,
      isTab: false,
      isModal: false,
    },
  },
];

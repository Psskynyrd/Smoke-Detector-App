import { Theme } from "@react-navigation/native";

import { scale, verticalScale } from "@/utils/styling";

export const colors = {
  primary: "#1E88E5",
  primaryLight: "#0ea5e9",
  primaryDark: "#0369a1",
  text: "#fff",
  textLight: "#e5e5e5",
  textLighter: "#d4d4d4",
  white: "#fff",
  black: "#000",
  warning: "#E53935",
  success: "#43A047",
  background: "#F5F5F5",
  txt1: "#212121",
  txt2: "#616161",
  alert: "#FFB300",
  neutral50: "#fafafa",
  neutral100: "#f5f5f5",
  neutral200: "#e5e5e5",
  neutral300: "#d4d4d4",
  neutral350: "#CCCCCC",
  neutral400: "#a3a3a3",
  neutral500: "#737373",
  neutral600: "#525252",
  neutral700: "#404040",
  neutral800: "#262626",
  neutral900: "#171717",
};

export const spacingX = {
  _3: scale(3),
  _5: scale(5),
  _7: scale(7),
  _10: scale(10),
  _12: scale(12),
  _15: scale(15),
  _20: scale(20),
  _25: scale(25),
  _30: scale(30),
  _35: scale(35),
  _40: scale(40),
};

export const spacingY = {
  _5: verticalScale(5),
  _7: verticalScale(7),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _25: verticalScale(25),
  _30: verticalScale(30),
  _35: verticalScale(35),
  _40: verticalScale(40),
  _50: verticalScale(50),
  _60: verticalScale(60),
};

export const radius = {
  _3: verticalScale(3),
  _6: verticalScale(6),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _30: verticalScale(30),
};

export const fonts: Theme["fonts"] = {
  regular: { fontFamily: "SpaceMono-Regular", fontWeight: "400" as const },
  medium: { fontFamily: "SpaceMono-Regular", fontWeight: "500" as const },
  bold: { fontFamily: "SpaceMono-Regular", fontWeight: "700" as const },
  heavy: { fontFamily: "SpaceMono-Regular", fontWeight: "900" as const },
};

export const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.neutral50,
    card: colors.neutral300,
    text: colors.neutral900,
    border: colors.neutral500,
    notification: colors.green,
  },
  fonts,
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.neutral900,
    card: colors.neutral600,
    text: colors.white,
    border: colors.neutral100,
    notification: colors.green,
  },
  fonts,
};

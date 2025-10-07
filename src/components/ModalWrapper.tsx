import {  spacingY } from "@/constants/theme";
import { ModalWrapperProps } from "@/types/app.types";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import BackButton from "./BackButton";
import useThemeStore from "@/store/theme.store";

const isIos = Platform.OS === "ios";
const ModalWrapper = ({
  children,
}: ModalWrapperProps) => {
  const { mode } = useThemeStore();
  const isDarkMode = mode === 'dark';

  return (
    <View
    className={`flex-1 rounded-[20px] border `}
    style={[styles.container,
      {
        backgroundColor: isDarkMode ? "#212121" : "#F5F5F5",
      },
    ]}
     >
      {children}
      <BackButton />
    </View>
  );
};

export default ModalWrapper;

const styles = StyleSheet.create({
  container: {
    paddingTop: isIos ? spacingY._15 : spacingY._20,
    paddingBottom: isIos ? spacingY._20 : spacingY._10,
    borderCurve: "continuous",
    paddingHorizontal: spacingY._12,
  },
});

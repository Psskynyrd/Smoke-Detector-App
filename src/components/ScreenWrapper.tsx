// import { colors } from '@/constants/theme';
import React from "react";
import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  View
} from "react-native";

import useThemeStore from "@/store/theme.store";
import { ScreenWrapperProps } from "@/types/app.types";

import BackButton from "./BackButton";

const ScreenWrapper = ({ backButton, style, children }: ScreenWrapperProps) => {
  const { mode } = useThemeStore();

  return (
    <View
      style={[
        {
          flex: 1,
        },
        style,
      ]}>
      <StatusBar
        barStyle={mode === "dark" ? "light-content" : "dark-content"}
      />
      {children}
      {backButton && <BackButton />}
    </View>
  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({});

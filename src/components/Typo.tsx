import React from "react";
import { StyleSheet, Text } from "react-native";

import useThemeStore from "@/store/theme.store";
import { TypoProps } from "@/types/app.types";

const Typo = ({ children, className = "", textProps = {}, style }: TypoProps) => {
  const { mode } = useThemeStore();

  const themeClass = mode === "dark" ? "text-white" : "text-txt1";

  return (
    <Text {...textProps} className={`${className || ""} ${themeClass}`} style={style}>
      {children}
    </Text>
  );
};

export default Typo;

const styles = StyleSheet.create({});

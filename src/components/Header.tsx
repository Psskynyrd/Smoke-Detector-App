import React from "react";
import { StyleSheet, View } from "react-native";

import { Typo } from ".";

import { HeaderProps } from "@/types/app.types";

const Header = ({ title = "", leftIcon }: HeaderProps) => {
  return (
    <View className="w-100 justify-center flex-row">
      {leftIcon && <View className="align-self-start">{leftIcon}</View>}
      {title && (
        <Typo
          className={`text-center text-3xl font-bold ${leftIcon ? "w-80" : "w-100"} `}>
          {title}
        </Typo>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({});

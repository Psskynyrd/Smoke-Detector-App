import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { BackButtonProps } from "@/types/app.types";

const BackButton = ({ style, iconSize = 26 }: BackButtonProps) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.canGoBack() && navigation.goBack()}
      className={
        "absolute bottom-6 left-6 w-12 h-12 items-center justify-center rounded-full bg-primary shadow-lg"
      }>
      <FontAwesome6
        name="angle-left"
        iconStyle="solid"
        color="white"
        size={iconSize}
      />
    </TouchableOpacity>
  );
};

export default BackButton;

const styles = StyleSheet.create({});

import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { CustomButtonProps } from "@/types/app.types";
import Loading from "./Loading";
import Typo from "./Typo";

const Button = ({
  className,
  onPress,
  loading = false,
  children,
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`bg-primary rounded-3xl my-2 py-2 px-4 flex-row  justify-center items-center ${className || ""}`}>
      {loading ? (
        <Loading />
      ) : typeof children === "string" ? (
        <Typo className="font-bold">{children}</Typo>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({});

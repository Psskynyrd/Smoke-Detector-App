import React from "react";
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  StyleSheet,
  View,
} from "react-native";

const Loading = (props: ActivityIndicatorProps) => {
  return (
    <View className=" items-center justify-center">
      <ActivityIndicator size="small" className="text-success" />
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({});

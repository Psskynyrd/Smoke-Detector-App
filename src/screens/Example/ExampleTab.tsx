import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Header, RouterList, ScreenWrapper, Typo } from "@/components";
import { RouterType } from "@/types/app.types";

const exampleRoutes: RouterType[] = [
  {
    title: "Theme Example",
    routeName: "ThemeExample",
  },
  {
    title: "Modal Example",
    routeName: "ModalExample",
  },
  {
    title: "Input Example",
    routeName: "InputExample",
  },
  {
    title: "Service Example",
    routeName: "ServiceExample",
  },
  {
    title: "BLE Example",
    routeName: "BLEExample",
  },
];

const ExampleTab = () => {
  const [loading, setLoading] = useState(false);
  return (
    <ScreenWrapper>
      <View className="flex-1 items-center">
        <Header title="Example Tab" />
        <View className="flex-1 w-full">
          <RouterList
            data={exampleRoutes}
            title="Example List"
            loading={loading}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default ExampleTab;

const styles = StyleSheet.create({});

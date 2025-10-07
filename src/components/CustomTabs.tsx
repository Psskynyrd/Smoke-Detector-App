import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import {
  Platform,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

import { colors, radius, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";

const CustomTabs = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const tabbarIcons: any = {
    Home: (isFocused: boolean) => (
      <FontAwesome6
        name="house"
        iconStyle="solid"
        size={verticalScale(20)}
        color={isFocused ? colors.primary : colors.neutral400}
      />
    ),
    // HardwareControl: (isFocused: boolean) => (
    //   <FontAwesome6
    //     name="microchip"
    //     iconStyle="solid"
    //     size={verticalScale(20)}
    //     color={isFocused ? colors.primary : colors.neutral400}
    //   />
    // ),
    // Statistics: (isFocused: boolean) => (
    //   <FontAwesome6
    //     name="chart-simple"
    //     iconStyle="solid"
    //     size={verticalScale(20)}
    //     color={isFocused ? colors.primary : colors.neutral400}
    //   />
    // ),
  };

  return (
    <View
      style={styles.tabbar}
      className="flex-row w-full justify-around items-center border-t border-neutral-700 bg-neutral-800">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label: any =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          ToastAndroid.show(label, ToastAndroid.LONG);
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            className="justify-center items-center"
            style={styles.tabbarItem}>
            {tabbarIcons[route.name] && tabbarIcons[route.name](isFocused)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomTabs;

const styles = StyleSheet.create({
  tabbar: {
    height: Platform.OS === "ios" ? verticalScale(73) : verticalScale(55),
    // borderRadius: radius._20,
    // borderCurve: "continuous",
  },
  tabbarItem: {
    marginBottom: Platform.OS === "ios" ? spacingY._10 : spacingY._5,
  },
});

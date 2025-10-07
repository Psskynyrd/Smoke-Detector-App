import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import React from "react";
import { Text, View } from "react-native";

import { Input, ModalWrapper, Typo } from "@/components";
import { verticalScale } from "@/utils/styling";
import { colors } from "@/constants/theme";
import useThemeStore from "@/store/theme.store";

const InputExample = () => {
  const {mode} = useThemeStore();
  const isDarkMode = mode === "dark";
  return (
    <ModalWrapper>
      <View className="flex-1 items-center">
        <Typo className="font-semibold text-3xl">Input Example</Typo>
        <View className="gap-2 w-full">
          <Typo className="font-bold">Email</Typo>
          <Input
            placeholder="Enter your email"
            onChangeText={(val) => console.log(val)}
            keyboardType="email-address"
            textContentType="emailAddress"
            icon={
              <FontAwesome6
                name="otter"
                iconStyle="solid"
                size={verticalScale(20)}
                color={colors.primary}
              />
            }
          />
        </View>
      </View>
    </ModalWrapper>
  );
};

export default InputExample;

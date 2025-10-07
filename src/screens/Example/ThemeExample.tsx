import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Button, ScreenWrapper, Typo } from '@/components';
import { colors } from '@/constants/theme';
import useThemeStore from '@/store/theme.store';

const ThemeExample = () => {
  const { toggle } = useThemeStore();
  return (
    <ScreenWrapper backButton>
      <View>
        <Typo fontWeight="600">Theme Example</Typo>
        <Button
          onPress={toggle}
          style={{ marginTop: 20, paddingHorizontal: 20 }}
        >
          <Typo color={colors.black} fontWeight="600">
            Toggle Theme
          </Typo>
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default ThemeExample;

const styles = StyleSheet.create({});

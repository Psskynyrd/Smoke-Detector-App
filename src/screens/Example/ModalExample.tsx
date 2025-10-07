import { StyleSheet, View } from 'react-native';
import React from 'react';
import {  Header, ModalWrapper, Typo } from '@/components';

const ModalExample = () => {
  return (
    <ModalWrapper>
    <View>
      <Header
          title="Modal Example"
          // leftIcon={<BackButton />}
        />
      <Typo className='font-semibold'>DarkMode:</Typo>
    </View>
    </ModalWrapper>
  );
};

export default ModalExample;

const styles = StyleSheet.create({});

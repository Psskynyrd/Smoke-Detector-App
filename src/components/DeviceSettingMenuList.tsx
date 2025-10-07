import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { RouterListItemProps, RouterListType } from '@/types/app.types';
import { verticalScale } from '@/utils/styling';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Loading from './Loading';
import Typo from './Typo';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

const { height } = Dimensions.get('window');

const DeviceSettingMenuList = ({
  data,
  title,
  loading,
  emptyListMessage,
}: RouterListType) => {
  const navigation = useNavigation();
  const handleClick = (itemRoute: string) => {
    navigation.navigate(itemRoute as never);
  };

  return (
    <View style={styles.container}>
      {title && (
        <Typo size={16} fontWeight={'500'}>
          {title}
        </Typo>
      )}

      <View style={styles.list}>
        <FlashList
          data={data}
          renderItem={({ item, index }) => (
            <ListItem item={item} index={index} handleClick={handleClick} />
          )}
            // estimatedItemSize={60}
        />
      </View>

      {!loading && data.length === 0 && (
        <Typo
          // style={{ textAlign: 'center', marginTop: spacingY._15 }}
          className='text-center mt-5'
        >
          {emptyListMessage || 'No transactions found.'}
        </Typo>
      )}

      {loading && (
        <View style={{ top: verticalScale(100) }}>
          <Loading />
        </View>
      )}
    </View>
  );
};

const ListItem = ({ item, index, handleClick }: RouterListItemProps) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50)
        .springify()
        .damping(14)}
    >
      <TouchableOpacity
        style={styles.row}
        className='bg-primary'
        onPress={() => handleClick(item.routeName)}
      >
        <View style={styles.categoryDes}>
          <Typo className='text-2xl font-bold'>{item?.title}</Typo>
        </View>

        <View style={styles.amountData}>
          <FontAwesome6
            name="chevron-right"
            iconStyle="solid"
            size={verticalScale(20)}
            color={colors.neutral100}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default DeviceSettingMenuList;

const styles = StyleSheet.create({
  container: {
    gap: spacingY._17,
  },
  list: {
    minHeight: height,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacingX._12,
    marginBottom: spacingY._12,

    // list with background
    // backgroundColor: colors.neutral500,
    padding: spacingY._10,
    paddingHorizontal: spacingY._10,
    borderRadius: radius._17,
  },
  icon: {
    height: verticalScale(44),
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius._12,
    borderCurve: 'continuous',
  },
  categoryDes: {
    flex: 1,
    gap: 2.5,
  },
  amountData: {
    alignItems: 'flex-end',
    gap: 3,
  },
});

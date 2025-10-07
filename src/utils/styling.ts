import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const [shortDimetion, longDimetion] =
  SCREEN_WIDTH < SCREEN_HEIGHT
    ? [SCREEN_WIDTH, SCREEN_HEIGHT]
    : [SCREEN_HEIGHT, SCREEN_WIDTH];

const guildLineBaseWidth = 375;
const guildLineBaseHeight = 812;

export const scale = (size: number) =>
  Math.round(
    PixelRatio.roundToNearestPixel(shortDimetion / guildLineBaseWidth) *
      (size as number)
  );

export const verticalScale = (size: number) =>
  Math.round(
    PixelRatio.roundToNearestPixel(longDimetion / guildLineBaseHeight) *
      (size as number)
  );

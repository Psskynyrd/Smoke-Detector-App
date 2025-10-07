import { create } from "zustand";

interface DeviceState {
  isShowFireDetector: boolean;
  isShowSmokeDetector: boolean;
  isShowTemperature: boolean;
  isShowHumidity: boolean;

  setShowFireDetector: (value: boolean) => void;
  setShowSmokeDetector: (value: boolean) => void;
  setShowTemperature: (value: boolean) => void;
  setShowHumidity: (value: boolean) => void;

  toggleShowFireDetector?: () => void;
  toggleShowSmokeDetector?: () => void;
  toggleShowTemperature?: () => void;
  toggleShowHumidity?: () => void;
}

const useDeviceStore = create<DeviceState>()((set, get) => ({
  isShowFireDetector: true,
  isShowSmokeDetector: true,
  isShowTemperature: true,
  isShowHumidity: true,
  
  setShowFireDetector: (value: boolean) => set({ isShowFireDetector: value }),
  setShowSmokeDetector: (value: boolean) => set({ isShowSmokeDetector: value }),
  setShowTemperature: (value: boolean) => set({ isShowTemperature: value }),
  setShowHumidity: (value: boolean) => set({ isShowHumidity: value }),

  toggleShowFireDetector: () =>
    set({ isShowFireDetector: !get().isShowFireDetector }),
  toggleShowSmokeDetector: () =>
    set({ isShowSmokeDetector: !get().isShowSmokeDetector }),
  toggleShowTemperature: () =>
    set({ isShowTemperature: !get().isShowTemperature }),
  toggleShowHumidity: () => set({ isShowHumidity: !get().isShowHumidity }),
}));

export default useDeviceStore;

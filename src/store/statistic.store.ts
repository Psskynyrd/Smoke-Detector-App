import { create } from "zustand";

import { DeviceStats, SensorReading, firebaseService } from "@/services/firebaseService";

export interface ChartDataPoint {
  x: Date;
  y: number;
  label?: string;
}

interface StatisticsState {
  // Data
  readings: SensorReading[];
  deviceStats: DeviceStats[];
  temperatureData: ChartDataPoint[];
  humidityData: ChartDataPoint[];

  // UI State
  selectedDevice: string | null;
  selectedTimeRange: "day" | "week" | "month" | "year";
  isLoading: boolean;
  error: string | null;

  // Real-time subscription
  unsubscribe: (() => void) | null;

  // Actions
  setSelectedDevice: (deviceId: string | null) => void;
  setSelectedTimeRange: (range: "day" | "week" | "month" | "year") => void;
  loadReadings: () => Promise<void>;
  loadDeviceStats: (deviceId: string) => Promise<void>;
  addSensorReading: (
    reading: Omit<SensorReading, "id" | "timestamp">,
  ) => Promise<void>;
  subscribeToRealTimeReadings: (deviceId?: string) => void;
  unsubscribeFromRealTime: () => void;
  processChartData: (readings: SensorReading[]) => void;
  getReadingsInDateRange: (days: number) => Promise<void>;
}

export const useStatisticsStore = create<StatisticsState>((set, get) => ({
  // Initial state
  readings: [],
  deviceStats: [],
  temperatureData: [],
  humidityData: [],
  selectedDevice: null,
  selectedTimeRange: "day",
  isLoading: false,
  error: null,
  unsubscribe: null,

  // Actions
  setSelectedDevice: (deviceId) => {
    set({ selectedDevice: deviceId });
    if (deviceId) {
      get().loadDeviceStats(deviceId);
      get().subscribeToRealTimeReadings(deviceId);
    } else {
      get().subscribeToRealTimeReadings();
    }
  },

  setSelectedTimeRange: (range) => {
    set({ selectedTimeRange: range });
    const days =
      range === "day" ? 1 : range === "week" ? 7 : range === "month" ? 30 : 365;
    get().getReadingsInDateRange(days);
  },

  loadReadings: async () => {
    set({ isLoading: true, error: null });
    try {
      const { selectedDevice } = get();
      const readings = await firebaseService.getRecentReadings(
        selectedDevice || undefined,
        100,
      );
      set({ readings });
      get().processChartData(readings);
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  loadDeviceStats: async (deviceId) => {
    try {
      const stats = await firebaseService.getDeviceStats(deviceId);
      if (stats) {
        set((state) => ({
          deviceStats: [
            ...state.deviceStats.filter((s) => s.deviceId !== deviceId),
            stats,
          ],
        }));
      }
    } catch (error) {
      console.error("Error loading device stats:", error);
    }
  },

  addSensorReading: async (reading) => {
    try {
      await firebaseService.addSensorReading(reading);
      // Real-time listener will update the state automatically
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  subscribeToRealTimeReadings: (deviceId) => {
    // Clean up previous subscription
    get().unsubscribeFromRealTime();

    const unsubscribe = firebaseService.subscribeToReadings(
      (readings: SensorReading[]) => {
        set({ readings });
        get().processChartData(readings);
      },
      deviceId,
      50,
    );

    set({ unsubscribe });
  },

  unsubscribeFromRealTime: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },

  processChartData: (readings) => {
    const temperatureData: ChartDataPoint[] = readings
      .filter((r) => r.temperature !== null && r.temperature !== undefined)
      .map((r) => ({
        x: r.createdAt || new Date(),
        y: r.temperature,
        label: `${r.temperature}°C`,
      }))
      .reverse(); // Reverse to show chronological order

    const humidityData: ChartDataPoint[] = readings
      .filter((r) => r.humidity !== null && r.humidity !== undefined)
      .map((r) => ({
        x: r.createdAt || new Date(),
        y: r.humidity,
        label: `${r.humidity}%`,
      }))
      .reverse();

    set({ temperatureData, humidityData });
  },

  getReadingsInDateRange: async (days) => {
    set({ isLoading: true, error: null });
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const { selectedDevice } = get();
      const readings = await firebaseService.getReadingsInRange(
        startDate,
        endDate,
        selectedDevice || undefined,
      );

      set({ readings });
      get().processChartData(readings);
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
}));

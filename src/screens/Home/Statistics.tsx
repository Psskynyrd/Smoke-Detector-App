import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";

import { Typo } from "@/components";
import { useStatisticsStore } from "@/store/statistic.store";

const { width: screenWidth } = Dimensions.get("window");

const StatisticsPage: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const {
    readings,
    temperatureData,
    humidityData,
    selectedTimeRange,
    isLoading,
    error,
    setSelectedTimeRange,
    loadReadings,
    subscribeToRealTimeReadings,
    unsubscribeFromRealTime,
  } = useStatisticsStore();

  useEffect(() => {
    loadReadings();
    subscribeToRealTimeReadings();
    return () => unsubscribeFromRealTime();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReadings();
    setRefreshing(false);
  };

  // Prepare chart data
  const getChartData = (data: any[], label: string) => {
    if (data.length === 0) return null;

    const last7Points = data.slice(-7);
    return {
      labels: last7Points.map((_, index) => `${index + 1}`),
      datasets: [
        {
          data: last7Points.map((d) => d.y),
          color: (opacity = 1) =>
            label === "Temperature"
              ? `rgba(239, 68, 68, ${opacity})`
              : `rgba(20, 184, 166, ${opacity})`,
          strokeWidth: 3,
        },
      ],
      legend: [label],
    };
  };

  const temperatureChartData = getChartData(temperatureData, "Temperature");
  const humidityChartData = getChartData(humidityData, "Humidity");

  const getLatestReading = () => readings[0];
  const getAverageTemperature = () => {
    if (temperatureData.length === 0) return 0;
    return (
      Math.round(
        (temperatureData.reduce((sum, d) => sum + d.y, 0) /
          temperatureData.length) *
          10,
      ) / 10
    );
  };

  const getAverageHumidity = () => {
    if (humidityData.length === 0) return 0;
    return (
      Math.round(
        (humidityData.reduce((sum, d) => sum + d.y, 0) / humidityData.length) *
          10,
      ) / 10
    );
  };

  const getAlertCount = () => {
    return readings.filter(
      (r) =>
        (r.fire !== "Normal" && r.fire !== "Clear") ||
        (r.smoke !== "Clear" && r.smoke !== "Normal"),
    ).length;
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
    },
  };

  const TimeRangeSelector = () => (
    <View className="flex-row bg-gray-100 rounded-xl p-1 mb-6">
      {(["day", "week", "month", "year"] as const).map((range) => (
        <View key={range} className="flex-1">
          <TouchableOpacity
            onPress={() => setSelectedTimeRange(range)}
            className={`py-2 px-4 rounded-lg ${selectedTimeRange === range ? "bg-white shadow-sm" : ""}`}>
            <Typo
              className={`text-center font-medium capitalize ${
                selectedTimeRange === range ? "text-blue-600" : "text-gray-600"
              }`}>
              {range}
            </Typo>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {/* Header */}
      <View className="bg-white px-6 py-8 shadow-sm">
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 bg-blue-500 rounded-2xl items-center justify-center mr-4">
            <FontAwesome6
              name="chart-line"
              size={20}
              color="white"
              iconStyle="solid"
            />
          </View>
          <View>
            <Typo className="text-gray-900 text-2xl font-bold">Statistics</Typo>
            <Typo className="text-gray-500 text-sm">Sensor data analytics</Typo>
          </View>
        </View>

        <TimeRangeSelector />
      </View>

      {/* Quick Stats Cards */}
      <View className="px-4 mt-6">
        <View className="flex-row flex-wrap -mx-2">
          {/* Total Readings */}
          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mr-2">
                  <FontAwesome6
                    name="database"
                    size={12}
                    color="#3B82F6"
                    iconStyle="solid"
                  />
                </View>
                <Typo className="text-gray-600 text-sm font-medium">
                  Total Readings
                </Typo>
              </View>
              <Typo className="text-gray-900 text-2xl font-bold">
                {readings.length}
              </Typo>
            </View>
          </View>

          {/* Average Temperature */}
          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center mr-2">
                  <FontAwesome6
                    name="temperature-half"
                    size={12}
                    color="#EF4444"
                    iconStyle="solid"
                  />
                </View>
                <Typo className="text-gray-600 text-sm font-medium">
                  Avg Temp
                </Typo>
              </View>
              <Typo className="text-gray-900 text-2xl font-bold">
                {getAverageTemperature()}°C
              </Typo>
            </View>
          </View>

          {/* Average Humidity */}
          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-teal-100 rounded-lg items-center justify-center mr-2">
                  <FontAwesome6
                    name="droplet"
                    size={12}
                    color="#14B8A6"
                    iconStyle="solid"
                  />
                </View>
                <Typo className="text-gray-600 text-sm font-medium">
                  Avg Humidity
                </Typo>
              </View>
              <Typo className="text-gray-900 text-2xl font-bold">
                {getAverageHumidity()}%
              </Typo>
            </View>
          </View>

          {/* Alerts */}
          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-orange-100 rounded-lg items-center justify-center mr-2">
                  <FontAwesome6
                    name="triangle-exclamation"
                    size={12}
                    color="#F59E0B"
                    iconStyle="solid"
                  />
                </View>
                <Typo className="text-gray-600 text-sm font-medium">
                  Alerts
                </Typo>
              </View>
              <Typo className="text-gray-900 text-2xl font-bold">
                {getAlertCount()}
              </Typo>
            </View>
          </View>
        </View>
      </View>

      {/* Temperature Chart */}
      <View className="bg-white mx-4 mt-6 rounded-2xl p-6 shadow-sm">
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-red-100 rounded-xl items-center justify-center mr-3">
            <FontAwesome6
              name="temperature-half"
              size={16}
              color="#EF4444"
              iconStyle="solid"
            />
          </View>
          <View>
            <Typo className="text-gray-900 text-lg font-bold">
              Temperature Trends
            </Typo>
            <Typo className="text-gray-500 text-sm">°C over time</Typo>
          </View>
        </View>

        {temperatureChartData ? (
          <LineChart
            data={temperatureChartData}
            width={screenWidth - 64}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        ) : (
          <View className="h-48 items-center justify-center">
            <FontAwesome6
              name="chart-line"
              size={32}
              color="#D1D5DB"
              iconStyle="solid"
            />
            <Typo className="text-gray-400 mt-2">
              No temperature data available
            </Typo>
          </View>
        )}
      </View>

      {/* Humidity Chart */}
      <View className="bg-white mx-4 mt-6 rounded-2xl p-6 shadow-sm">
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-teal-100 rounded-xl items-center justify-center mr-3">
            <FontAwesome6
              name="droplet"
              size={16}
              color="#14B8A6"
              iconStyle="solid"
            />
          </View>
          <View>
            <Typo className="text-gray-900 text-lg font-bold">
              Humidity Levels
            </Typo>
            <Typo className="text-gray-500 text-sm">% over time</Typo>
          </View>
        </View>

        {humidityChartData ? (
          <LineChart
            data={humidityChartData}
            width={screenWidth - 64}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(20, 184, 166, ${opacity})`,
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        ) : (
          <View className="h-48 items-center justify-center">
            <FontAwesome6
              name="chart-line"
              size={32}
              color="#D1D5DB"
              iconStyle="solid"
            />
            <Typo className="text-gray-400 mt-2">
              No humidity data available
            </Typo>
          </View>
        )}
      </View>

      {/* Alert Status Chart */}
      <View className="bg-white mx-4 mt-6 rounded-2xl p-6 shadow-sm">
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center mr-3">
            <FontAwesome6
              name="shield-halved"
              size={16}
              color="#F59E0B"
              iconStyle="solid"
            />
          </View>
          <View>
            <Typo className="text-gray-900 text-lg font-bold">
              Safety Status
            </Typo>
            <Typo className="text-gray-500 text-sm">Alert distribution</Typo>
          </View>
        </View>

        {readings.length > 0 ? (
          <BarChart
            data={{
              labels: ["Normal", "Alerts"],
              datasets: [
                {
                  data: [readings.length - getAlertCount(), getAlertCount()],
                },
              ],
            }}
            width={screenWidth - 64}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(251, 146, 60, ${opacity})`,
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        ) : (
          <View className="h-48 items-center justify-center">
            <FontAwesome6
              name="chart-bar"
              size={32}
              color="#D1D5DB"
              iconStyle="solid"
            />
            <Typo className="text-gray-400 mt-2">No alert data available</Typo>
          </View>
        )}
      </View>

      {/* Recent Readings List */}
      <View className="bg-white mx-4 mt-6 mb-8 rounded-2xl p-6 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3">
              <FontAwesome6
                name="list"
                size={16}
                color="#6B7280"
                iconStyle="solid"
              />
            </View>
            <View>
              <Typo className="text-gray-900 text-lg font-bold">
                Recent Readings
              </Typo>
              <Typo className="text-gray-500 text-sm">Latest sensor data</Typo>
            </View>
          </View>
        </View>

        <View className="space-y-3">
          {readings.slice(0, 5).map((reading, index) => (
            <View
              key={reading.id || index}
              className="flex-row items-center justify-between p-3 bg-gray-50 rounded-xl">
              <View className="flex-1">
                <Typo className="text-gray-900 font-medium">
                  {reading.deviceName}
                </Typo>
                <Typo className="text-gray-500 text-sm">
                  {reading.createdAt?.toLocaleString() || "Unknown time"}
                </Typo>
              </View>
              <View className="flex-row items-center space-x-4">
                <View className="items-center">
                  <Typo className="text-red-600 font-bold">
                    {reading.temperature}°
                  </Typo>
                  <Typo className="text-gray-400 text-xs">Temp</Typo>
                </View>
                <View className="items-center">
                  <Typo className="text-teal-600 font-bold">
                    {reading.humidity}%
                  </Typo>
                  <Typo className="text-gray-400 text-xs">Humid</Typo>
                </View>
                <View className="items-center">
                  <View
                    className={`w-3 h-3 rounded-full ${
                      reading.fire === "Normal" && reading.smoke === "Clear"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  <Typo className="text-gray-400 text-xs">Status</Typo>
                </View>
              </View>
            </View>
          ))}

          {readings.length === 0 && (
            <View className="h-24 items-center justify-center">
              <FontAwesome6
                name="inbox"
                size={24}
                color="#D1D5DB"
                iconStyle="solid"
              />
              <Typo className="text-gray-400 mt-2">No readings available</Typo>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default StatisticsPage;

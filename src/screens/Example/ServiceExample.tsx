import React, { useEffect } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenWrapper, Typo } from "@/components";
import { IAttendanceStatus } from "@/interfaces/masterData.interface";
import useMasterDataStore from "@/store/masterData.store";

const AttendanceStatusCard = ({
  attendanceStatusId,
  attendanceStatus,
  attendanceStatusDesc,
  isActive,
  createdTimestamp,
  updatedTimestamp,
}: IAttendanceStatus) => {
  return (
    <TouchableOpacity
      onLongPress={() => {
        Alert.alert(
          "Delete",
          "Are you sure you want to delete this item?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: "OK",
              onPress: () => console.log("OK Pressed"),
            },
          ],
          { cancelable: false },
        );
      }}
      activeOpacity={0.8}>
      <View
        className="bg-neutral-500 border border-black rounded-xl my-2 py-2 px-4"
        style={{ width: "100%", height: 100 }}>
        <View className="flex-row justify-between items-center w-full gap-2">
          <Typo className=" font-bold text-2xl">
            {attendanceStatusId || "n/a"}
          </Typo>
          <Typo className=" font-bold ">{attendanceStatus || "n/a"}</Typo>
        </View>
        <Typo className="">{attendanceStatusDesc || "n/a"}</Typo>
        <Typo className=" text-sm">
          Updated On: {updatedTimestamp || "n/a"}
        </Typo>
      </View>
    </TouchableOpacity>
  );
};

const ServiceExample = () => {
  const { searchAttendanceStatus, attendanceStatus } = useMasterDataStore();
  const data = attendanceStatus
    .filter((item) => item.isActive === true)
    .sort((a, b) => a.attendanceStatusId - b.attendanceStatusId);

  useEffect(() => {
    searchAttendanceStatus();
  }, [searchAttendanceStatus]);

  return (
    <ScreenWrapper backButton>
      <Typo className="font-semibold text-3xl text-center">
        Service Example
      </Typo>
      <FlatList
        data={data}
        keyExtractor={(item) => item.attendanceStatusId.toString()}
        renderItem={(data) => <AttendanceStatusCard {...data.item} />}
        ListHeaderComponent={
          <Typo className="font-semibold">Attendance Status</Typo>
        }
        contentContainerStyle={{ paddingBottom: 70 }}
      />
    </ScreenWrapper>
  );
};

export default ServiceExample;

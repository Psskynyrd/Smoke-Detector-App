import { create } from "zustand";

import {
  IAttendanceStatus,
} from "@/interfaces/masterData.interface";
import masterDataService from "@/services/masterDataService";

interface MasterDataState {
  searchAttendanceStatus: () => void;
  attendanceStatus: IAttendanceStatus[];
  count: number;
}

const useMasterDataStore = create<MasterDataState>()((set, get) => ({
  searchAttendanceStatus: async () => {
    await masterDataService.searchAttendanceStatus().then((res) => {
      if (res?.success) {
        console.log("res: ", res);
        set({
          count: res.data.itemCount,
          attendanceStatus: res.data.resultData,
        });
      }
    });
  },
  attendanceStatus: [],
  count: 0,
}));

export default useMasterDataStore;

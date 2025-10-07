import { AxiosResponse } from "axios";

import { IAttendanceStatusResponse } from "@/interfaces/masterData.interface";

import { api } from "./apiClient";

// import {
//   IAccessTokenResponse,
// } from "@/interfaces/app.intertface";

const masterDataService = {
  async searchAttendanceStatus(): Promise<
    IAttendanceStatusResponse | undefined
  > {
    const params = new URLSearchParams();
    // params.append("client_id", _env.API_ID1);
    // params.append("client_secret", _env.API_SC1);
    // params.append("grant_type", "client_credentials");

    return await api.get("/MasterData/attendance-status/search", {});
  },
  //   async getResources() {
  //     return apiService.get("/api/App/Category", {});
  //   },
};

export default masterDataService;

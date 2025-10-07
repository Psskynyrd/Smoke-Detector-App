import { IResponseBase } from "./app.intertface";

export interface IAttendanceStatus {
  attendanceStatusId: number;
  attendanceStatus: string;
  attendanceStatusDesc: string;
  isActive: boolean;
  createdTimestamp: string;
  updatedTimestamp: string;
}

export interface IAttendanceStatusResponse
  extends IResponseBase<IAttendanceStatus> {}

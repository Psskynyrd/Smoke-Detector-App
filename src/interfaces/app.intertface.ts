/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { LazyExoticComponent } from "react";

export interface IAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: any;
}

export interface IRoute {
  path: string;
  component: LazyExoticComponent<React.ComponentType<any>>;
  meta: IMeta;
}

interface IMeta {
  isPublic: boolean;
  resource: string[] | null;
  type?: string;
}

export interface IResponseStatus {
  Code: string;
  Message: string;
}

export interface IAppResources {
  AppCatID: number;
  AppCatName: string;
  AppCatNameEng: string;
  CountryCode: string;
  CatType: string;
  AppCatIcon?: string | undefined;
  AppText?: string | undefined;
}

export interface IGetPolicyResponse {
  Policy: IPolicy[];
  Status: IResponseStatus;
}

export interface IPolicy {
  PolicyID: number;
  PolicyName: string;
  PolicyShortDesc: string;
  PolicyFullDesc: string;
  PolicyFooter: string;
}

export interface IResponseBase<T> {
  status: string;
  success: boolean;
  message: string;
  data: IData<T>;
}

export interface IData<T> {
  itemCount: number;
  resultData: T[];
}

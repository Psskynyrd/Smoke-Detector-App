import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "@env";
import _axios, { AxiosRequestConfig, AxiosResponse } from "axios";

import { APIError } from "@/libs/errors";

// import { purifyData } from "@/helpers/app.helper";

const apiClient = _axios.create({
  baseURL: API_URL + "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Log request details
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );
    if (config.data) {
      console.log(`[API Data]`, config.data);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Log response details
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[API Response] ${response.config.method?.toUpperCase()} ${response.config.baseURL}${response.config.url} → ${response.status}`
    );
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.baseURL}${error.config?.url} → ${error.response.status}`,
        error.response.data
      );
    } else {
      console.error(`[API Error]`, error.message);
    }
    return Promise.reject(error);
  }
);

// Add token interceptor
// axios.interceptors.request.use(
//   async (config) => {
//     // Example: attach token if available
//     const token = "yourTokenFromStorage"; // e.g. AsyncStorage
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// /**
//  *
//  * @param {AxiosError} error
//  */
// const handleError = (error: any) => {
//   if (error.response?.data?.success !== undefined) {
//     const res = error.response.data;
//     throw new APIError(res.status, res.message, res.data);
//   } else {
//     throw error;
//   }
// };

// Token interceptor
// apiClient.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("access_token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// Error interceptor
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.data?.success !== undefined) {
      const res = error.response.data;
      throw new APIError(res.status, res.message, res.data);
    }
    throw error;
  },
);

/**
 *
 * @param {AxiosRequestConfig} option
 * @returns {AxiosRequestConfig}
 */
const getConfig = (option: AxiosRequestConfig) => {
  return {
    ...option,
  };
};

// /**
//  * @param {string} url
//  * @param {AxiosRequestConfig} config
//  * @returns {Promise<AxiosResponse>}
//  */
// const get = async (url: string, config: AxiosRequestConfig) => {
//   try {
//     return await axios.get(url, getConfig(config));
//   } catch (error) {
//     handleError(error);
//   }
// };

// /**
//  * @param {string} url
//  * @param {*} data
//  * @param {AxiosRequestConfig} config
//  * @returns {Promise<AxiosResponse>}
//  */
// const post = async (url: string, data: any, config: AxiosRequestConfig) => {
//   try {
//     // return await axios.post(url, purifyData(data), getConfig(config));
//     return await axios.post(url, data, getConfig(config));
//   } catch (error) {
//     handleError(error);
//   }
// };

// /**
//  * @param {string} url
//  * @param {*} data
//  * @param {AxiosRequestConfig} config
//  * @returns {Promise<AxiosResponse>}
//  */
// const put = async (url: string, data: any, config: AxiosRequestConfig) => {
//   try {
//     // return await axios.put(url, purifyData(data), getConfig(config));
//     return await axios.put(url, data, getConfig(config));
//   } catch (error) {
//     handleError(error);
//   }
// };

// /**
//  * @param {string} url
//  * @param {*} data
//  * @param {AxiosRequestConfig} config
//  * @returns {Promise<AxiosResponse>}
//  */
// const patch = async (url: string, data: any, config: AxiosRequestConfig) => {
//   try {
//     // return await axios.patch(url, purifyData(data), getConfig(config));
//     return await axios.patch(url, data, getConfig(config));
//   } catch (error) {
//     handleError(error);
//   }
// };

// /**
//  * @param {string} url
//  * @param {AxiosRequestConfig} config
//  * @returns {Promise<AxiosResponse>}
//  */
// const _delete = async (url: string, config: AxiosRequestConfig) => {
//   try {
//     return await axios.delete(url, getConfig(config));
//   } catch (error) {
//     handleError(error);
//   }
// };

const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const res: AxiosResponse<T> = await apiClient.get(url, config);
  return res.data;
};

const post = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const res: AxiosResponse<T> = await apiClient.post(url, data, config);
  return res.data;
};

const put = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const res: AxiosResponse<T> = await apiClient.put(url, data, config);
  return res.data;
};

const patch = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const res: AxiosResponse<T> = await apiClient.patch(url, data, config);
  return res.data;
};

const _delete = async <T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const res: AxiosResponse<T> = await apiClient.delete(url, config);
  return res.data;
};

export const api = { get, post, put, patch, delete: _delete };

// export default { get, post, put, patch, delete: _delete };

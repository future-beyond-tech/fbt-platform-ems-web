import axiosInstance from "@/lib/axios";

const unwrap = async (request) => {
  const response = await request;
  return response.data;
};

export const api = {
  get: (url, config) => unwrap(axiosInstance.get(url, config)),
  post: (url, data, config) => unwrap(axiosInstance.post(url, data, config)),
  put: (url, data, config) => unwrap(axiosInstance.put(url, data, config)),
  delete: (url, config) => unwrap(axiosInstance.delete(url, config)),
};

export default api;

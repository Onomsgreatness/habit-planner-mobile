import axios from "axios";
import { getToken } from "./authStorage";

const api = axios.create({
  baseURL: "http://localhost:5001",
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

import axios from "axios";

const Server = import.meta.env.VITE_SERVER_API_URL;


export const axiosInstance = axios.create({
  baseURL: `${Server}/api`,
  withCredentials: true,
});
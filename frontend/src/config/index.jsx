import axios from "axios";

export const BASE_URL = "http://localhost:5050";
export const clientServer = axios.create({
  baseURL: BASE_URL,
});

import axios from "axios";

export const BASE_URL = "https://scanme-wkq3.onrender.com";
export const clientServer = axios.create({
  baseURL: BASE_URL,
});

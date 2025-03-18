const { default: axios } = require("axios");

export const BASE_URL = "https://localhost:5050";
export const clientServer = axios.create({
  baseURL: BASE_URL,
});

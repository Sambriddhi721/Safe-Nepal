import axios from "axios";

export const API_BASE = "https://thunderingly-cuspidate-maud.ngrok-free.dev"; // ← new URL

axios.defaults.baseURL = API_BASE;
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";
axios.defaults.timeout = 10000;
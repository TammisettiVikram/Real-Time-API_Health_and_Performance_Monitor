import axios from "axios";

console.log("AXIOS BASE URL =", import.meta.env.VITE_API_BASE_URL);

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

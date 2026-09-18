import axios from "axios";

const API = axios.create({
  baseURL: "https://96dvzmmt-5000.asse.devtunnels.ms/api",
});

// 1. Sisipkan Token ke Setiap Request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Tangani Otomatis Jika Token Tidak Valid / Kedaluwarsa
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hapus sesi lokal yang tidak valid
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect balik ke login secara bersih
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

export default API;

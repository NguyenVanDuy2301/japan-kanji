import axios from "axios";

const api = axios.create({
  // Khi chạy local (npm run dev): mặc định gọi http://localhost:8080
  // Khi build production: dùng VITE_API_BASE_URL (nếu có), hoặc '' để gọi cùng domain qua Nginx reverse proxy
  baseURL:
    import.meta.env.VITE_API_BASE_URL ??
    (import.meta.env.DEV ? "http://localhost:8080" : ""),
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

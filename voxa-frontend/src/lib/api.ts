import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = sessionStorage.getItem("refreshToken");
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        sessionStorage.setItem("accessToken", data.data.accessToken);
        sessionStorage.setItem("refreshToken", data.data.refreshToken);
        original.headers["Authorization"] = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        sessionStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
// import axios from "axios";

// const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081/api/v1";

// // ── Axios instance ────────────────────────────────────────────
// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: { "Content-Type": "application/json" },
// });

// // ── Attach JWT to every request ───────────────────────────────
// api.interceptors.request.use((config) => {
//   const token = sessionStorage.getItem("accessToken");
//   if (token) {
//     config.headers["Authorization"] = `Bearer ${token}`;
//   }
//   return config;
// });

// // ── Auto-refresh on 401 ───────────────────────────────────────
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const original = error.config;
//     if (error.response?.status === 401 && !original._retry) {
//       original._retry = true;
//       try {
//         const refreshToken = sessionStorage.getItem("refreshToken");
//         const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
//           refreshToken,
//         });
//         sessionStorage.setItem("accessToken", data.data.accessToken);
//         sessionStorage.setItem("refreshToken", data.data.refreshToken);
//         original.headers["Authorization"] = `Bearer ${data.data.accessToken}`;
//         return api(original);
//       } catch {
//         sessionStorage.clear();
//         window.location.href = "/login";
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;
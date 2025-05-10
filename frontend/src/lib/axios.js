import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/",
  withCredentials: true,
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear user data from localStorage
      localStorage.removeItem("user");
      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
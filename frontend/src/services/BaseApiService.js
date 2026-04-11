import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

class BaseApiService {

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

  
    this.api.interceptors.request.use((config) => {
      let token = null;
      const authString = localStorage.getItem("auth");
      if (authString) {
        try {
          const auth = JSON.parse(authString);
          token = auth?.token;
        } catch (error) {
          token = null;
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {

        if (error.response && error.response.status === 401) {
          console.error("Session expired. Please login again.");
          localStorage.removeItem("auth");
          window.location.href = "/signin";
        }

        return Promise.reject(error);
      }
    );
  }

  get(url, params = {}) {
    return this.api.get(url, { params });
  }

  post(url, data = {}) {
    return this.api.post(url, data);
  }

  put(url, data = {}) {
    return this.api.put(url, data);
  }

  patch(url, data = {}) {
    return this.api.patch(url, data);
  }

  delete(url) {
    return this.api.delete(url);
  }
}

export const baseApiService = new BaseApiService();
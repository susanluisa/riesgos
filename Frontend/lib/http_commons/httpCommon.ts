import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:8000";
  }

  console.warn("NEXT_PUBLIC_API_BASE_URL no está configurado en producción");
  return "https://mydomain.com";
};

const API_BASE_URL = getApiBaseUrl();

// normalizar token
const normalizeToken = (token: string): string | null => {
  let normalized = token.trim().replace(/^["']+|["']+$/g, "");
  if (!normalized) return null;

  while (/^bearer\s*/i.test(normalized)) {
    normalized = normalized.replace(/^bearer\s*/i, "").trimStart();
  }

  return normalized ? `Bearer ${normalized}` : null;
};

export const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") return {};

  const rawToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!rawToken) return {};

  const normalized = normalizeToken(rawToken);
  if (!normalized) return {};

  return { Authorization: normalized };
};

export const withAuthHeaders = (headers: Record<string, string> = {}) => ({
  headers: {
    ...headers,
    ...getAuthHeaders(),
  },
});

export const apiPublicClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiPrivateClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

if (typeof window !== "undefined") {
  const auth = getAuthHeaders();
  if (auth.Authorization) {
    apiPrivateClient.defaults.headers.common.Authorization = auth.Authorization;
  }
}

apiPrivateClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (!error.response) return Promise.reject(error);
    if (originalRequest._retry || originalRequest.url?.includes("/api/auth/refresh")) {
      return Promise.reject(error);
    }

    // Maneja 401 / 403 (token expirado)
    if ([401, 403].includes(error.response.status)) {
      originalRequest._retry = true;
      try {
        const refreshToken = typeof window !== "undefined" ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
        if (!refreshToken) throw new Error("No hay refresh token");

        const { data } = await apiPublicClient.post("/api/auth/refresh/", { refresh: refreshToken });
        const newToken = data.accessToken || data.access || data.token || data.access_token;

        if (newToken && typeof window !== "undefined") {
          localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
          apiPrivateClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
        }

        return apiPrivateClient(originalRequest);
      } catch (refreshError) {
        console.error("Error al refrescar el token", refreshError);
        if (typeof window !== "undefined") {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          window.location.href = "/";
        }
      }
    }

    return Promise.reject(error);
  }
);

export { API_BASE_URL };
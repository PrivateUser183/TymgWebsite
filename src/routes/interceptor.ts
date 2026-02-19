import { handleLogout } from "@/helpers/auth";
import { getCookie } from "@/lib/cookies";
import { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { maintenanceStore } from "@/stores/maintenanceStore";

// Helper function to clean token (remove quotes if present)
const cleanToken = (token: string): string => {
  if (!token) return "";

  // Remove surrounding quotes if they exist
  return token.replace(/^["']|["']$/g, "").trim();
};

export const setupInterceptors = (instance: AxiosInstance): void => {
  // Request Interceptor - Combined logic
  instance.interceptors.request.use(
    (config) => {
      // First, check if we have a token in params (for SSR)
      const paramToken = config?.params?.access_token || "";

      if (paramToken) {
        const cleanedToken = cleanToken(paramToken);
        if (config.headers) {
          config.headers.set("Authorization", `Bearer ${cleanedToken}`);
        }
        // Remove the token from params to avoid sending it in the URL
        delete config.params.access_token;
      } else if (typeof window !== "undefined") {
        // If no param token and not SSR, try to get from cookies (client-side)
        const access_token = getCookie("access_token") || "";
        if (access_token) {
          if (config.headers) {
            config.headers.set("Authorization", `Bearer ${access_token}`);
          }
        }
      }

      if (config?.params?.scope_category_slug === "all") {
        delete config.params.scope_category_slug;
      }

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Clear maintenance state on successful response (non-503)
      if (typeof window !== "undefined") {
        maintenanceStore.setMaintenance(false, null);
      }
      // Normalize API response formats to match frontend expectations
      if (response.data && typeof response.data === "object") {
        const d = response.data;

        // Map "status" field to "success" (e.g. settings endpoint returns {status: true})
        if (!("success" in d) && "status" in d) {
          d.success = d.status;
        }

        // Convert Laravel paginated format {data:[], meta:{...}} to frontend format
        // Frontend expects: {success: true, data: {current_page, data:[], last_page, ...}}
        if (Array.isArray(d.data) && "meta" in d && !("success" in d)) {
          const meta = d.meta;
          response.data = {
            success: true,
            message: "Success",
            data: {
              current_page: meta.current_page,
              data: d.data,
              from: meta.from,
              last_page: meta.last_page,
              per_page: meta.per_page,
              to: meta.to,
              total: meta.total,
              links: meta.links,
            },
          };
        }
      }
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            console.error("Unauthorized request");
            if (typeof window !== "undefined") handleLogout(false);
            break;
          case 403:
            console.error("Forbidden access");
            break;
          case 500:
            console.error("Server error");
            break;
          case 503:
            // Check for maintenance mode in 503 response
            if (typeof window !== "undefined") {
              try {
                const responseData = error.response.data;
                // Check if response has maintenance: true
                if (
                  responseData &&
                  typeof responseData === "object" &&
                  (responseData as any).maintenance === true
                ) {
                  const message =
                    (responseData as any).message || null;
                  maintenanceStore.setMaintenance(true, message);
                } else {
                  // If 503 but no maintenance flag, clear maintenance state
                  maintenanceStore.setMaintenance(false, null);
                }
              } catch (e) {
                console.error("Error parsing 503 response:", e);
                maintenanceStore.setMaintenance(false, null);
              }
            }
            break;
          default:
            console.error(`Error: ${error.response.status}`);
            // Clear maintenance state for other errors
            if (typeof window !== "undefined") {
              maintenanceStore.setMaintenance(false, null);
            }
        }
      } else if (error.request) {
        console.error("No response received from server");
      } else {
        console.error("Request setup error:", error.message);
      }
      return Promise.reject(error);
    }
  );
};

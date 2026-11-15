const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
let accessToken = window.sessionStorage.getItem("scholarsetu_access_token");

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function setAccessToken(token) {
  accessToken = token || null;
  if (accessToken) window.sessionStorage.setItem("scholarsetu_access_token", accessToken);
  else window.sessionStorage.removeItem("scholarsetu_access_token");
}

function messageForStatus(status) {
  const messages = {
    400: "Some information could not be accepted. Review the fields and try again.",
    401: "Your session has expired. Please sign in again.",
    403: "You do not have permission to complete this action.",
    404: "The requested information could not be found.",
    409: "This change conflicts with the latest information. Refresh and try again.",
    429: "Too many requests. Please wait a moment and try again.",
  };
  if (status >= 500) return "The service is temporarily unavailable. Please try again later.";
  return messages[status] || "The request could not be completed.";
}

export async function request(path, options = {}) {
  const headers = { Accept: "application/json", ...options.headers };
  if (options.body && !(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
      body: options.body && typeof options.body !== "string" && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body,
    });
  } catch (error) {
    throw new ApiError("Could not reach the ScholarSetu service. Check your connection and API configuration.", 0, error);
  }

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError("The service returned an unreadable response.", response.status);
    }
  }
  if (!response.ok) {
    const message = data && (data.message || data.error) ? (data.message || data.error) : messageForStatus(response.status);
    throw new ApiError(message, response.status, data);
  }
  return data;
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options = {}) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options = {}) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options = {}) => request(path, { ...options, method: "DELETE" }),
};

export function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.items)) return value.items;
  if (value && Array.isArray(value.results)) return value.results;
  return [];
}

export function queryString(values) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, value);
  });
  return params.toString();
}

export function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

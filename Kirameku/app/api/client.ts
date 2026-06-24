import { siteConfig } from "@/siteConfig";

const BASE_URL = siteConfig.apiBaseUrl;

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    if (!res.ok) {
      throw new ApiError(`API Error: ${res.status}`, res.status);
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

function qs(params?: Record<string, string | number | undefined>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== ""
  );
  if (!entries.length) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

export { request, qs, ApiError, BASE_URL };

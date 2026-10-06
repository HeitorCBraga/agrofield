const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

interface LoginResponse {
  user: { id: string; name: string; email: string };
  accessToken: string;
  refreshToken: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Erro ao entrar" }));
    throw new Error(body.message ?? "Erro ao entrar");
  }

  return response.json();
}

export async function register(name: string, email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Erro ao criar conta" }));
    throw new Error(body.message ?? "Erro ao criar conta");
  }

  return response.json();
}

export function saveSession(tokens: { accessToken: string; refreshToken: string }) {
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

async function authFetch(path: string, options: RequestInit = {}) {
  const token = getAccessToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Erro na requisição" }));
    throw new Error(body.message ?? "Erro na requisição");
  }

  if (response.status === 204) return null;
  return response.json();
}

export interface Property {
  id: string;
  name: string;
  city: string;
  state: string;
  areaHa: number;
}

export function getProperties(): Promise<Property[]> {
  return authFetch("/properties");
}

export function createProperty(data: { name: string; city: string; state: string; areaHa: number }): Promise<Property> {
  return authFetch("/properties", { method: "POST", body: JSON.stringify(data) });
}

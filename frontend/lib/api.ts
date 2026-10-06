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

export function getProperty(id: string): Promise<Property> {
  return authFetch(`/properties/${id}`);
}

export function createProperty(data: { name: string; city: string; state: string; areaHa: number }): Promise<Property> {
  return authFetch("/properties", { method: "POST", body: JSON.stringify(data) });
}

export interface Plot {
  id: string;
  name: string;
  areaHa: number;
  soilType: string;
  propertyId: string;
}

export function getPlots(propertyId: string): Promise<Plot[]> {
  return authFetch(`/properties/${propertyId}/plots`);
}

export function getPlot(id: string): Promise<Plot> {
  return authFetch(`/plots/${id}`);
}

export function createPlot(
  propertyId: string,
  data: { name: string; areaHa: number; soilType: string },
): Promise<Plot> {
  return authFetch(`/properties/${propertyId}/plots`, { method: "POST", body: JSON.stringify(data) });
}

export interface Crop {
  id: string;
  name: string;
  variety: string | null;
  plantedAt: string;
  expectedHarvestAt: string | null;
  plotId: string;
}

export function getCrops(plotId: string): Promise<Crop[]> {
  return authFetch(`/plots/${plotId}/crops`);
}

export function getCrop(id: string): Promise<Crop> {
  return authFetch(`/crops/${id}`);
}

export function createCrop(
  plotId: string,
  data: { name: string; variety?: string; plantedAt: string; expectedHarvestAt?: string },
): Promise<Crop> {
  return authFetch(`/plots/${plotId}/crops`, { method: "POST", body: JSON.stringify(data) });
}

export interface InputApplication {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  appliedAt: string;
  cropId: string;
}

export function getInputApplications(cropId: string): Promise<InputApplication[]> {
  return authFetch(`/crops/${cropId}/input-applications`);
}

export function createInputApplication(
  cropId: string,
  data: { productName: string; quantity: number; unit: string; appliedAt: string },
): Promise<InputApplication> {
  return authFetch(`/crops/${cropId}/input-applications`, { method: "POST", body: JSON.stringify(data) });
}

export interface Harvest {
  id: string;
  quantityKg: number;
  harvestedAt: string;
  cropId: string;
}

export function getHarvests(cropId: string): Promise<Harvest[]> {
  return authFetch(`/crops/${cropId}/harvests`);
}

export function createHarvest(
  cropId: string,
  data: { quantityKg: number; harvestedAt: string },
): Promise<Harvest> {
  return authFetch(`/crops/${cropId}/harvests`, { method: "POST", body: JSON.stringify(data) });
}

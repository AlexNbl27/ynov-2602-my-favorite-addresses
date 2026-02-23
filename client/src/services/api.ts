const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("auth_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return res.json();
}

// Users
export interface User {
  id: number;
  email: string;
  createdAt: string;
}

export async function register(email: string, password: string) {
  return request<{ item: User }>("/users", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string) {
  const data = await request<{ token: string }>("/users/tokens", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("auth_token", data.token);
  return data;
}

export async function getProfile() {
  return request<{ item: User }>("/users/me");
}

export function logout() {
  localStorage.removeItem("auth_token");
}

// Addresses
export interface Address {
  id: number;
  name: string;
  description: string;
  lat: number;
  lng: number;
  createdAt: string;
}

export async function getAddresses() {
  return request<{ items: Address[] }>("/addresses");
}

export async function addAddress(data: {
  searchWord: string;
  name: string;
  description: string;
}) {
  return request<{ item: Address }>("/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function searchAddresses(data: {
  radius: number;
  from: { lng: number; lat: number };
}) {
  return request<{ items: Address[] }>("/addresses/searches", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAddress(
  id: number,
  data: { name?: string; description?: string }
) {
  return request<{ item: Address }>(`/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAddress(id: number) {
  return request<void>(`/addresses/${id}`, {
    method: "DELETE",
  });
}

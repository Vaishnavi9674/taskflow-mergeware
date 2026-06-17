const BASE_URL = "http://localhost:8000/api/v1";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}

// Token helpers
export const getToken = (): string | null => localStorage.getItem("taskflow_token");
export const setToken = (token: string) => localStorage.setItem("taskflow_token", token);
export const removeToken = () => localStorage.removeItem("taskflow_token");

// Get headers with authorization token
const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Handle response parsing
const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data?.message || `HTTP error! status: ${response.status}`;
    throw new Error(errorMsg);
  }
  return data as T;
};

export const apiService = {
  // Auth API
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  // Task API
  async getTasks(): Promise<Task[]> {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<Task[]>(res);
  },

  async createTask(title: string, description: string): Promise<Task> {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ title, description }),
    });
    return handleResponse<Task>(res);
  },

  async updateTask(id: string, updates: { title?: string; description?: string; completed?: boolean }): Promise<Task> {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse<Task>(res);
  },

  async deleteTask(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },
};

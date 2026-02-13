import axios from "axios";
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const API = `${API_BASE}/api`;


export const loginApi = (email, password) =>
axios.post(`${API}/auth/login`, { email, password }).then((r) => r.data);


export const getStudents = () => axios.get(`${API}/students`).then((r) => r.data);
export const createStudent = (data) => axios.post(`${API}/students`, data).then((r) => r.data);
export const deleteStudent = (id) => axios.delete(`${API}/students/${id}`).then((r) => r.data);


export const createOrder = (data) => axios.post(`${API}/payments/create-order`, data).then((r) => r.data);
export const verifyPayment = (data) => axios.post(`${API}/payments/verify`, data).then((r) => r.data);
const BASE_URL = API;

export async function apiCall(endpoint, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || "API Error");
  }

  return res.json();
}

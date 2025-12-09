import axios from "axios";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";


export const loginApi = (email, password) =>
axios.post(`${API}/auth/login`, { email, password }).then((r) => r.data);


export const getStudents = () => axios.get(`${API}/students`).then((r) => r.data);
export const createStudent = (data) => axios.post(`${API}/students`, data).then((r) => r.data);
export const deleteStudent = (id) => axios.delete(`${API}/students/${id}`).then((r) => r.data);


export const createOrder = (data) => axios.post(`${API}/payments/create-order`, data).then((r) => r.data);
export const verifyPayment = (data) => axios.post(`${API}/payments/verify`, data).then((r) => r.data);
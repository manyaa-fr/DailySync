import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND_URI || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
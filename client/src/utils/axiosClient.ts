import axios from 'axios';

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;

  // If no env var, default to local dev server
  if (!url) {
    return 'http://localhost:8000/api/v1';
  }

  // Ensure no trailing slash for cleaner appending
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  // If the URL doesn't already end with /api/v1, append it
  // This handles cases where user just provides the domain
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }

  return url;
};

export const axiosClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

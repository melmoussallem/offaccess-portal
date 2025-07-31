// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://offaccess-portal-production.up.railway.app' 
  : 'http://localhost:5000';

export const getApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export default API_BASE_URL; 
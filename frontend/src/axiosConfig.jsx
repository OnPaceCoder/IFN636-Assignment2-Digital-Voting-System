import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://54.79.173.237:5001',
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;

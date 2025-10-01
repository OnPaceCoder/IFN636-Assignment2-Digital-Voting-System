import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://3.64.173.155:5001', // live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;

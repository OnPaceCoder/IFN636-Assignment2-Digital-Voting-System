import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://3.23.253.148:5001', // live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;

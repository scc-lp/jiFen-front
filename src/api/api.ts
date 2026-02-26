import axios from 'axios';
import { loadingManager } from '../utils/loading';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 显示加载中
    loadingManager.show('加载中...');
    return config;
  },
  (error) => {
    // 隐藏加载中
    loadingManager.hide();
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 隐藏加载中
    loadingManager.hide();
    return response.data;
  },
  (error) => {
    // 隐藏加载中
    loadingManager.hide();
    if (error.response) {
      // 服务器返回错误
      if (error.response.status === 401) {
        // token过期或无效，清除localStorage并跳转到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // 请求发送成功但没有收到响应
      return Promise.reject({ success: false, message: '网络错误，请检查您的网络连接' });
    } else {
      // 请求配置错误
      return Promise.reject({ success: false, message: '请求错误' });
    }
  }
);

export default api;
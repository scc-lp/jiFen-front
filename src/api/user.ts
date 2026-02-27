import api from './api';

// 用户注册
interface RegisterParams {
  phone: string;
  username: string;
  password: string;
  avatar?: string;
}

// 用户登录
interface LoginParams {
  phone: string;
  password: string;
}

// 用户信息
interface UserInfo {
  id: number;
  phone: string;
  username: string;
  avatar?: string;
  created_at: string;
}

// 登录注册响应
interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: UserInfo;
    token: string;
  };
}

// 重置密码参数
interface ResetPasswordParams {
  phone: string;
  username: string;
  password: string;
}

// 用户相关API
export const userApi = {
  // 注册
  register: async (params: RegisterParams): Promise<AuthResponse> => {
    return await api.post('/users/register', params);
  },
  
  // 登录
  login: async (params: LoginParams): Promise<AuthResponse> => {
    return await api.post('/users/login', params);
  },
  
  // 获取用户信息
  getProfile: async (): Promise<{
    success: boolean;
    data?: UserInfo;
    message?: string;
  }> => {
    return await api.get('/users/profile');
  },
  
  // 更新用户信息
  updateProfile: async (data: {
    username?: string;
    avatar?: string;
    password?: string;
  }): Promise<{
    success: boolean;
    data?: UserInfo;
    message?: string;
  }> => {
    return await api.put('/users/profile', data);
  },
  
  // 重置密码
  resetPassword: async (params: ResetPasswordParams): Promise<{
    success: boolean;
    message?: string;
  }> => {
    return await api.post('/users/reset-password', params);
  },
  
  // 根据手机号获取用户信息
  getUserByPhone: async (phone: string): Promise<{
    success: boolean;
    data?: UserInfo;
    message?: string;
  }> => {
    return await api.get(`/users/by-phone/${phone}`);
  },
};
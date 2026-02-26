<template>
  <div class="register-container">
    <div class="register-form">
      <h2 class="title">用户注册</h2>
      <van-form @submit="handleRegister">
        <van-field v-model="phone" name="phone" label="手机号" placeholder="请输入手机号"
          :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' }]" />
        <van-field v-model="username" name="username" label="用户名" placeholder="请输入用户名"
          :rules="[{ required: true, message: '请输入用户名' }]" />
        <van-field v-model="password" name="password" label="密码" placeholder="请输入密码" type="password"
          :rules="[{ required: true, message: '请输入密码' }]" />
        <van-field v-model="confirmPassword" name="confirmPassword" label="确认密码" placeholder="请再次输入密码" type="password"
          :rules="[{ required: true, message: '请确认密码' }, { validator: validateConfirmPassword, message: '两次输入的密码不一致' }]" />
        <div class="form-actions">
          <van-button type="primary" native-type="submit" :loading="loading">注册并登录</van-button>
          <div @click="switchToLogin" class="btn-link">已有账号？返回登录</div>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { toast } from '../utils/toast';
import { useRouter } from 'vue-router';
import { userApi } from '../api/user';

const router = useRouter();
const phone = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);

// 验证确认密码
const validateConfirmPassword = (value: string) => {
  return value === password.value;
};

// 切换到登录页面
const switchToLogin = () => {
  router.push('/login');
};

// 处理注册
const handleRegister = async () => {
  try {
    loading.value = true;
    const response = await userApi.register({
      phone: phone.value,
      username: username.value,
      password: password.value
    });
    
    if (response.success) {
      // 保存token和用户信息
      localStorage.setItem('token', response.data?.token || '');
      localStorage.setItem('user', JSON.stringify(response.data?.user || {}));
      toast.success('注册成功');
      // 跳转到首页
      router.push('/home');
    } else {
      toast.error(response.message || '注册失败');
    }
  } catch (error: any) {
    toast.error(error.message || '注册失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 20px;
}

.register-form {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.form-actions {
  margin-top: 30px;
  .btn-link{
    margin-top: 10px;
    text-align: center;
  }
}

.form-actions {
  width: 100%;
  margin-bottom: 10px;
}

:deep(.van-button--primary) {
  background-color: #007bff;
  width: 100%;
}
</style>
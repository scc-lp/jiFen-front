<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="title">用户登录</h2>
      <van-form @submit="handleLogin">
        <van-field v-model="phone" name="phone" label="手机号" placeholder="请输入手机号"
          :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' }]" />
        <van-field v-model="password" name="password" label="密码" placeholder="请输入密码" type="password"
          :rules="[{ required: true, message: '请输入密码' }]" />
        <div class="form-actions">
          <van-button type="primary" native-type="submit" :loading="loading">登录</van-button>
           <div class="actions-bottom">
            <div @click="switchToRegister" class="btn-link">注册账号</div>
            <div @click="switchToForgotPassword" class="btn-link">忘记密码？</div>
           </div>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from '../utils/toast';
import { userApi } from '../api/user';

const router = useRouter();
const phone = ref('');
const password = ref('');
const loading = ref(false);

// 切换到注册页面
const switchToRegister = () => {
  router.push('/register');
};

// 切换到忘记密码页面
const switchToForgotPassword = () => {
  router.push('/forgot-password');
};

// 处理登录
const handleLogin = async () => {
  try {
    loading.value = true;
    const response = await userApi.login({
      phone: phone.value,
      password: password.value
    });
    
    if (response.success) {
      // 保存token和用户信息
      localStorage.setItem('token', response.data?.token || '');
      localStorage.setItem('user', JSON.stringify(response.data?.user || {}));
      toast.success('登录成功');
      // 跳转到首页
      router.push('/home');
    } else {
      toast.error(response.message || '登录失败');
    }
  } catch (error: any) {
    toast.error(error.message || '登录失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.login-form {
  width: 90%;
  background-color: #fff;
  padding: 30px;
  box-sizing: border-box;
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
  width: 100%;
  margin-bottom: 10px;

  .actions-bottom{
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    .btn-link{
      color: #535bf2;
    }
  }
}

:deep(.van-button--primary) {
  background-color: #007bff;
  width: 100%;
}
</style>
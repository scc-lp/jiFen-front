<template>
  <div class="forgot-password-container">
    <div class="forgot-password-form">
      <h2 class="title">忘记密码</h2>
      <van-form @submit="handleForgotPassword">
        <van-field v-model="phone" name="phone" label="手机号" placeholder="请输入手机号" 
          :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' }]" />
        <van-field v-model="username" name="username" label="用户名" placeholder="请输入用户名" 
          :rules="[{ required: true, message: '请输入用户名' }]" />
        <van-field v-model="newPassword" name="newPassword" label="新密码" placeholder="请输入新密码" type="password" 
          :rules="[{ required: true, message: '请输入新密码' }]" />
        <van-field v-model="confirmPassword" name="confirmPassword" label="确认新密码" placeholder="请再次输入新密码" type="password" 
          :rules="[{ required: true, message: '请确认新密码' }, { validator: validateConfirmPassword, message: '两次输入的密码不一致' }]" />
        <div class="form-actions">
          <van-button type="primary" native-type="submit" :loading="loading">重置密码</van-button>
          <div class="actions-bottom">
            <div @click="switchToLogin" class="btn-link">返回登录</div>
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
const username = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);

// 切换到登录页面
const switchToLogin = () => {
  router.push('/login');
};

// 验证确认密码
const validateConfirmPassword = (value: string) => {
  return value === newPassword.value;
};

// 处理忘记密码
const handleForgotPassword = async () => {
  try {
    loading.value = true;
    const response = await userApi.resetPassword({
      phone: phone.value,
      username: username.value,
      password: newPassword.value
    });
    
    if (response.success) {
      toast.success('密码重置成功，请重新登录');
      // 跳转到登录页面
      router.push('/login');
    } else {
      toast.error(response.message || '密码重置失败');
    }
  } catch (error: any) {
    toast.error(error.message || '网络错误');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.forgot-password-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.forgot-password-form {
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

  .actions-bottom {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    .btn-link {
      color: #535bf2;
    }
  }
}

:deep(.van-button--primary) {
  background-color: #007bff;
  width: 100%;
}
</style>
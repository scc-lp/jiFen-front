<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="title">用户登录</h2>
      <van-form @submit="handleLogin">
        <!-- 头像展示 -->
        <div class="avatar-preview" v-if="avatar">
          <img :src="avatar" alt="头像" class="avatar">
        </div>
        
        <van-field v-model="phone" name="phone" label="手机号" placeholder="请输入手机号"
          :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' }]" 
          @input="handlePhoneInput" />
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
const avatar = ref('');
const loading = ref(false);

// 切换到注册页面
const switchToRegister = () => {
  router.push('/register');
};

// 切换到忘记密码页面
const switchToForgotPassword = () => {
  router.push('/forgot-password');
};

// 防抖函数
const debounce = (func: Function, delay: number) => {
  let timer: number | null = null;
  return function(this: any, ...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// 处理手机号输入
const handlePhoneInput = debounce(async () => {
  if (phone.value && /^1[3-9]\d{9}$/.test(phone.value)) {
    try {
      // 调用API查询用户信息
      const response = await userApi.getUserByPhone(phone.value);
      if (response.success && response.data?.avatar) {
        avatar.value = response.data.avatar;
      } else {
        avatar.value = '';
      }
    } catch (error) {
      // 忽略错误，因为用户可能还未注册
      avatar.value = '';
    }
  } else {
    avatar.value = '';
  }
}, 500);

// 处理登录
const handleLogin = async () => {

  toast.success('密码重置成功，请重新登录');
  // try {
  //   loading.value = true;
  //   const response = await userApi.login({
  //     phone: phone.value,
  //     password: password.value
  //   });
    
  //   if (response.success) {
  //     // 保存token和用户信息
  //     localStorage.setItem('token', response.data?.token || '');
  //     localStorage.setItem('user', JSON.stringify(response.data?.user || {}));
  //     toast.success('登录成功');
  //     // 检查是否有重定向URL
  //     const redirectUrl = localStorage.getItem('redirectUrl');
  //     if (redirectUrl) {
  //       // 清除重定向URL
  //       localStorage.removeItem('redirectUrl');
  //       // 跳转到重定向URL
  //       window.location.href = redirectUrl;
  //     } else {
  //       // 跳转到首页
  //       router.push('/home');
  //     }
  //   } else {
  //     toast.error(response.message || '登录失败');
  //   }
  // } catch (error: any) {
  //   toast.error(error.message || '登录失败');
  // } finally {
  //   loading.value = false;
  // }
};
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('../assets/login-banner.jpeg') no-repeat center center;
  background-size: cover;
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

/* 头像展示样式 */
.avatar-preview {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar-preview .avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
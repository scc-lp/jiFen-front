<template>
  <div class="register-container">
    <div class="register-form">
      <h2 class="title">用户注册</h2>
      <van-form @submit="handleRegister">
        <!-- 头像上传 -->
        <div class="avatar-upload">
          <div class="avatar-preview">
            <div class="avatar-wrapper">
              <img v-if="avatar" :src="avatar" alt="头像" class="avatar">
              <div v-else class="avatar-placeholder">
                <van-icon name="camera" size="32px" />
                <p class="placeholder-text">点击上传头像</p>
              </div>
              <div class="avatar-upload-overlay">
                <van-uploader :after-read="handleAvatarUpload" :max-count="1" accept="image/*" :preview-size="80" :show-upload="false">
                  <div class="upload-button">
                    <van-icon name="camera" size="20px" />
                  </div>
                </van-uploader>
              </div>
            </div>
          </div>
        </div>
        
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
const avatar = ref('');
const loading = ref(false);

// 验证确认密码
const validateConfirmPassword = (value: string) => {
  return value === password.value;
};

// 切换到登录页面
const switchToLogin = () => {
  router.push('/login');
};

// 处理头像上传
const handleAvatarUpload = (file: any) => {
  // 限制头像大小，压缩图片
  const canvas = document.createElement('canvas');
  const img = new Image();
  img.src = file.content;
  
  img.onload = () => {
    // 设置压缩后的图片尺寸
    const maxWidth = 200;
    const maxHeight = 200;
    let width = img.width;
    let height = img.height;
    
    if (width > height) {
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // 绘制压缩后的图片
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
      // 将压缩后的图片转换为base64字符串，质量为0.7
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      avatar.value = compressedDataUrl;
    }
  };
};

// 处理注册
const handleRegister = async () => {
  try {
    loading.value = true;
    const response = await userApi.register({
      phone: phone.value,
      username: username.value,
      password: password.value,
      avatar: avatar.value
    });
    
    if (response.success) {
      // 保存token和用户信息
      localStorage.setItem('token', response.data?.token || '');
      localStorage.setItem('user', JSON.stringify(response.data?.user || {}));
      toast.success('注册成功');
      // 检查是否有重定向URL
      const redirectUrl = localStorage.getItem('redirectUrl');
      if (redirectUrl) {
        // 清除重定向URL
        localStorage.removeItem('redirectUrl');
        // 跳转到重定向URL
        window.location.href = redirectUrl;
      } else {
        // 跳转到首页
        router.push('/home');
      }
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
  background: url('../assets/login-banner.jpeg') no-repeat center center;
  background-size: cover;
  padding: 20px;
  box-sizing: border-box;
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

/* 头像上传样式 */
.avatar-upload {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.avatar-preview {
  display: flex;
  justify-content: center;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px dashed #d9d9d9;
  transition: all 0.3s ease;
}

.avatar-wrapper:hover {
  border-color: #1989fa;
  box-shadow: 0 0 0 3px rgba(25, 137, 250, 0.1);
}

.avatar-wrapper .avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-wrapper .avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: all 0.3s ease;
}

.avatar-wrapper:hover .avatar-placeholder {
  background-color: #f0f0f0;
  color: #1989fa;
}

.placeholder-text {
  margin: 8px 0 0 0;
  font-size: 12px;
  font-weight: 400;
}

.avatar-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.avatar-wrapper:hover .avatar-upload-overlay {
  opacity: 1;
}

.upload-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1989fa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.upload-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
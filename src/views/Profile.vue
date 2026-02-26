<template>
  <div class="profile-container">
    <!-- 头部 -->
    <div class="header">
      <h1>个人中心</h1>
    </div>

    <!-- 主要内容 -->
    <div class="content">
      <!-- 用户信息 -->
      <div class="user-info">
        <div class="avatar-container">
          <img v-if="user.avatar" :src="user.avatar" alt="头像" class="avatar">
          <div v-else class="avatar-placeholder">
            <van-icon name="user-o" size="48px" />
          </div>
        </div>
        <div class="user-details">
          <h2>{{ user.username }}</h2>
          <p>{{ user.phone }}</p>
        </div>
        <van-button type="primary" size="small" @click="editProfile">编辑资料</van-button>
      </div>

      <!-- 功能列表 -->
      <div class="feature-list">
        <div class="feature-section">
          <h3>账号设置</h3>
          <van-cell-group>
            <van-cell title="修改密码" is-link @click="showChangePasswordDialog" />
            <van-cell title="关于我们" is-link />
            <van-cell title="退出登录" is-link @click="logout" />
          </van-cell-group>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <van-popup v-model:show="changePasswordDialogVisible" position="bottom" round>
      <div class="popup-content">
        <h3>修改密码</h3>
        <van-form @submit="handleChangePassword">
          <van-field v-model="currentPassword" name="currentPassword" label="当前密码" type="password" placeholder="请输入当前密码"
            :rules="[{ required: true, message: '请输入当前密码' }]" />
          <van-field v-model="newPassword" name="newPassword" label="新密码" type="password" placeholder="请输入新密码"
            :rules="[{ required: true, message: '请输入新密码' }]" />
          <van-field v-model="confirmPassword" name="confirmPassword" label="确认新密码" type="password"
            placeholder="请再次输入新密码"
            :rules="[{ required: true, message: '请确认新密码' }, { validator: validateConfirmPassword, message: '两次输入的密码不一致' }]" />
          <div class="form-actions">
            <van-button type="default" @click="changePasswordDialogVisible = false">取消</van-button>
            <van-button type="primary" native-type="submit" :loading="changingPassword">确认修改</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 底部导航栏 -->
    <div class="tabbar">
      <van-tabbar route>
        <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
        <van-tabbar-item icon="user-o" to="/profile">个人中心</van-tabbar-item>
      </van-tabbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from '../utils/toast';
import { userApi } from '../api/user';

// 类型定义
interface UserInfo {
  username: string;
  phone: string;
  avatar: string | undefined;
}

const router = useRouter();
const user = ref<UserInfo>({
  username: '',
  phone: '',
  avatar: undefined
});

// 修改密码相关变量
const changePasswordDialogVisible = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const changingPassword = ref(false);

// 获取用户信息
const getUserInfo = async () => {
  try {
    const response = await userApi.getProfile();
    if (response.success && response.data) {
      user.value = response.data as UserInfo;
    } else {
      user.value = {
        username: '',
        phone: '',
        avatar: undefined
      };
    }
  } catch (error: any) {
    toast.error(error.message || '获取用户信息失败');
  }
};

// 编辑资料
const editProfile = () => {
  toast.info('编辑资料功能开发中');
};

// 显示修改密码弹窗
const showChangePasswordDialog = () => {
  // 重置表单
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  // 显示弹窗
  changePasswordDialogVisible.value = true;
};

// 验证确认密码
const validateConfirmPassword = (value: string) => {
  return value === newPassword.value;
};

// 处理修改密码
const handleChangePassword = async () => {
  try {
    changingPassword.value = true;

    // 调用修改密码API
    const response = await userApi.updateProfile({
      password: newPassword.value
    });

    if (response.success) {
      toast.success('密码修改成功，请重新登录');
      
      // 关闭弹窗
      changePasswordDialogVisible.value = false;
      
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 跳转到登录页
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } else {
      toast.error(response.message || '密码修改失败');
    }
  } catch (error: any) {
    toast.error(error.message || '密码修改失败');
  } finally {
    changingPassword.value = false;
  }
};

// 退出登录
const logout = () => {
  // 清除本地存储
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // 跳转到登录页
  router.push('/login');
  toast.info('已退出登录');
};

onMounted(() => {
  // 从本地存储获取用户信息
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  }

  // 从API获取最新用户信息
  getUserInfo();
});
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: #1989fa;
  color: white;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.user-info {
  background-color: white;
  border-radius: 8px;
  padding: 24px 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details {
  flex: 1;
}

.user-details h2 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.user-details p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  padding-left: 16px;
}

.tabbar {
  border-top: 1px solid #ebedf0;
  background-color: white;
}

/* 修改密码弹窗样式 */
.popup-content {
  padding: 24px 16px;
  max-height: 80vh;
  overflow-y: auto;
}

.popup-content h3 {
  margin: 0 0 24px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.form-actions {
  margin-top: 32px;
  display: flex;
  gap: 16px;
}

.form-actions .van-button {
  flex: 1;
}
</style>
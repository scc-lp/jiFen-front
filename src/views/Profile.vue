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
            <van-cell title="关于记分器" is-link @click="goToAbout" />
          </van-cell-group>
        </div>
      </div>

      <!-- 退出登录按钮 -->
      <div class="logout-container">
        <van-button type="danger" block size="large" @click="logoutDialogVisible = true">退出登录</van-button>
      </div>

      <!-- 退出登录确认弹窗 -->
      <van-popup v-model:show="logoutDialogVisible" round position="center" :style="{ width: '80%' }">
        <div class="score-dialog">
          <h3>确认退出</h3>
          <p class="dialog-message">确定要退出登录吗？</p>
          <div class="dialog-actions">
            <van-button type="default" block @click="logoutDialogVisible = false">取消</van-button>
            <van-button type="primary" block @click="confirmLogout">确认</van-button>
          </div>
        </div>
      </van-popup>

      <!-- 编辑资料弹窗 -->
      <van-popup v-model:show="editProfileDialogVisible" position="bottom" round>
        <div class="popup-content">
          <h3>编辑资料</h3>
          <van-form @submit="handleEditProfile">
            <!-- 头像上传 -->
            <div class="avatar-upload">
              <div class="avatar-preview">
                <div class="avatar-wrapper">
                  <img v-if="editForm.avatar" :src="editForm.avatar" alt="头像" style="width: 100%;height: 100%;">
                  <div v-else class="avatar-placeholder-popup">
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
            
            <!-- 用户名 -->
            <van-field v-model="editForm.username" name="username" label="用户名" placeholder="请输入用户名" :rules="[{ required: true, message: '请输入用户名' }]" />
            
            <!-- 手机号（只读） -->
            <van-field v-model="editForm.phone" name="phone" label="手机号" :readonly="true" />
            
            <div class="form-actions">
              <van-button type="default" @click="editProfileDialogVisible = false">取消</van-button>
              <van-button type="primary" native-type="submit" :loading="editingProfile">确认修改</van-button>
            </div>
          </van-form>
        </div>
      </van-popup>
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
const logoutDialogVisible = ref(false);
const editProfileDialogVisible = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const changingPassword = ref(false);
const editingProfile = ref(false);

// 编辑资料表单数据
const editForm = ref({
  username: '',
  phone: '',
  avatar: ''
});

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
  // 填充表单数据
  editForm.value = {
    username: user.value.username,
    phone: user.value.phone,
    avatar: user.value.avatar || ''
  };
  // 显示弹窗
  editProfileDialogVisible.value = true;
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
      editForm.value.avatar = compressedDataUrl;
    }
  };
};

// 处理编辑资料
const handleEditProfile = async () => {
  try {
    editingProfile.value = true;

    // 调用编辑资料API
    const response = await userApi.updateProfile({
      username: editForm.value.username,
      avatar: editForm.value.avatar
    });

    if (response.success) {
      toast.success('资料修改成功');
      
      // 关闭弹窗
      editProfileDialogVisible.value = false;
      
      // 更新用户信息
      await getUserInfo();
    } else {
      toast.error(response.message || '资料修改失败');
    }
  } catch (error: any) {
    toast.error(error.message || '资料修改失败');
  } finally {
    editingProfile.value = false;
  }
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

// 跳转到关于我们页面
const goToAbout = () => {
  router.push('/about');
};

// 确认退出登录
const confirmLogout = () => {
  // 清除本地存储
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // 跳转到登录页
  router.push('/login');
  toast.info('已退出登录');
  
  // 关闭弹窗
  logoutDialogVisible.value = false;
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
  display: block;
}

.avatar-wrapper .avatar-placeholder-popup {
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
  transition: opacity 0.3s ease;
}

.avatar-wrapper:hover .avatar-upload-overlay {
  opacity: 1;
}

.upload-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1989fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-button:hover {
  background-color: #fff;
  transform: scale(1.1);
}

.logout-container {
  margin-top: 40px;
  padding: 0 16px;
}

.logout-container .van-button {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

/* 弹窗样式 */
.score-dialog {
  padding: 20px;
}

.score-dialog h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
}

.dialog-message {
  text-align: center;
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  gap: 10px;
}

/* 头像上传样式 */
.avatar-upload {
  margin-bottom: 20px;
}

.avatar-preview {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.avatar-upload .avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-upload .avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
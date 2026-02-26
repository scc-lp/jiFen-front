<template>
  <div class="create-room-container">
    <!-- 头部导航 -->
    <div class="nav-bar">
      <van-icon name="arrow-left" @click="goBack" />
      <h1>创建房间</h1>
      <div class="placeholder"></div>
    </div>
    
    <!-- 主要内容 -->
    <div class="content">
      <van-form @submit="handleCreateRoom">
        <van-field
          v-model="roomName"
          name="roomName"
          label="房间名称"
          placeholder="请输入房间名称"
          :rules="[{ required: true, message: '请输入房间名称' }]"
        />
        
        <div class="form-actions">
          <van-button type="primary" native-type="submit" :loading="loading" block size="large">
            创建房间
          </van-button>
        </div>
      </van-form>
      
      <!-- 房间规则说明 -->
      <div class="room-rules">
        <h2>房间规则</h2>
        <ul>
          <li>创建者默认为房间管理员</li>
          <li>房间码为6位随机数字</li>
          <li>房间创建后可通过分享房间码邀请其他用户加入</li>
          <li>房间状态默认为"进行中"，可在房间内结束记分</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from '../utils/toast';
import { roomApi } from '../api/room';

const router = useRouter();
const roomName = ref('');
const loading = ref(false);

// 返回上一页
const goBack = () => {
  router.back();
};

// 处理创建房间
const handleCreateRoom = async () => {
  try {
    loading.value = true;
    
    // 调用创建房间API
    const response = await roomApi.createRoom({
      room_name: roomName.value
    });
    
    if (response.success && response.data) {
      toast.success('房间创建成功');
      
      // 跳转到刚创建的房间详情页面
      router.push(`/room-detail/${response.data.id}`);
    } else {
      toast.error(response.message || '房间创建失败');
    }
  } catch (error: any) {
    toast.error(error.message || '网络错误');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.create-room-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.nav-bar h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.nav-bar .placeholder {
  width: 24px;
}

.content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.form-actions {
  margin-top: 32px;
}

.room-rules {
  margin-top: 48px;
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.room-rules h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #333;
}

.room-rules ul {
  margin: 0;
  padding-left: 20px;
}

.room-rules li {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}
</style>
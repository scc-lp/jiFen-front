<template>
  <div class="join-room-container">
    <!-- 头部导航 -->
    <div class="nav-bar">
      <van-icon name="arrow-left" @click="goBack" />
      <h1>加入房间</h1>
      <div class="placeholder"></div>
    </div>

    <!-- 主要内容 -->
    <div class="content">
      <!-- 扫描加入 -->
      <div class="scan-section">
        <div class="scan-area">
          <van-icon name="scan" size="80px" color="#1989fa" />
          <p>扫描二维码加入房间</p>
          <van-button type="primary" size="small" @click="openCamera">打开相机</van-button>
        </div>
      </div>

      <!-- 输入房间码加入 -->
      <div class="input-section">
        <h2>或输入房间码加入</h2>

        <van-form @submit="handleJoinRoom">
          <van-field v-model="roomCode" name="roomCode" label="房间码" placeholder="请输入6位房间码" :rules="[{
            required: true,
            message: '请输入房间码'
          }, {
            pattern: /^\d{6}$/,
            message: '请输入6位数字房间码'
          }]" />

          <div class="form-actions">
            <van-button type="primary" native-type="submit" :loading="loading" block size="large">
              加入房间
            </van-button>
          </div>
        </van-form>
      </div>

      <!-- 加入规则说明 -->
      <div class="join-rules">
        <h2>加入规则</h2>
        <ul>
          <li>新用户需要先注册才能加入房间</li>
          <li>未登录的老用户需要先登录才能加入房间</li>
          <li>加入房间后自动成为房间成员</li>
          <li>可在房间内查看和修改个人信息</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { toast } from '../utils/toast';
import { roomApi } from '../api/room.ts';

const router = useRouter();
const route = useRoute();
const roomCode = ref('');
const loading = ref(false);

// 返回上一页
const goBack = () => {
  router.back();
};

// 处理加入房间
const handleJoinRoom = async () => {
  console.log('handleJoinRoom called, roomCode:', roomCode.value);
  try {
    loading.value = true;
    console.log('Loading set to true');
    
    // 尝试调用加入房间API
    console.log('Calling joinRoom API');
    const joinResponse = await roomApi.joinRoom({
      room_code: roomCode.value
    });
    console.log('joinResponse:', joinResponse);
    
    if (joinResponse.success && joinResponse.data) {
        toast.success('加入房间成功');
        // 跳转到刚加入的房间详情页面
        // 如果房间已结束，设置mode为view
        const mode = joinResponse.data.status === 'ended' ? 'view' : 'normal';
        console.log('Joining room success, redirecting to:', `/room-detail/${joinResponse.data.id}`, { mode });
        router.push({ path: `/room-detail/${joinResponse.data.id}`, query: { mode } });
      } else {
        // 加入房间失败，可能是因为用户已经在房间中
        // 尝试根据房间码获取房间信息
        console.log('Join room failed, trying to get room by code');
        const roomResponse = await roomApi.getRoomByCode(roomCode.value);
        console.log('roomResponse:', roomResponse);
        
        if (roomResponse.success && roomResponse.data) {
          // 房间存在，直接跳转到房间详情页面
          toast.success('加入房间成功');
          // 如果房间已结束，设置mode为view
          const mode = roomResponse.data.status === 'ended' ? 'view' : 'normal';
          console.log('Room exists, redirecting to:', `/room-detail/${roomResponse.data.id}`, { mode });
          router.push({ path: `/room-detail/${roomResponse.data.id}`, query: { mode } });
        } else {
          console.log('Room not found or error:', joinResponse.message);
          toast.error(joinResponse.message || '加入房间失败');
        }
      }
    } catch (error: any) {
      console.log('Error in joinRoom API:', error);
      // 加入房间API调用失败，可能是因为用户已经在房间中
      // 尝试根据房间码获取房间信息
      try {
        console.log('Trying to get room by code after error');
        const roomResponse = await roomApi.getRoomByCode(roomCode.value);
        console.log('roomResponse after error:', roomResponse);
        
        if (roomResponse.success && roomResponse.data) {
          // 房间存在，直接跳转到房间详情页面
          toast.success('加入房间成功');
          // 如果房间已结束，设置mode为view
          const mode = roomResponse.data.status === 'ended' ? 'view' : 'normal';
          console.log('Room exists after error, redirecting to:', `/room-detail/${roomResponse.data.id}`, { mode });
          router.push({ path: `/room-detail/${roomResponse.data.id}`, query: { mode } });
        } else {
          console.log('Room not found after error:', error.message);
          toast.error(error.message || '加入房间失败');
        }
      } catch (innerError: any) {
        console.log('Inner error:', innerError);
        toast.error(innerError.message || '网络错误');
      }
    } finally {
    loading.value = false;
    console.log('Loading set to false');
  }
};

// 页面挂载时检查URL参数
onMounted(() => {
  // 检查URL参数中是否有room_code
  const urlRoomCode = route.query.room_code as string;
  if (urlRoomCode) {
    // 自动填充房间码
    roomCode.value = urlRoomCode;
    // 显示调试信息
    toast.info(`房间码: ${urlRoomCode}`);
    // 尝试自动加入房间
    handleJoinRoom();
  }
});

// 打开相机
const openCamera = () => {
  // 检测是否在微信环境中
  const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
  
  if (isWeChat) {
    // 在微信环境中，提示用户使用微信扫一扫
    toast.info('请使用微信扫一扫功能扫描二维码');
  } else {
    // 不在微信环境中，尝试打开相机
    try {
      // 这里可以集成第三方扫码库，如qrcode.js或zxing
      // 由于浏览器安全限制，需要用户交互才能访问摄像头
      // 这里只是一个示例，实际需要集成扫码库
      toast.info('请使用相机应用扫描二维码');
    } catch (error) {
      toast.error('无法打开相机，请手动扫描二维码');
    }
  }
};
</script>

<style scoped>
.join-room-container {
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

.scan-section {
  background-color: white;
  border-radius: 8px;
  padding: 32px 16px;
  text-align: center;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.scan-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.scan-area p {
  margin: 0;
  color: #666;
}

.input-section {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.input-section h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  text-align: center;
  color: #333;
}

.form-actions {
  margin-top: 32px;
}

.join-rules {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.join-rules h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #333;
}

.join-rules ul {
  margin: 0;
  padding-left: 20px;
}

.join-rules li {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}
</style>
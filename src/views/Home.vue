<template>
  <div class="home-container">
    <!-- 头部 -->
    <div class="header">
      <h1>记分器</h1>
    </div>

    <!-- 主要内容区域 -->
    <div class="content">
      <!-- 快速操作 -->
      <div class="quick-actions">
        <van-button type="primary" block size="large" @click="goToCreateRoom">
          <van-icon name="add" />
          创建房间
        </van-button>
        <van-button type="default" block size="large" @click="goToJoinRoom">
          <van-icon name="scan" />
          加入房间
        </van-button>
      </div>

      <!-- 我的房间 -->
      <div class="my-rooms">
        <div class="section-header">
          <h2>我的房间</h2>
          <!-- <van-button type="primary" size="small">查看全部</van-button> -->
        </div>

        <div v-if="rooms.length === 0" class="empty-room">
          <van-empty description="暂无房间" />
          <van-button type="primary" size="small" @click="goToCreateRoom">创建第一个房间</van-button>
        </div>

        <van-list v-model:loading="loadingMore" :finished="!hasMore" finished-text="没有更多房间了" @load="onLoad"
          @refresh="onRefresh" :pull-refresh="true" :immediate-check="false">
          <div v-for="room in rooms" :key="room.id" class="room-item">
            <div class="room-info">
              <h3>{{ room.room_name }}</h3>
              <p>房间码: {{ room.room_code }}</p>
              <p>状态: {{ room.status === 'active' ? '进行中' : '已结束' }}</p>
            </div>
            <van-button v-if="room.status === 'active'" type="primary" size="small"
              @click="enterRoom(room.id.toString())">进入房间</van-button>
            <van-button v-else type="primary" size="small" @click="viewRecord(room.id.toString())">查看记录</van-button>
          </div>
        </van-list>
      </div>
    </div>

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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from '../utils/toast';
import { roomApi } from '../api/room';

// 类型定义
interface RoomInfo {
  id: number;
  room_code: string;
  room_name: string;
  status: 'active' | 'ended';
  created_at: string;
  ended_at: string | null;
  creator_id: number;
}

const router = useRouter();
const rooms = ref<RoomInfo[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const hasMore = ref(true);

// 检查用户房间状态
const checkUserRoomStatus = async () => {
  try {
    const response = await roomApi.checkUserRoomStatus();
    if (response.success && response.data) {
      return response.data;
    }
    return { inRoom: false };
  } catch (error) {
    console.error('检查用户房间状态失败:', error);
    return { inRoom: false };
  }
};

// 跳转到创建房间页面
const goToCreateRoom = async () => {
  // 检查用户当前房间状态
  const status = await checkUserRoomStatus();
  if (status.inRoom) {
    toast.warning(`您当前在房间 ${status.roomName} 中，请先离开该房间`);
    return;
  }
  router.push('/create-room');
};

// 跳转到加入房间页面
const goToJoinRoom = async () => {
  // 检查用户当前房间状态
  const status = await checkUserRoomStatus();
  if (status.inRoom) {
    toast.warning(`您当前在房间 ${status.roomName} 中，请先离开该房间`);
    return;
  }
  router.push('/join-room');
};

// 进入房间
const enterRoom = (roomId: string) => {
  router.push(`/room-detail/${roomId}`);
};

// 查看记录
const viewRecord = (roomId: string) => {
  router.push(`/room-detail/${roomId}?mode=view`);
};

// 从API获取房间数据
const fetchRooms = async (isLoadMore = false) => {
  try {
    if (isLoadMore) {
      loadingMore.value = true;
    } else {
      loading.value = true;
      page.value = 1;
      rooms.value = [];
      hasMore.value = true;
    }

    const response = await roomApi.getRooms(page.value, pageSize.value);

    if (response.success && response.data) {
      if (isLoadMore) {
        // 加载更多，追加数据
        rooms.value = [...rooms.value, ...(response.data.rooms as RoomInfo[] || [])];
      } else {
        // 首次加载，替换数据
        rooms.value = (response.data.rooms as RoomInfo[]) || [];
      }
      total.value = response.data.total || 0;
      page.value++;

      // 检查是否还有更多数据
      hasMore.value = rooms.value.length < total.value;
    } else {
      if (!isLoadMore) {
        rooms.value = [];
        toast.error(response.message || '获取房间列表失败');
      }
    }
  } catch (error: any) {
    toast.error(error.message || '网络错误');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

// 页面挂载时获取房间数据
onMounted(() => {
  fetchRooms();
});

// 页面卸载时移除滚动事件监听器
onUnmounted(() => {
  // 移除滚动事件监听器（如果之前添加过）
  window.removeEventListener('scroll', handleScroll);
});

// 处理滚动事件（保留以备后用）
const handleScroll = () => {
  // 检查是否已经在加载更多
  if (loadingMore.value || !hasMore.value) return;

  // 检查是否滚动到底部
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  const clientHeight = document.documentElement.clientHeight || window.innerHeight;

  // 当滚动到距离底部100px时，加载更多
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    fetchRooms(true);
  }
};

// 加载更多数据
const onLoad = () => {
  // 只有在有更多数据时才加载
  if (hasMore.value) {
    fetchRooms(true);
  } else {
    // 没有更多数据时，设置loadingMore为false，防止无限触发
    loadingMore.value = false;
  }
};

// 下拉刷新
const onRefresh = () => {
  // 重置分页参数
  page.value = 1;
  hasMore.value = true;
  rooms.value = [];
  // 重新加载数据
  fetchRooms();
};
</script>

<style scoped>
.home-container {
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
  font-size: 20px;
  font-weight: 600;
}

.content {
  flex: 1;
  padding: 16px;
  padding-bottom: 70px;
  /* 添加底部padding，确保内容不会被tabbar盖住 */
  overflow-y: auto;
}

.quick-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.room-list {
  margin-bottom: 24px;
}

.room-item {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.room-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.empty-room {
  background-color: white;
  border-radius: 8px;
  padding: 32px 16px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}



.tabbar {
  border-top: 1px solid #ebedf0;
  background-color: white;
}
</style>
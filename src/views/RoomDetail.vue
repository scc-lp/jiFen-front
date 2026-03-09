<template>
  <div class="room-detail-container">
    <!-- 头部导航 -->
    <div class="nav-bar">
      <van-icon name="arrow-left" @click="goBack" />
      <h1>{{ roomInfo.room_name || '房间详情' }}</h1>
      <!-- 只有房主有权限结束记分，其他用户显示离开房间 -->
      <template v-if="roomInfo.status === 'active' && mode !== 'view'">
        <van-button type="primary" size="small" @click="endRoom" v-if="isCreator">结束记分</van-button>
        <van-button type="default" size="small" @click="leaveRoom" v-else>离开房间</van-button>
      </template>
    </div>

    <!-- 主要内容 -->
    <div class="content">
      <!-- 房间信息 -->
      <div class="room-info">
        <div class="info-item">
          <span class="label">房间名称</span>
          <span class="value">{{ roomInfo.room_name }}</span>
        </div>
        <div class="info-item">
          <span class="label">房间码</span>
          <span class="value">{{ roomInfo.room_code }} <van-button v-if="mode !== 'view' && roomInfo.room_code"
              size="small" @click="copyRoomCode">复制</van-button></span>
        </div>
        <div class="info-item" v-if="mode !== 'view' && roomInfo.status === 'active'">
          <span class="label">加入方式</span>
          <span class="value"><van-button size="small" @click="showQRCode">查看二维码</van-button></span>
        </div>
        <div class="info-item">
          <span class="label">状态</span>
          <span class="value">{{ roomInfo.status === 'active' && '进行中' || roomInfo.status === 'ended' && '已结束' ||
            '' }}</span>
        </div>
        <div class="info-item">
          <span class="label">创建时间</span>
          <span class="value">{{ formatDate(roomInfo.created_at) }}</span>
        </div>
      </div>

      <!-- 玩家列表 -->
      <div class="players-section">
        <div class="section-header">
          <h2>玩家列表</h2>
        </div>

        <div class="player-list">
          <div v-if="players.length === 0" class="empty-players">
            <van-empty description="暂无玩家" />
          </div>

          <div v-else class="player-item" v-for="player in players" :key="player.id">
            <div class="player-info">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="player-avatar">
                  <img v-if="player.avatar" :src="player.avatar" alt="头像" class="avatar">
                  <div v-else class="avatar-placeholder">
                    <van-icon name="user-o" size="24px" />
                  </div>
                </div>
                <div class="player-details">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div>{{ player.player_name }}</div>
                    <van-tag v-if="player.is_creator" color="#1989fa">房主</van-tag>
                  </div>
                  <p>分数: <span style="color: #1989fa;font-weight: bold;">{{ player.score || 0 }}</span></p>
                  <p v-if="currentUser && player.user_id === currentUser.id" style="font-size: 12px; color: #999;">（我）
                  </p>
                </div>
              </div>
            </div>

            <!-- 只对非当前用户显示给分按钮 -->
            <div class="score-controls" v-if="currentUser && player.user_id !== currentUser.id && mode !== 'view'">
              <van-button type="primary" size="small"
                @click="openScoreDialog(player.id, player.player_name)">给分</van-button>
            </div>

            <!-- 只对当前用户显示批量给分按钮 -->
            <div class="score-controls" v-if="currentUser && player.user_id === currentUser.id && mode !== 'view'">
              <van-button type="primary" size="small" @click="openBatchScoreDialog">批量给分</van-button>
            </div>

            <!-- <div class="player-actions">
              <van-button type="primary" size="small" @click="editPlayer(player.id)">编辑</van-button>
              <van-button type="danger" size="small" @click="removePlayer(player.id)">移除</van-button>
            </div> -->
          </div>
        </div>
      </div>

      <!-- 分数记录 -->
      <div class="score-history">
        <div class="section-header">
          <h2>分数记录</h2>
        </div>

        <div class="history-list">
          <div v-if="scoreHistory.length === 0" class="empty-history">
            <van-empty description="暂无分数记录" />
          </div>

          <div v-else class="history-item" v-for="record in scoreHistory.filter(r => r.score_change > 0)"
            :key="record.id">
            <div class="history-info">
              <p v-if="record.giver_name">{{ record.giver_name }} 给 {{ record.player_name }} {{ record.score_change }}分
              </p>
              <p class="time">{{ formatDateTime(record.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 给分弹窗 -->
    <van-popup v-if="mode !== 'view'" v-model:show="scoreDialogVisible" round position="center"
      :style="{ width: '80%' }">
      <div class="score-dialog">
        <h3>给{{ selectedPlayerName }}分数</h3>
        <div class="score-input">
          <van-field ref="scoreInputRef" v-model="scoreInput" type="number" label="分数" placeholder="请输入分数" :min="0"
            step="1" />
        </div>
        <div class="dialog-actions">
          <van-button type="default" block @click="scoreDialogVisible = false">取消</van-button>
          <van-button type="primary" block @click="confirmScore">确认</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 批量给分弹窗 -->
    <van-popup v-if="mode !== 'view'" v-model:show="batchScoreDialogVisible" round position="center"
      :style="{ width: '80%' }">
      <div class="score-dialog">
        <h3>批量给分</h3>
        <div class="score-input">
          <van-field ref="batchScoreInputRef" v-model="batchScoreInput" type="number" label="分数" placeholder="请输入分数"
            :min="0" step="1" />
        </div>
        <div class="dialog-actions">
          <van-button type="default" block @click="batchScoreDialogVisible = false">取消</van-button>
          <van-button type="primary" block @click="confirmBatchScore">确认</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 确认结束弹窗 -->
    <van-popup v-if="mode !== 'view'" v-model:show="confirmEndDialogVisible" round position="center"
      :style="{ width: '90%' }">
      <div class="score-dialog">
        <h3>确认结束</h3>
        <p class="dialog-message">确定要结束记分吗？结束后房间将无法继续记分。</p>
        <div class="dialog-actions">
          <van-button type="default" block @click="confirmEndDialogVisible = false">取消</van-button>
          <van-button type="primary" block @click="confirmEndRoom">确认</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 确认离开弹窗 -->
    <van-popup v-if="mode !== 'view'" v-model:show="confirmLeaveDialogVisible" round position="center"
      :style="{ width: '80%' }">
      <div class="score-dialog">
        <h3>确认离开</h3>
        <p class="dialog-message">确定要离开该房间吗？离开后可以再次加入。</p>
        <div class="dialog-actions">
          <van-button type="default" block @click="confirmLeaveDialogVisible = false">取消</van-button>
          <van-button type="primary" block @click="confirmLeaveRoom">确认</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 二维码弹窗 -->
    <van-popup v-if="mode !== 'view'" v-model:show="qrCodeDialogVisible" round position="center"
      :style="{ width: '80%' }">
      <div class="score-dialog">
        <h3>房间二维码</h3>
        <div class="qr-code-container">
          <img :src="qrCodeUrl" alt="房间二维码" class="qr-code">
          <p class="qr-code-tip">扫描二维码加入房间</p>
        </div>
        <div class="dialog-actions">
          <van-button type="primary" block @click="qrCodeDialogVisible = false">关闭</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { toast } from '../utils/toast';
import { io } from 'socket.io-client';
import { roomApi } from '../api/room';
import { playerApi } from '../api/player';
import { scoreApi } from '../api/score';
import { userApi } from '../api/user';

const router = useRouter();
const route = useRoute();
const roomId = computed(() => route.params.roomId as string);
const mode = computed(() => route.query.mode as string || 'normal');

// 类型定义
interface RoomInfo {
  id: number;
  room_code: string;
  room_name: string;
  status: 'active' | 'ended' | '';
  created_at: string;
  ended_at: string | null;
  creator_id: number;
}

interface PlayerInfo {
  id: number;
  room_id: number;
  user_id: number | null;
  player_name: string;
  is_creator: number;
  score: number;
  created_at: string;
  avatar?: string;
}

interface ScoreRecord {
  id: number;
  room_id: number;
  player_id: number;
  player_name: string;
  score_change: number;
  current_score: number;
  created_at: string;
  giver_name?: string;
}

// 状态管理
const roomInfo = ref<RoomInfo>({
  id: 0,
  room_code: '',
  room_name: '',
  status: '',
  created_at: '',
  ended_at: null,
  creator_id: 0
});
const players = ref<PlayerInfo[]>([]);
const scoreHistory = ref<ScoreRecord[]>([]);
const loading = ref(false);
const currentUser = ref<{ id: number } | null>(null);
const socket = ref<any>(null);

// 给分弹窗相关状态
const scoreDialogVisible = ref(false);
const batchScoreDialogVisible = ref(false);
const confirmEndDialogVisible = ref(false);
const confirmLeaveDialogVisible = ref(false);
const qrCodeDialogVisible = ref(false);
const qrCodeUrl = ref('');
const selectedPlayerId = ref(0);
const selectedPlayerName = ref('');
const scoreInput = ref('');
const batchScoreInput = ref('');
const scoreInputRef = ref<any>(null);
const batchScoreInputRef = ref<any>(null);
// 判断当前用户是否是房主
const isCreator = computed(() => {
  if (!currentUser.value) return false;
  const currentPlayer = players.value.find(p => p.user_id === currentUser.value?.id);
  return currentPlayer?.is_creator === 1;
});

// 返回上一页
const goBack = () => {
  // router.back();
  router.push('/home');
};

// 格式化日期时间
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

// 复制房间码
const copyRoomCode = async () => {
  const roomCode = roomInfo.value.room_code;
  if (!roomCode) {
    toast.error('房间码不存在');
    return;
  }
  
  // 优先使用 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(roomCode);
      toast.success('房间码已复制');
      return;
    } catch (error) {
      console.error('Clipboard API 失败:', error);
    }
  }
  
  // 后备方案：使用 textarea 复制
  try {
    const textarea = document.createElement('textarea');
    textarea.value = roomCode;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (result) {
      toast.success('房间码已复制');
    } else {
      toast.error('复制失败，请手动复制: ' + roomCode);
    }
  } catch (error) {
    console.error('复制失败:', error);
    toast.error('复制失败，请手动复制: ' + roomCode);
  }
};

// 显示二维码
const showQRCode = () => {
  // 生成二维码URL，使用在线二维码生成服务
  const currentUrl = window.location.origin;
  const roomId = roomInfo.value.id;
  // 由于使用了哈希路由，需要在URL中添加#
  const qrContent = `${currentUrl}/#/room-detail/${roomId}`;
  // 使用QRCode.js或在线服务生成二维码
  qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrContent)}`;
  qrCodeDialogVisible.value = true;
};

// 获取当前用户信息
const fetchCurrentUser = async () => {
  try {
    const response = await userApi.getProfile();
    if (response.success && response.data) {
      currentUser.value = { id: response.data.id };
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

// 获取房间详情
const fetchRoomDetail = async (options: { roomInfo?: boolean; players?: boolean; scoreHistory?: boolean } = { roomInfo: true, players: true, scoreHistory: true }) => {
  try {
    loading.value = true;
    // showLoading({ message: '加载中...' });

    // 并行执行API调用，提高性能
    const promises = [];

    if (options.roomInfo) {
      promises.push(roomApi.getRoomDetail(Number(roomId.value)));
    }

    if (options.players) {
      promises.push(playerApi.getPlayers(Number(roomId.value)));
    }

    if (options.scoreHistory) {
      promises.push(scoreApi.getScoreHistory(Number(roomId.value)));
    }

    const results = await Promise.all(promises);

    // 处理结果
    let index = 0;
    if (options.roomInfo) {
      const roomResponse = results[index++];
      if (roomResponse && roomResponse.success && roomResponse.data) {
        roomInfo.value = roomResponse.data as RoomInfo;
      } else {
        toast.error(roomResponse?.message || '获取房间信息失败');
      }
    }

    if (options.players) {
      const playersResponse = results[index++];
      if (playersResponse && playersResponse.success && playersResponse.data) {
        players.value = playersResponse.data as PlayerInfo[];
      } else {
        toast.error(playersResponse?.message || '获取玩家列表失败');
      }
    }

    if (options.scoreHistory) {
      const historyResponse = results[index++];
      if (historyResponse && historyResponse.success && historyResponse.data) {
        scoreHistory.value = historyResponse.data as ScoreRecord[];
      } else {
        toast.error(historyResponse?.message || '获取分数记录失败');
      }
    }
  } catch (error: any) {
    toast.error(error.message || '网络错误');
  } finally {
    loading.value = false;
    // hideLoading();
  }
};



// 修改玩家分数
const changeScore = async (playerId: number, scoreChange: number) => {
  try {
    const response = await scoreApi.updateScore({
      room_id: Number(roomId.value),
      player_id: playerId,
      score_change: scoreChange
    });

    if (response.success) {
      // 重新获取玩家列表和分数记录
      const [playersResponse, historyResponse] = await Promise.all([
        playerApi.getPlayers(Number(roomId.value)),
        scoreApi.getScoreHistory(Number(roomId.value))
      ]);

      if (playersResponse.success && playersResponse.data) {
        players.value = playersResponse.data as PlayerInfo[];
      }

      if (historyResponse.success && historyResponse.data) {
        scoreHistory.value = historyResponse.data as ScoreRecord[];
      }
    } else {
      toast.error(response.message || '更新分数失败');
    }
  } catch (error: any) {
    toast.error(error.message || '网络错误');
  }
};

// 打开给分弹窗
const openScoreDialog = (playerId: number, playerName: string) => {
  selectedPlayerId.value = playerId;
  selectedPlayerName.value = playerName;
  scoreInput.value = ''; // 默认值为1
  scoreDialogVisible.value = true;
  // 等待DOM更新后聚焦到输入框
  nextTick(() => {
    if (scoreInputRef.value) {
      scoreInputRef.value.focus();
    }
  });
};

// 确认给分
const confirmScore = async () => {
  const scoreChange = Number(scoreInput.value);
  if (isNaN(scoreChange)) {
    toast.warning('请输入有效的分数');
    return;
  }

  await changeScore(selectedPlayerId.value, scoreChange);
  scoreDialogVisible.value = false;
};

// 打开批量给分弹窗
const openBatchScoreDialog = () => {
  batchScoreInput.value = ''; // 默认值为1
  batchScoreDialogVisible.value = true;
  // 等待DOM更新后聚焦到输入框
  nextTick(() => {
    if (batchScoreInputRef.value) {
      batchScoreInputRef.value.focus();
    }
  });
};

// 确认批量给分
const confirmBatchScore = async () => {
  const scoreChange = Number(batchScoreInput.value);
  if (isNaN(scoreChange)) {
    toast.warning('请输入有效的分数');
    return;
  }

  // 批量给分给所有其他玩家
  const otherPlayers = players.value.filter(p => p.id !== selectedPlayerId.value);

  try {
    // 并行执行给分操作，提高性能
    const promises = otherPlayers.map(player => changeScore(player.id, scoreChange));
    await Promise.all(promises);

    toast.success('批量给分成功');
    batchScoreDialogVisible.value = false;
  } catch (error: any) {
    toast.error(error.message || '批量给分失败');
  }
};

// 初始化Socket.io连接
const initSocket = () => {
  console.log('开始初始化Socket.io连接');
  // 从环境变量获取后端服务器地址
  const backendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';
  console.log('后端服务器地址:', backendUrl);

  // 获取当前token用于身份验证
  const token = localStorage.getItem('token') || '';

  // 创建Socket.io连接，使用环境变量中的后端地址
  socket.value = io(backendUrl, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 5000,
    autoConnect: true,
    auth: {
      token: token
    }
  });

  // 连接成功事件
  socket.value.on('connect', () => {
    console.log('Socket.io连接成功:', socket.value.id);
    // 加入当前房间
    if (roomId.value) {
      console.log('准备加入房间:', Number(roomId.value));
      socket.value.emit('joinRoom', Number(roomId.value));
      console.log('加入房间成功:', Number(roomId.value));
    }
  });

  // 分数更新事件
  socket.value.on('scoreUpdated', async (data: any) => {
    console.log('收到分数更新事件:', data);
    // 只获取玩家列表和分数记录，不需要获取房间信息
    await fetchRoomDetail({ roomInfo: false, players: true, scoreHistory: true });
  });

  // 新玩家加入事件
  socket.value.on('playerAdded', async (data: any) => {
    console.log('收到新玩家加入事件:', data);
    // 检查事件中的room_id是否与当前房间的ID匹配
    if (data.room_id === Number(roomId.value)) {
      console.log('房间ID匹配，更新玩家列表');
      // 只获取玩家列表，不需要获取房间信息和分数记录
      await fetchRoomDetail({ roomInfo: false, players: true, scoreHistory: false });
    } else {
      console.log('房间ID不匹配，忽略事件');
    }
  });

  // 连接错误事件
  socket.value.on('connect_error', (error: any) => {
    console.error('Socket.io连接错误:', error);
  });

  // 断开连接事件
  socket.value.on('disconnect', (reason: any) => {
    console.log('Socket.io断开连接:', reason);
  });

  // 加入房间成功事件
  socket.value.on('joinRoomSuccess', (roomId: any) => {
    console.log('加入房间成功:', roomId);
  });

  // 玩家离开事件
  socket.value.on('playerLeft', async (data: any) => {
    console.log('收到玩家离开事件:', data);
    // 检查事件中的room_id是否与当前房间的ID匹配
    if (data.room_id === Number(roomId.value)) {
      console.log('房间ID匹配，更新玩家列表');
      // 重新获取玩家列表
      const playersResponse = await playerApi.getPlayers(Number(roomId.value));
      if (playersResponse.success && playersResponse.data) {
        console.log('更新玩家列表:', playersResponse.data);
        players.value = playersResponse.data as PlayerInfo[];
      }
    } else {
      console.log('房间ID不匹配，忽略事件');
    }
  });

  // 监听用户信息更新事件
  socket.value.on('userUpdated', async (data: any) => {
    console.log('收到用户信息更新事件:', data);
    // 重新获取玩家列表
    const playersResponse = await playerApi.getPlayers(Number(roomId.value));
    if (playersResponse.success && playersResponse.data) {
      console.log('更新玩家列表:', playersResponse.data);
      players.value = playersResponse.data as PlayerInfo[];
    }
  });

  // 房间结束事件
  socket.value.on('roomEnded', (data: any) => {
    // 检查事件中的room_id是否与当前房间的ID匹配
    if (data.room_id === Number(roomId.value)) {
      // 提示房间已关闭
      toast.info(data.message || '此房间已关闭');
      // 跳转到首页
      router.push('/home');
    } else {
      console.log('房间ID不匹配，忽略事件');
    }
  });
};

// 断开Socket.io连接
const disconnectSocket = () => {
  if (socket.value) {
    // 离开房间
    if (roomId.value) {
      socket.value.emit('leaveRoom', Number(roomId.value));
    }
    // 断开连接
    socket.value.disconnect();
    socket.value = null;
    console.log('Socket.io连接已断开');
  }
};

// 页面挂载时获取数据并初始化Socket.io
onMounted(async () => {
  await fetchCurrentUser();

  // 获取房间详情
  await fetchRoomDetail();

  // 检查用户是否已经在房间中
  if (currentUser.value && roomInfo.value.status === 'active') {
    // 检查玩家列表中是否有当前用户
    const isInRoom = players.value.some(p => p.user_id === currentUser.value?.id);

    if (!isInRoom) {
      // 如果用户不在房间中，自动加入房间
      try {
        const response = await roomApi.joinRoom({ room_code: roomInfo.value.room_code });
        if (response.success) {
          // 重新获取玩家列表
          const playersResponse = await playerApi.getPlayers(Number(roomId.value));
          if (playersResponse.success && playersResponse.data) {
            players.value = playersResponse.data as PlayerInfo[];
          }
        } else {
          console.error('自动加入房间失败:', response.message);
        }
      } catch (error) {
        console.error('自动加入房间失败:', error);
      }
    }
  }

  // 检查是否是房主，并且是第一次进入房间，如果是，自动显示二维码
  if (isCreator.value && roomInfo.value.status === 'active') {
    // 检查是否已经显示过二维码
    const shownRooms = localStorage.getItem('shown_qr_rooms');
    const shownRoomsArray = shownRooms ? JSON.parse(shownRooms) : [];

    // 如果房间ID不在已显示列表中，自动显示二维码
    if (!shownRoomsArray.includes(roomInfo.value.id)) {
      // 显示二维码
      showQRCode();

      // 将房间ID添加到已显示列表中
      shownRoomsArray.push(roomInfo.value.id);
      localStorage.setItem('shown_qr_rooms', JSON.stringify(shownRoomsArray));
    }
  }

  // 确保roomId.value已经设置后再初始化Socket.io
  if (roomId.value) {
    initSocket();
  } else {
    console.error('房间ID未设置，无法初始化Socket.io连接');
  }
});

// 结束记分
const endRoom = async () => {
  confirmEndDialogVisible.value = true;
};

// 确认结束房间
const confirmEndRoom = async () => {
  try {
    const response = await roomApi.endRoom(Number(roomId.value));
    if (response.success) {
      toast.success('记分已结束');
      // 跳转到首页
      router.push('/home');
    } else {
      toast.error(response.message || '结束记分失败');
    }
  } catch (error: any) {
    toast.error(error.message || '网络错误');
  } finally {
    confirmEndDialogVisible.value = false;
  }
};

// 离开房间
const leaveRoom = async () => {
  confirmLeaveDialogVisible.value = true;
};

// 确认离开房间
const confirmLeaveRoom = async () => {
  try {
    // 找到当前用户对应的玩家ID
    const currentPlayer = players.value.find(p => p.user_id === currentUser.value?.id);
    if (currentPlayer) {
      // 调用后端API移除玩家
      const response = await playerApi.removePlayer(currentPlayer.id);
      if (response.success) {
        // 断开Socket.io连接
        disconnectSocket();
        // 跳转到首页
        router.push('/home');
      } else {
        toast.error(response.message || '离开房间失败');
      }
    } else {
      // 如果找不到玩家信息，直接断开连接并跳转
      disconnectSocket();
      router.push('/home');
    }
  } catch (error: any) {
    toast.error(error.message || '网络错误');
  } finally {
    confirmLeaveDialogVisible.value = false;
  }
};

// 页面卸载时断开Socket.io连接
onUnmounted(() => {
  disconnectSocket();
});
</script>

<style scoped>
.room-detail-container {
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
  flex: 1;
  text-align: center;
}

.content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.room-info {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #666;
  font-size: 14px;
}

.value {
  color: #333;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.players-section,
.score-history {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.player-list,
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-players,
.empty-history {
  text-align: center;
  padding: 32px 16px;
}

.player-item {
  border: 1px solid #ebedf0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-avatar {
  position: relative;
}

.player-avatar .avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.player-avatar .avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.player-info .player-details {
  flex: 1;
}

.player-info p {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #666;
}

.score-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.player-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.history-item {
  border-bottom: 1px solid #ebedf0;
  padding: 12px 0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-info {
  margin-bottom: 8px;
}

.history-info p {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
}

.history-info .time {
  font-size: 12px;
  color: #999;
}

.history-score {
  font-size: 14px;
  color: #666;
  text-align: right;
}

/* 给分弹窗样式 */
.score-dialog {
  padding: 20px;
}

.score-dialog h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
}

.score-input {
  margin-bottom: 20px;
}

.dialog-message {
  text-align: center;
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.qr-code {
  width: 200px;
  height: 200px;
  margin-bottom: 16px;
}

.qr-code-tip {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin: 0;
}

.dialog-actions {
  display: flex;
  gap: 10px;
}

/* 分数控制按钮样式 */
.score-controls {
  display: flex;
  gap: 5px;
}
</style>
import api from './api';

// 添加玩家参数
interface AddPlayerParams {
  room_id: number;
  player_name: string;
}

// 更新玩家参数
interface UpdatePlayerParams {
  player_name: string;
}

// 玩家信息
interface PlayerInfo {
  id: number;
  room_id: number;
  player_name: string;
  score: number;
  created_at: string;
}

// 响应格式
interface PlayerResponse {
  success: boolean;
  message: string;
  data?: PlayerInfo;
}

// 玩家列表响应
interface PlayerListResponse {
  success: boolean;
  message: string;
  data?: PlayerInfo[];
}

// 玩家相关API
export const playerApi = {
  // 获取玩家列表
  getPlayers: async (roomId: number): Promise<PlayerListResponse> => {
    return await api.get(`/players?room_id=${roomId}`);
  },
  
  // 添加玩家
  addPlayer: async (params: AddPlayerParams): Promise<PlayerResponse> => {
    return await api.post('/players', params);
  },
  
  // 更新玩家信息
  updatePlayer: async (playerId: number, params: UpdatePlayerParams): Promise<PlayerResponse> => {
    return await api.put(`/players/${playerId}`, params);
  },
  
  // 移除玩家
  removePlayer: async (playerId: number): Promise<PlayerResponse> => {
    return await api.delete(`/players/${playerId}`);
  }
};
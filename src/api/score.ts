import api from './api';

// 更新分数参数
interface UpdateScoreParams {
  room_id: number;
  player_id: number;
  score_change: number;
}

// 分数记录
interface ScoreRecord {
  id: number;
  room_id: number;
  player_id: number;
  player_name: string;
  score_change: number;
  current_score: number;
  created_at: string;
}

// 响应格式
interface ScoreResponse {
  success: boolean;
  message: string;
  data?: ScoreRecord;
}

// 分数记录列表响应
interface ScoreHistoryResponse {
  success: boolean;
  message: string;
  data?: ScoreRecord[];
}

// 分数相关API
export const scoreApi = {
  // 更新玩家分数
  updateScore: async (params: UpdateScoreParams): Promise<ScoreResponse> => {
    return await api.post('/scores', params);
  },
  
  // 获取分数历史记录
  getScoreHistory: async (roomId: number): Promise<ScoreHistoryResponse> => {
    return await api.get(`/scores?room_id=${roomId}`);
  }
};
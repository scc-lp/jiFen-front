import api from './api';

// 创建房间参数
interface CreateRoomParams {
  room_name: string;
}

// 加入房间参数
interface JoinRoomParams {
  room_code: string;
}

// 房间信息
interface RoomInfo {
  id: number;
  room_code: string;
  room_name: string;
  status: 'active' | 'ended';
  created_at: string;
}

// 响应格式
interface RoomResponse {
  success: boolean;
  message: string;
  data?: RoomInfo;
}

// 分页房间列表响应
interface PaginatedRoomListResponse {
  success: boolean;
  message: string;
  data?: {
    rooms: RoomInfo[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// 房间状态信息
interface RoomStatusInfo {
  inRoom: boolean;
  roomId?: number;
  roomName?: string;
  roomCode?: string;
}

// 房间状态响应
interface RoomStatusResponse {
  success: boolean;
  message: string;
  data?: RoomStatusInfo;
}

// 房间相关API
export const roomApi = {
  // 创建房间
  createRoom: async (params: CreateRoomParams): Promise<RoomResponse> => {
    return await api.post('/rooms/create', params);
  },
  
  // 加入房间
  joinRoom: async (params: JoinRoomParams): Promise<RoomResponse> => {
    return await api.post('/rooms/join', params);
  },
  
  // 获取房间列表
  getRooms: async (page: number = 1, pageSize: number = 10): Promise<PaginatedRoomListResponse> => {
    return await api.get(`/rooms?page=${page}&pageSize=${pageSize}`);
  },
  
  // 获取房间详情
  getRoomDetail: async (roomId: number): Promise<RoomResponse> => {
    return await api.get(`/rooms/${roomId}`);
  },
  
  // 结束房间
  endRoom: async (roomId: number): Promise<RoomResponse> => {
    return await api.put(`/rooms/${roomId}/end`);
  },
  
  // 根据房间码获取房间信息
  getRoomByCode: async (roomCode: string): Promise<RoomResponse> => {
    return await api.get(`/rooms/code/${roomCode}`);
  },
  
  // 检查用户当前房间状态
  checkUserRoomStatus: async (): Promise<RoomStatusResponse> => {
    return await api.get('/rooms/status/check');
  }
};
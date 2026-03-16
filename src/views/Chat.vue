<template>
  <div class="chat-container">
    <!-- 头部 -->
    <div class="header">
      <h1>智能聊天</h1>
    </div>

    <!-- 聊天消息区域 -->
    <div class="chat-messages" ref="messagesContainer">
      <!-- 系统消息 -->
      <div class="system-message" v-if="messages.length === 0">
        <p>您好！我是智能助手，有什么可以帮助您的吗？</p>
      </div>

      <!-- 消息列表 -->
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        :class="['message-item', message.role === 'user' ? 'user-message' : 'bot-message']"
      >
        <div class="message-content">
          {{ message.content }}
        </div>
      </div>

      <!-- 加载中状态 -->
      <div class="loading-message" v-if="isLoading">
        <van-loading type="spinner" size="20px" />
        <span>正在思考...</span>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <van-field
        v-model="inputMessage"
        type="textarea"
        placeholder="请输入您的问题..."
        :rows="3"
        :disabled="isLoading"
        @keyup.enter.exact="handleSend"
      />
      <van-button 
        type="primary" 
        size="large" 
        @click="handleSend"
        :disabled="!inputMessage.trim() || isLoading"
      >
        发送
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { chatApi } from '../api/chat';
import { toast } from '../utils/toast';

// 类型定义
interface Message {
  role: 'user' | 'bot';
  content: string;
}

// 响应式数据
const messages = ref<Message[]>([]);
const inputMessage = ref('');
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 发送消息
const handleSend = async () => {
  const message = inputMessage.value.trim();
  if (!message || isLoading.value) return;

  // 添加用户消息到列表
  messages.value.push({ role: 'user', content: message });
  inputMessage.value = '';
  scrollToBottom();

  try {
    isLoading.value = true;
    
    // 添加机器人消息占位
    const botMessageIndex = messages.value.length;
    messages.value.push({ role: 'bot', content: '' });

    // 使用封装的API方法
    await chatApi.sendMessageWithCallback(message, (content, isDone) => {
      if (content) {
        // 更新机器人消息
        messages.value[botMessageIndex].content += content;
        scrollToBottom();
      }
    });
  } catch (error: any) {
    toast.error(error.message || '发送消息失败');
    // 移除最后一条消息（机器人占位）
    if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === 'bot') {
      messages.value.pop();
    }
  } finally {
    isLoading.value = false;
  }
};

// 页面挂载时滚动到底部
onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-container {
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

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.system-message {
  background-color: #e8f0fe;
  padding: 12px;
  border-radius: 8px;
  align-self: center;
  max-width: 80%;
  text-align: center;
  font-size: 14px;
  color: #333;
}

.message-item {
  max-width: 80%;
  padding: 12px;
  border-radius: 8px;
  word-wrap: break-word;
}

.user-message {
  align-self: flex-end;
  background-color: #1989fa;
  color: white;
  border-bottom-right-radius: 2px;
}

.bot-message {
  align-self: flex-start;
  background-color: white;
  color: #333;
  border-bottom-left-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.loading-message {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-size: 14px;
  color: #666;
}

.input-area {
  padding: 16px;
  background-color: white;
  border-top: 1px solid #ebedf0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-area .van-field {
  margin-bottom: 0;
}

.input-area .van-button {
  align-self: flex-end;
  min-width: 80px;
}
</style>
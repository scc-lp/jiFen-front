// 聊天相关API
export const chatApi = {
  // 发送聊天消息（流式）
  sendMessage: async (query: string) => {
    return new Promise<string>((resolve, reject) => {
      // 创建一个AbortController来取消请求
      const controller = new AbortController();
      const signal = controller.signal;

      // 发起流式请求
      fetch(`${import.meta.env.VITE_API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
        signal,
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('网络错误');
          }
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('无法获取响应流');
          }
          let fullResponse = '';
          // 处理流式数据
          const processStream = async () => {
            const { done, value } = await reader.read();

            if (done) {
              resolve(fullResponse);
              return;
            }
            // 解码Uint8Array为字符串
            const chunk = new TextDecoder('utf-8').decode(value);
            // 分割SSE事件
            const events = chunk.split('\n\n');
            events.forEach(event => {
              if (event.startsWith('data: ')) {
                const data = event.substring(6);
                // 检查是否是结束标记
                if (data === '[DONE]') {
                  return;
                }
                try {
                  const parsedData = JSON.parse(data);
                  if (parsedData.content) {
                    fullResponse += parsedData.content;
                    // 可以在这里触发回调，实时更新UI
                  }
                } catch (error) {
                  console.error('解析数据失败:', error);
                }
              }
            });
            // 继续处理下一个数据块
            processStream();
          };
          processStream();
        })
        .catch(error => {
          reject(error);
        });

      // 返回一个取消函数
      return () => controller.abort();
    });
  },

  // 发送聊天消息（流式，带回调）
  sendMessageWithCallback: async (query: string, callback: (content: string, isDone: boolean) => void) => {
    return new Promise<void>((resolve, reject) => {
      // 发起流式请求
      fetch(`${import.meta.env.VITE_API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('网络错误');
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('无法获取响应流');
          }

          // 处理流式数据
          let buffer = '';
          
          const processStream = async () => {
            const { done, value } = await reader.read();
            
            if (done) {
              callback('', true); // 通知完成
              resolve();
              return;
            }

            // 解码Uint8Array为字符串
            const chunk = new TextDecoder('utf-8').decode(value);
            buffer += chunk;
            
            // 处理SSE事件
            let eventEndIndex;
            while ((eventEndIndex = buffer.indexOf('\n\n')) !== -1) {
              const event = buffer.substring(0, eventEndIndex);
              buffer = buffer.substring(eventEndIndex + 2);
              
              if (event.startsWith('data: ')) {
                const data = event.substring(6);
                
                // 检查是否是结束标记
                if (data === '[DONE]') {
                  callback('', true); // 通知完成
                  resolve();
                  return;
                }

                try {
                  const parsedData = JSON.parse(data);
                  if (parsedData.content) {
                    callback(parsedData.content, false); // 通知新内容
                  }
                } catch (error) {
                  console.error('解析数据失败:', error);
                }
              }
            }

            // 继续处理下一个数据块
            processStream();
          };

          processStream();
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
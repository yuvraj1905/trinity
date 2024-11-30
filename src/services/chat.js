import api from './api';

export const chatService = {
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // You can use this for progress tracking if needed
        }
      });
      return response.data; // Should return { fileId: 'xxx', url: 'xxx' }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
  },

  async sendMessage(message) {
    try {
      const response = await api.post('/chat/message', message);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  },

  async getChatHistory() {
    try {
      const response = await api.get('/chat/history');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch chat history');
    }
  },

  async getChat(chatId) {
    try {
      const response = await api.get(`/chat/${chatId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch chat');
    }
  },

  async sendChatMessage(message, followUp = null) {
    try {
      const response = await api.post('/chat', {
        message: message,
        follow_up: followUp
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send chat message');
    }
  }
}; 
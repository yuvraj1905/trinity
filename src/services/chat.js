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

  async getConversations() {
    try {
      const response = await api.get('/conversations');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch conversations');
    }
  },

  async createConversation() {
    try {
      const response = await api.post('/conversations');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create conversation');
    }
  },

  async getConversation(conversationId) {
    try {
      const response = await api.get(`/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch conversation');
    }
  },

  async sendChatMessage(message, followUp = null, file = null, conversationId = null) {
    try {
      let fileUrl = null;
      let imageUrl = null;

      if (file) {
        const uploadedUrl = await this.uploadToCloudinary(file);
        if (file.type.startsWith('image/')) {
          imageUrl = uploadedUrl;
        } else {
          fileUrl = uploadedUrl;
        }
      }

      const response = await api.post('/chat', {
        message,
        follow_up: followUp,
        image_url: imageUrl,
        file_url: fileUrl,
        conversation_id: conversationId
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send chat message');
    }
  },

  async uploadToCloudinary(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      throw new Error('Failed to upload file to Cloudinary');
    }
  },

  async sendStreamingChatMessage(message, followUp = null, file = null, imageUrl = null, fileUrl = null, conversationId = null) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message,
          follow_up: followUp,
          image_url: imageUrl,
          file_url: fileUrl,
          file: file,
          conversation_id: conversationId
        })
      });

      if (!response.ok) {
        throw new Error('Stream request failed');
      }

      return response.body;
    } catch (error) {
      throw new Error(error.message || 'Failed to send streaming message');
    }
  }
};
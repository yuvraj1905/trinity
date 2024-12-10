import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatService } from '../services/chat';

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.createConversation();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      return await chatService.getConversations();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchConversation = createAsyncThunk(
  'chat/fetchConversation',
  async (conversationId, { rejectWithValue }) => {
    try {
      return await chatService.getConversation(conversationId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  'chat/sendChatMessage',
  async ({ message, followUp = null, file = null, conversationId = null }, { rejectWithValue }) => {
    try {
      return await chatService.sendChatMessage(message, followUp, file, conversationId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendStreamingChatMessage = createAsyncThunk(
  'chat/sendStreamingChatMessage',
  async ({ message, followUp = null, file = null, conversationId = null }, { rejectWithValue }) => {
    try {
      let fileUrl = null;
      let imageUrl = null;

      if (file) {
        const uploadedUrl = await chatService.uploadToCloudinary(file);
        if (file.type.startsWith('image/')) {
          imageUrl = uploadedUrl;
        } else {
          fileUrl = uploadedUrl;
        }
      }

      const stream = await chatService.sendStreamingChatMessage(
        message,
        followUp,
        file,
        imageUrl,
        fileUrl,
        conversationId
      );
      
      return { stream, message };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    currentConversation: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearConversations: (state) => {
      state.conversations = [];
      state.currentConversation = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.conversations = [];
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.currentConversation = action.payload;
        state.conversations = [action.payload, ...state.conversations];
      });
  }
});

export const { clearConversations } = chatSlice.actions;
export default chatSlice.reducer;
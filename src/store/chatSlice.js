import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatService } from '../services/chat';

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message, { rejectWithValue }) => {
    try {
      return await chatService.sendMessage(message);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChatHistory = createAsyncThunk(
  'chat/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      return await chatService.getChatHistory();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chatHistory: [],
    currentChat: null,
    loading: false,
    error: null,
  },
  reducers: {
    setChatHistory: (state, action) => {
      state.chatHistory = action.payload;
    },
    addChat: (state, action) => {
      state.chatHistory.unshift(action.payload);
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setChatHistory, addChat, setCurrentChat, setLoading, setError } = chatSlice.actions;
export default chatSlice.reducer;
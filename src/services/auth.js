import api from './api';

export const authService = {
  async login(credentials) {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    
    const response = await api.post('/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/user', {
      email: userData.email,
      username: userData.username || userData.email.split('@')[0],
      password: userData.password,
      name: userData.name
    });
    return response.data;
  },

  async logout() {
    localStorage.removeItem('token');
  },

  async getCurrentUser() {
    return api.get('/users/me');
  }
}; 
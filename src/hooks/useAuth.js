import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { login, register, logout, setUser } from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading, error } = useSelector(state => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          dispatch(setUser(response.data));
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
    };
    initAuth();
  }, [dispatch]);

  const handleLogin = async (credentials) => {
    try {
      await dispatch(login(credentials)).unwrap();
      navigate('/chat/new');
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleRegister = async (userData) => {
    try {
      await dispatch(register(userData)).unwrap();
      navigate('/chat/new');
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
}; 
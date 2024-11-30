import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ChatInterface from '../components/ChatInterface';
import Profile from '../components/Profile';
import Landing from '../components/Landing';
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  return isAuthenticated ? children : <Navigate to="/signin" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/chat/:id"
        element={
        //   <PrivateRoute>
            <ChatInterface />
        //   </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;

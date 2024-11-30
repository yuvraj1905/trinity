import { Box, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';

const Layout = ({ children, toggleTheme }) => {
  const theme = useTheme();
  const { isAuthenticated } = useSelector(state => state.auth);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar toggleTheme={toggleTheme} />
      {isAuthenticated && <Sidebar />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8,
          px: 3,
          backgroundColor: theme.palette.background.default
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 
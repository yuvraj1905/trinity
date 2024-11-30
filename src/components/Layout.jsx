import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';
import { useState } from 'react';

const Layout = ({ children, toggleTheme }) => {
  const theme = useTheme();
  const { isAuthenticated } = useSelector(state => state.auth);
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar 
        toggleTheme={toggleTheme} 
        isOpen={isOpen} 
        toggleSidebar={() => setIsOpen(!isOpen)} 
      />
      {isAuthenticated && <Sidebar isOpen={isOpen} />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8,
          px: 3,
          backgroundColor: theme.palette.background.default,
          ml: isAuthenticated && isOpen ? '250px' : 0,
          transition: 'margin-left 0.2s ease-in-out',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 
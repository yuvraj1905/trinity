import { AppBar, Toolbar, Button, Box, IconButton, Typography, Avatar } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const Navbar = ({ toggleTheme, isOpen, toggleSidebar }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const theme = useTheme();

  return (
    <AppBar position="fixed" color="inherit" elevation={0}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isAuthenticated && (
            <IconButton
              onClick={toggleSidebar}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                width: 32,
                height: 32,
                '&:hover': {
                  bgcolor: 'background.paper',
                }
              }}
              size="small"
            >
              <MenuIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Orbitron, sans-serif',
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(90deg, #fff 0%, #ccc 100%)'
                  : 'linear-gradient(90deg, #1a1a1a 0%, #4a4a4a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              TRINITY
            </Typography>
          </Link>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={toggleTheme} sx={{ mr: 2 }}>
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        {isAuthenticated ? (
          <IconButton 
            component={Link} 
            to="/profile"
            sx={{ 
              ml: 1,
              p: 0,
              '&:hover': {
                bgcolor: 'transparent',
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 28, 
                height: 28,
                bgcolor: theme.palette.primary.main,
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        ) : (
          <>
            <Button component={Link} to="/signin" color="inherit">
              Sign In
            </Button>
            <Button
              component={Link}
              to="/signup"
              variant="contained"
              color="primary"
              sx={{ ml: 2 }}
            >
              Sign Up
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 
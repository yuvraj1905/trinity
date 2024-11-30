import { AppBar, Toolbar, Button, Box, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const Navbar = ({ toggleTheme }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const theme = useTheme();

  return (
    <AppBar position="fixed" color="inherit" elevation={0}>
      <Toolbar>
        <Link to="/">
          <img src="/logo.jpg" alt="Logo" height="32"/>
        </Link>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={toggleTheme} sx={{ mr: 2 }}>
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        {!isAuthenticated ? (
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
        ) : (
          <Button component={Link} to="/profile" color="inherit">
            Profile
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 
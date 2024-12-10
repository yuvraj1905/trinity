import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createConversation } from '../store/chatSlice';
import { useTheme } from '@mui/material/styles';

const Landing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const theme = useTheme();

  const handleGetStarted = async () => {
    if (!isAuthenticated) {
      navigate('/chat/new');
      return;
    }

    try {
      const result = await dispatch(createConversation()).unwrap();
      navigate(`/chat/${result.id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      navigate('/chat/new');
    }
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 3,
      }}
    >
      <Typography variant="h2" component="h1" gutterBottom>
        AI-Based REST / GraphQL API Generator
      </Typography>
      <Typography variant="h5" color="text.secondary" paragraph>
        Generate APIs instantly using natural language processing
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={handleGetStarted}
        sx={{ mt: 4 }}
      >
        Get Started
      </Button>
    </Box>
  );
};

export default Landing;
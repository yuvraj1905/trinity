import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Landing = () => {
  const navigate = useNavigate();

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
        onClick={() => navigate('/chat/new')}
        sx={{ mt: 4 }}
      >
        Get Started
      </Button>
    </Box>
  );
};

export default Landing;
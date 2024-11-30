import { Box } from '@mui/material';
import { keyframes } from '@mui/system';

const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

const LoadingMessage = () => {
  return (
    <Box
      sx={{
        height: '60px',
        backgroundColor: '#f6f7f8',
        backgroundImage: 'linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '800px 104px',
        animation: `${shimmer} 1s linear infinite`,
        width: '250px',
        borderRadius: 1
      }}
    />
  );
};

export default LoadingMessage; 
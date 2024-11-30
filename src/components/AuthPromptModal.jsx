import { Dialog, DialogContent, Typography, Button, Box, IconButton, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

const AuthPromptModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 2,
          bgcolor: theme.palette.mode === 'dark' ? '#212B36' : 'background.paper',
        }
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.mode === 'dark' ? 'grey.500' : 'grey.700',
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center',
          py: 2 
        }}>
          <img src="/logo.jpg" alt="Trinity Logo" style={{ height: 40, marginBottom: 24 }} />
          
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Continue with Trinity
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            To use Trinity, create an account or log into an existing one.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: 300 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                navigate('/signup');
                onClose();
              }}
            >
              Sign Up
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                navigate('/signin');
                onClose();
              }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPromptModal; 
import { Box, TextField, IconButton, Typography, Button, Paper, CircularProgress, Alert, Snackbar } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import MicIcon from '@mui/icons-material/Mic';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useSelector, useDispatch } from 'react-redux';
import AuthModal from './AuthModal';
import AuthPromptModal from './AuthPromptModal';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../hooks/useAuth';
import { sendMessage } from '../store/chatSlice';
import { chatService } from '../services/chat';

const ChatInterface = () => {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const fileInputRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        setInput(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognition);
    }
  }, []);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleSuggestedClick = (text) => {
    setInput(text);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    
    try {
      const response = await dispatch(sendMessage(input)).unwrap();
      setMessages(prev => [...prev, 
        { type: 'user', content: input },
        { type: 'assistant', content: response.reply }
      ]);
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Invalid file type. Only PDF, TXT, DOC, JPEG, and PNG files are allowed.');
      setShowError(true);
      return;
    }

    try {
      setIsUploading(true);
      const response = await chatService.uploadFile(file);
      
      // Add file message to chat
      setMessages(prev => [...prev,
        { type: 'user', content: `Uploaded file: ${file.name}` },
        { type: 'assistant', content: response.message }
      ]);
    } catch (error) {
      setError('Failed to upload file. Please try again.');
      setShowError(true);
    } finally {
      setIsUploading(false);
    }
  };

  const suggestedActions = [
    "Generate a REST API for user management",
    "Create a GraphQL schema for a blog",
    "Build an API for e-commerce platform"
  ];

  return (
    <Box sx={{ 
      height: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <Typography 
        variant="h2" 
        component="h1" 
        sx={{ 
          mb: 4,
          fontWeight: 700,
          textAlign: 'center',
          fontSize: '48px'
        }}
      >
        What API can I help you build?
      </Typography>

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '800px',
          p: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            size="small" 
            onClick={handleFileClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <CircularProgress size={24} />
            ) : (
              <AttachFileIcon />
            )}
          </IconButton>
          
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your API requirements..."
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            sx={{ mx: 2 }}
          />
          
          <IconButton
            size="small"
            onClick={handleVoiceInput}
            sx={{
              mr: 1,
              color: isRecording ? 'error.main' : 'inherit',
              position: 'relative',
            }}
          >
            {isRecording ? (
              <>
                <MicIcon fontSize="small" />
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    color: 'error.main',
                  }}
                />
              </>
            ) : (
              <MicIcon fontSize="small" />
            )}
          </IconButton>

          <IconButton 
            size="small" 
            onClick={handleSend}
            sx={{ 
              bgcolor: theme.palette.mode === 'dark' ? 'primary.main' : 'primary.main',
              color: theme.palette.mode === 'dark' ? 'background.paper' : 'white',
              borderRadius: 1,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.dark',
              },
              width: 28,
              height: 28,
              mr: 1
            }}
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>

      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        mt: 3,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {suggestedActions.map((action, index) => (
          <Button
            key={index}
            onClick={() => handleSuggestedClick(action)}
            size="small"
            sx={{ 
              color: 'text.secondary',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '20px',
              px: 1.5,
              py: 0.25,
              textTransform: 'none',
              fontSize: '0.65rem',
              minHeight: '24px',
              '&:hover': {
                bgcolor: 'background.paper',
                borderColor: 'primary.main',
              }
            }}
            endIcon={<KeyboardArrowRightIcon sx={{ fontSize: '1rem' }} />}
          >
            {action}
          </Button>
        ))}
      </Box>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".pdf,.txt,.doc,.docx,.jpeg,.jpg,.png"
      />

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <AuthPromptModal 
        open={showAuthPrompt} 
        onClose={() => setShowAuthPrompt(false)} 
      />

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
      >
        <Alert 
          onClose={() => setShowError(false)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatInterface; 
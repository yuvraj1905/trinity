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
import { sendChatMessage, createConversation, sendStreamingChatMessage } from '../store/chatSlice';
import { chatService } from '../services/chat';
import LoadingMessage from './LoadingMessage';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useParams, useNavigate } from 'react-router-dom';
import FormattedMessage from './FormattedMessage';

const Message = ({ message, theme }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      backgroundColor: message.type === 'user' 
        ? theme.palette.primary.main
        : 'background.paper',
      color: message.type === 'user'
        ? '#ffffff'
        : 'text.primary',
      alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
      maxWidth: '80%',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    {message.type === 'user' ? (
      <Typography variant="body1" sx={{ color: '#ffffff' }}>
        {message.content}
      </Typography>
    ) : message.content ? (
      <FormattedMessage content={message.content} />
    ) : (
      <LoadingMessage />
    )}
  </Paper>
);

const ChatInput = ({ input, setInput, handleSend, handleVoiceInput, handleFileClick, isRecording, isUploading }) => (
  <Paper
    elevation={0}
    sx={{
      width: '100%',
      maxWidth: '800px',
      p: 1.5,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      backgroundColor: 'background.paper'
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton
        size="small"
        onClick={handleFileClick}
        disabled={isUploading}
      >
        {isUploading ? (
          <CircularProgress size={20} />
        ) : (
          <AttachFileIcon fontSize="small" />
        )}
      </IconButton>

      <TextField
        fullWidth
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
          }
        }}
        placeholder="Describe your API requirements..."
        variant="standard"
        disabled={isUploading}
        InputProps={{
          disableUnderline: true,
          sx: { fontSize: '1rem', px: 1 }
        }}
      />
      
      <IconButton
        size="small"
        onClick={handleVoiceInput}
        color={isRecording ? 'error' : 'default'}
        disabled={isUploading}
      >
        <MicIcon fontSize="small" />
        {isRecording && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              color: 'error.main'
            }}
          />
        )}
      </IconButton>

      <IconButton 
        size="small"
        onClick={handleSend}
        disabled={isUploading}
        sx={{ 
          bgcolor: 'primary.main',
          color: theme => theme.palette.mode === 'dark' ? 'common.black' : 'common.white',
          '&:hover': {
            bgcolor: 'primary.dark'
          }
        }}
      >
        <ArrowUpwardIcon fontSize="small" />
      </IconButton>
    </Box>
  </Paper>
);

const ChatInterface = () => {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const fileInputRef = useRef(null);
  const { isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (!id || id === 'new') {
          const result = await dispatch(createConversation()).unwrap();
          setCurrentConversationId(result.id);
          navigate(`/chat/${result.id}`, { replace: true });
        } else {
          const conversation = await chatService.getConversation(id);
          setCurrentConversationId(id);
          if (conversation.queries) {
            const formattedMessages = [];
            conversation.queries.forEach(q => {
              formattedMessages.push({
                type: 'user',
                content: q.query
              });
              if (q.response) {
                formattedMessages.push({
                  type: 'assistant',
                  content: q.response
                });
              }
            });
            setMessages(formattedMessages);
          }
        }
      } catch (error) {
        setError('Failed to initialize chat');
        setShowError(true);
      }
    };
    
    initializeChat();
  }, [id, dispatch, navigate]);

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

  const handleSend = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!input.trim()) return;
    
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    
    try {
      setMessages(prev => [...prev, { type: 'user', content: input }]);
      setMessages(prev => [...prev, { type: 'assistant', content: '' }]);
      const currentInput = input;
      setInput('');
      
      const result = await dispatch(sendStreamingChatMessage({ 
        message: currentInput,
        followUp: null,
        conversationId: currentConversationId
      })).unwrap();
      
      const reader = result.stream.getReader();
      const decoder = new TextDecoder();
      let accumulatedMessage = '';
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              accumulatedMessage += data.token;
              
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  type: 'assistant',
                  content: accumulatedMessage
                };
                return newMessages;
              });
            } catch (e) {
              console.error('Failed to parse streaming data:', e);
            }
          }
        }
      }
      
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      setError('Failed to send message. Please try again.');
      setShowError(true);
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
      
      const response = await dispatch(sendChatMessage({ 
        message: `Analyzing file: ${file.name}`,
        file: file,
        conversationId: id
      })).unwrap();
      
      setMessages(prev => [...prev,
        { type: 'user', content: `Uploaded file: ${file.name}` },
        { type: 'assistant', content: response.response }
      ]);
    } catch (error) {
      setError('Failed to process file. Please try again.');
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Invalid file type. Only PDF, TXT, DOC, JPEG, and PNG files are allowed.');
      setShowError(true);
      return;
    }

    try {
      setIsUploading(true);
      const response = await dispatch(sendChatMessage({ 
        message: `Analyzing file: ${file.name}`,
        file: file,
        conversationId: id
      })).unwrap();
      
      setMessages(prev => [...prev,
        { type: 'user', content: `Uploaded file: ${file.name}` },
        { type: 'assistant', content: response.response }
      ]);
    } catch (error) {
      setError('Failed to process file. Please try again.');
      setShowError(true);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{ 
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: messages.length === 0 ? 'center' : 'flex-start',
        position: 'relative',
        ml: isAuthenticated ? '125px' : 0,
        width: isAuthenticated ? 'calc(100% - 250px)' : '100%',
        transition: 'all 0.2s ease-in-out',
        p: 3,
      }}>
      {messages.length === 0 && (
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
      )}

      {messages.length > 0 ? (
        <Box 
          sx={{ 
            flexGrow: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
            maxWidth: '800px',
            height: '100%',
            mb: 2,
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            msOverflowStyle: 'none',  // IE and Edge
            scrollbarWidth: 'none'    // Firefox
          }}
        >
          {messages.map((message, index) => (
            <Message key={index} message={message} theme={theme} />
          ))}
          <div ref={messagesEndRef} />
        </Box>
      ) : null}

      <ChatInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        handleVoiceInput={handleVoiceInput}
        handleFileClick={handleFileClick}
        isRecording={isRecording}
        isUploading={isUploading}
      />

      {messages.length === 0 && (
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          mt: 2,
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
      )}

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

      {isDragging && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            border: '2px dashed',
            borderColor: 'primary.main',
          }}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: 2,
              textAlign: 'center',
              maxWidth: '400px',
            }}
          >
            <AttachFileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drop your file here
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: PDF, TXT, DOC, JPEG, PNG
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ChatInterface; 
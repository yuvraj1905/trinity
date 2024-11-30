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
import { sendChatMessage, sendMessage } from '../store/chatSlice';
import { chatService } from '../services/chat';
import LoadingMessage from './LoadingMessage';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const FormattedMessage = ({ content }) => {
  const formatText = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    const formattedContent = [];
    let codeBlock = [];
    let isInCodeBlock = false;
    let language = '';
    
    const handleCopyCode = (code) => {
      navigator.clipboard.writeText(code);
    };

    const CodeBlock = ({ code, language }) => (
      <Box sx={{ position: 'relative', my: 2 }}>
        <IconButton
          onClick={() => handleCopyCode(code)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)',
            },
            zIndex: 1
          }}
          size="small"
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>
        <SyntaxHighlighter
          language={language || 'javascript'}
          style={vscDarkPlus}
          customStyle={{
            borderRadius: '8px',
            padding: '16px',
            marginTop: '8px',
            marginBottom: '8px'
          }}
        >
          {code}
        </SyntaxHighlighter>
      </Box>
    );

    const DocSection = ({ title, children }) => (
      <Box 
        sx={{ 
          mb: 3,
          p: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 1
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2,
            color: 'primary.main',
            fontWeight: 600,
            borderBottom: '2px solid',
            borderColor: 'primary.main',
            pb: 1
          }}
        >
          {title}
        </Typography>
        {children}
      </Box>
    );

    const EndpointBlock = ({ method, path, description, responses }) => (
      <Box 
        sx={{ 
          mb: 2,
          p: 2,
          borderRadius: 1,
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography 
            variant="code" 
            sx={{ 
              fontFamily: 'monospace',
              fontWeight: 600,
              color: 'success.main',
              bgcolor: 'background.paper',
              px: 1,
              py: 0.5,
              borderRadius: 1
            }}
          >
            {method} {path}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          {description}
        </Typography>
        {responses && (
          <Box sx={{ mt: 1 }}>
            {responses.map((response, idx) => (
              <Typography 
                key={idx}
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <span style={{ color: response.includes('200') ? 'green' : 'orange' }}>●</span>
                {response}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    );

    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.startsWith('```')) {
        if (isInCodeBlock) {
          formattedContent.push(
            <CodeBlock 
              key={`code-${index}`} 
              code={codeBlock.join('\n')} 
              language={language}
            />
          );
          codeBlock = [];
          isInCodeBlock = false;
        } else {
          isInCodeBlock = true;
          language = line.slice(3).trim();
        }
        return;
      }

      if (isInCodeBlock) {
        codeBlock.push(line);
        return;
      }

      // Handle documentation sections
      if (line.startsWith('**') && line.endsWith('**')) {
        const title = line.replace(/\*\*/g, '');
        formattedContent.push(
          <DocSection key={index} title={title}>
            {/* Content will be added in subsequent iterations */}
          </DocSection>
        );
        return;
      }

      // Handle endpoints
      if (/^\d+\.\s`.*`/.test(line)) {
        const [method, path] = line.match(/`([^`]+)`/)[1].split(' ');
        const description = lines[index + 1]?.replace(/^\s*-\s*/, '');
        const responses = [];
        let i = index + 2;
        while (lines[i] && lines[i].startsWith('   -')) {
          responses.push(lines[i].replace(/^\s*-\s*/, ''));
          i++;
        }
        formattedContent.push(
          <EndpointBlock
            key={index}
            method={method}
            path={path}
            description={description}
            responses={responses}
          />
        );
        return;
      }

      // Handle regular text
      if (line.trim()) {
        formattedContent.push(
          <Typography 
            key={index}
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              mb: 1
            }}
          >
            {line}
          </Typography>
        );
      }
    });

    return formattedContent;
  };

  if (!content) return null;
  return <>{formatText(content)}</>;
};

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
      setMessages(prev => [...prev, { type: 'loading' }]);
      setInput('');
      
      // Scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      
      const response = await dispatch(sendChatMessage({ 
        message: input,
        followUp: null
      })).unwrap();
      
      // Remove loading message and add assistant response
      setMessages(prev => [
        ...prev.filter(msg => msg.type !== 'loading'),
        { type: 'assistant', content: response.response, isTyping: true }
      ]);
      
      // Scroll to bottom again after response
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      setError('Failed to send message. Please try again.');
      setShowError(true);
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
      
      // First upload the file
      const uploadResponse = await chatService.uploadFile(file);
      
      // Then send a message with the file reference
      const message = {
        type: 'file',
        fileId: uploadResponse.fileId,
        fileName: file.name,
        fileType: file.type
      };

      // Send message using the existing chat mechanism
      const response = await dispatch(sendMessage(message)).unwrap();
      
      setMessages(prev => [...prev,
        { type: 'user', content: `Uploaded file: ${file.name}` },
        { type: 'assistant', content: response.reply }
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

  return (
    <Box sx={{ 
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
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: message.type === 'user' 
                  ? (theme.palette.mode === 'dark' ? '#ffffff' : 'primary.main')
                  : 'background.paper',
                color: message.type === 'user'
                  ? (theme.palette.mode === 'dark' ? '#000000' : '#ffffff')
                  : 'text.primary',
                alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {message.type === 'user' ? (
                <Typography 
                  variant="body1"
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#000000' : '#ffffff'
                  }}
                >
                  {message.content}
                </Typography>
              ) : message.content ? (
                <FormattedMessage content={message.content} />
              ) : (
                <LoadingMessage />
              )}
            </Paper>
          ))}
          <div ref={messagesEndRef} />
        </Box>
      ) : null}

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
          mb: messages.length === 0 ? 3 : 0
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
            onKeyPress={handleKeyPress}
            placeholder="Describe your API requirements..."
            variant="standard"
            inputRef={inputRef}
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
            onClick={() => handleSend()}
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

      {messages.length === 0 && (
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
    </Box>
  );
};

export default ChatInterface; 
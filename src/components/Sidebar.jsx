import { Box, List, ListItem, ListItemText, Button, Typography, CircularProgress, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchConversations, createConversation, clearConversations } from '../store/chatSlice';
import { format, isToday, isYesterday, isSameDay, parseISO } from 'date-fns';

const formatDate = (date) => {
  if (isToday(new Date(date))) {
    return 'Today';
  } else if (isYesterday(new Date(date))) {
    return 'Yesterday';
  }
  return format(new Date(date), 'MMMM d, yyyy');
};

const formatConversationPreview = (conversation) => {
  if (!conversation.queries || conversation.queries.length === 0) {
    return 'New Conversation';
  }
  const lastQuery = conversation.queries[0];
  return lastQuery.query || 'New Conversation';
};

export const groupConversationsByDate = (conversations) => {
  // First sort conversations by date (most recent first)
  const sortedConversations = [...conversations].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  const groups = {};
  sortedConversations.forEach(conversation => {
    const date = formatDate(conversation.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(conversation);
  });

  // Sort the dates as well (most recent first)
  const sortedGroups = {};
  Object.keys(groups)
    .sort((a, b) => {
      if (a === 'Today') return -1;
      if (b === 'Today') return 1;
      if (a === 'Yesterday') return -1;
      if (b === 'Yesterday') return 1;
      return new Date(b) - new Date(a);
    })
    .forEach(key => {
      sortedGroups[key] = groups[key];
    });

  return sortedGroups;
};

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { conversations, loading, error } = useSelector(state => state.chat);
  const { isAuthenticated } = useSelector(state => state.auth);
  const currentConversationId = location.pathname.split('/').pop();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchConversations());
    } else {
      dispatch(clearConversations());
    }
  }, [dispatch, isAuthenticated]);

  const handleNewChat = async () => {
    try {
      const result = await dispatch(createConversation()).unwrap();
      navigate(`/chat/${result.id}`);
      dispatch(fetchConversations());
    } catch (error) {
      console.error('Failed to create new conversation:', error);
    }
  };

  if (!isAuthenticated) return null;

  const groupedConversations = groupConversationsByDate(conversations);

  return (
    <Box
      sx={{
        width: isOpen ? 260 : 0,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        bgcolor: 'background.default',
        borderRight: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        transition: 'width 0.2s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Orbitron', sans-serif",
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            letterSpacing: '0.1em',
          }}
        >
          TRINITY
        </Typography>
      </Box>

      {/* New Chat Button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewChat}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            bgcolor: 'primary.main',
            py: 1,
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          New Chat
        </Button>
      </Box>

      {/* Conversations List */}
      <List 
        sx={{ 
          overflow: 'auto',
          flex: 1,
          px: 1,
          '& .MuiListItem-root': {
            borderRadius: 1,
            mb: 0.5,
            '&:hover': {
              bgcolor: 'action.hover',
            },
            '&.selected': {
              bgcolor: 'action.selected',
            }
          }
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          Object.entries(groupedConversations).map(([date, dateConversations],index) => (
            <Box key={date}>
              {dateConversations?.filter(({queries})=>queries?.length>=1)?.length>=1&&
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  py: 1,
                  display: 'block',
                  color: 'text.secondary',
                  fontWeight: 600,
                  fontSize:14,
                  marginTop:index===0?"":"20px"
                }}
              >
                {date}
              </Typography>}
              {dateConversations?.filter(({queries})=>queries?.length>=1).map((conversation) => (
                <ListItem
                  key={conversation.id}
                  button
                  onClick={() => navigate(`/chat/${conversation.id}`)}
                  className={conversation.id === currentConversationId ? 'selected' : ''}
                  sx={{
                    minHeight: '44px',
                    borderRadius:"0px 0px 0px 4px !important",
                    borderLeft:"0.5px solid grey",
                    borderBottom:"0.5px solid grey",
                    marginBottom:"10px !important"
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography 
                        noWrap 
                        sx={{ 
                          fontSize: '0.875rem',
                          fontWeight: conversation.id === currentConversationId ? 500 : 400,
                        }}
                      >
                        {formatConversationPreview(conversation)}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </Box>
          ))
        )}
      </List>
    </Box>
  );
};

export default Sidebar; 

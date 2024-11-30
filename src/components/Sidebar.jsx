import { Box, List, ListItem, ListItemText, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const { chatHistory } = useSelector(state => state.chat);
  const { isAuthenticated } = useSelector(state => state.auth);

  if (!isAuthenticated) return null;

  return (
    <Box
      sx={{
        width: isOpen ? 250 : 0,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 64,
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease-in-out',
        overflow: 'hidden',
      }}
    >
      <Button
        startIcon={<AddIcon />}
        variant="contained"
        sx={{ m: 2 }}
        onClick={() => navigate('/chat/new')}
      >
        New Chat
      </Button>
      <List sx={{ overflow: 'auto', flexGrow: 1 }}>
        {chatHistory.map((chat) => (
          <ListItem 
            button 
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
          >
            <ListItemText 
              primary={chat.title} 
              secondary={new Date(chat.timestamp).toLocaleDateString()}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar; 
import { Box, Paper, Typography, Avatar, Grid, Divider, Button, IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useTheme } from '@mui/material/styles';
import { queries } from '@testing-library/react';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const InfoRow = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {icon}
      <Box sx={{ ml: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1">
          {value || 'Not provided'}
        </Typography>
      </Box>
    </Box>
  );

  
  const { conversations, loading, error } = useSelector(state => state.chat);
  const totalConversations=conversations?.filter(({queries})=>queries?.length>=1)
  let totalQueriesCount=0;
  totalConversations?.forEach(({queries})=>{
    totalQueriesCount=totalQueriesCount+Number(queries?.length)
  })

  return (
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      mt: 4,
      px: 3,
    }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 4,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Grid container spacing={4}>
          {/* Left Column - Profile Picture */}
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 150,
                height: 150,
                mx: 'auto',
                bgcolor: theme.palette.primary.main,
                fontSize: '4rem',
                border: '4px solid',
                borderColor: theme.palette.background.paper,
                boxShadow: theme.shadows[3],
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            
            {/* <Button
              variant="outlined"
              startIcon={<EditIcon />}
              sx={{ mt: 2 }}
              size="small"
            >
              Change Photo
            </Button> */}
          </Grid>

          {/* Right Column - User Info */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                Profile Information
              </Typography>
              <IconButton 
                onClick={handleLogout}
                color="error"
                sx={{ 
                  bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                  '&:hover': {
                    bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                  }
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <InfoRow
              icon={<PersonIcon sx={{ color: 'primary.main' }} />}
              label="Full Name"
              value={user?.name}
            />

            <InfoRow
              icon={<EmailIcon sx={{ color: 'primary.main' }} />}
              label="Email Address"
              value={user?.email}
            />

            <InfoRow
              icon={<AccountCircleIcon sx={{ color: 'primary.main' }} />}
              label="Username"
              value={user?.username}
            />

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                Account Statistics
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                
                <Grid item xs={6} md={4}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                      {totalConversations?.length||0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Conversations
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6} md={4}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                      {totalQueriesCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Queries Count
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;

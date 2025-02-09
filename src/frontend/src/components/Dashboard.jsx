import React from 'react'
import { useNavigate } from 'react-router-dom';
import { Box, Button} from '@mui/material';

const Dashboard = () => {
    const navigate = useNavigate();
  return (
    <Box
    sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '60px',
      backgroundColor: '#fff',
      borderTop: '1px solid #ccc',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1100,
    }}
  >
    <Button
      variant="text"
      onClick={() => {
       navigate('/family')
      }}
      sx={{
        fontSize: '0.9rem',
        textTransform: 'none',
        color: 'blue',
      }}
    >
      Upload Pic Option
    </Button>
    {/* Right Option: Profile (navigate to profile page) */}
    <Button
      variant="text"
      onClick={() => navigate('/profile')}
      sx={{
        fontSize: '0.9rem',
        textTransform: 'none',
        color: 'blue',
      }}
    >
      Profile
    </Button>
  </Box>
  )
}

export default Dashboard
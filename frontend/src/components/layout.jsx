import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box} from '@mui/material';
import Navigation from './navigation';
import Logo from '../assets/accon_logo.png';
import BackgroundImage from '../assets/background.jpg'; 
const Layout = () => {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundImage: `url(${BackgroundImage})`, backgroundSize:'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
            <Box
                sx={{
                    width: 250,
                    bgcolor: 'rgba(24,154,226, 1.0)',
                    color: '#fff',
                    padding: 2,
                    position: 'fixed',
                    height: '100%',
                }}
            >
                <Navigation />
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    marginLeft: '250px',
                    padding: 3,
                    color: '#fff'
                }}
            >
                <Box
                    component='img'
                    src={Logo}
                    alt='Accon logo'
                    sx={{
                        position: 'absolute',
                        top: 15,
                        right: 30,
                        width: 250,
                        height: 'auto',
                        zIndex: 1000
                    }}
                />
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;

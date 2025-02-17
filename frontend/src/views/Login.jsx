import React, { useState, useContext } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const { t } = useTranslation();


    const handleLogin = async () => {
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <Container>
            <Typography variant="h2" component="h1" gutterBottom color="#071952">
                {t('login')}
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label={t('username')}
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ backgroundColor: 'white', borderRadius: '5px'}}
                />
                <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ backgroundColor: 'white', borderRadius: '5px' }}
                />
                <Button variant="contained" color="primary" onClick={handleLogin}>
                {t('login')}
                </Button>
            </Box>
        </Container>
    );
};

export default Login;
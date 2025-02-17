import React, { useState, useContext } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import API_URL from '../api/config.js';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleRegister = async () => {
        try {
            const response = await axios.post(`${API_URL}/api/register`, { username, password });
            if (response.status === 201) {
                login(username, password);
                navigate('/');
            }
        } catch (err) {
            setError(err.response.data.error || 'An error occurred');
        }
    };

    return (
        <Container>
            <Typography variant="h2" component="h1" gutterBottom color="#071952">
                Register
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Username"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={handleRegister}>
                    Register
                </Button>
            </Box>
        </Container>
    );
};

export default Register;
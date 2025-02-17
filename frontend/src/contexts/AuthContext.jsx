import React, { createContext, useState } from 'react';
import axios from 'axios';
import API_URL from '../api/config.js';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [user, setUser] = useState(null);

    axios.defaults.withCredentials = true;
    const login = async (username, password) => {
        try {
            const response = await axios.post(`${API_URL}/api/login`, { username, password }, {withCredentials: true});
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            setToken(access_token);
            setUser(username);
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };

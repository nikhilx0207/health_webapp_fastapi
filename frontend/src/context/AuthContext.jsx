import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    // Ideally verify token with backend here, or just decode if using simple JWT logic
                    // For now, we assume if token exists, we are logged in.
                    // You might want to fetch user profile here if not stored.
                    // const response = await api.get('/me'); 
                    // setUser(response.data);
                } catch (error) {
                    console.error("Auth check failed", error);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            const { access_token } = response.data;
            setToken(access_token);
            localStorage.setItem('token', access_token);
            // Optionally decode token to get user info if needed immediately
            // setUser({ email }); 
            return true;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/register', userData);
            const { access_token } = response.data;
            setToken(access_token);
            localStorage.setItem('token', access_token);
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

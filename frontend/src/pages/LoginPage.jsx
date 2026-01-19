import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            // We need to decode the token to know the role, or get it from response.
            // For now, let's assume we can hit a profile endpoint or we extracted it in AuthContext.
            // Since AuthContext doesn't expose role yet, let's just default to patient dashboard
            // Or we can decode the token here locally if we want (but better in Context).
            // Update: Let's assume the user knows where to go, or we fetch profile.
            // For this MVP, I'll redirect to a generic welcome or check a stored role if we saved it.
            // Wait, register returns role in token. Login does too.
            // Let's decode the token to get the role.

            const token = localStorage.getItem('token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const role = payload.role;
                const redirectPath = role === 'doctor' ? '/provider-dashboard' : '/patient-dashboard';
                navigate(redirectPath);
            } else {
                navigate('/patient-dashboard'); // Fallback
            }

        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authBox}>
                <h2 className={styles.title}>Welcome Back</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className={styles.input}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            className={styles.input}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>

                <p className={styles.linkText}>
                    Don't have an account? <Link to="/signup" className={styles.link}>Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

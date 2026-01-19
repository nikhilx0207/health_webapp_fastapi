import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'patient',
        license_no: '',
        data_usage_consent: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCheckboxChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.checked,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const submissionData = { ...formData };
            if (submissionData.role !== 'doctor') {
                delete submissionData.license_no;
            }
            await register(submissionData);
            // Redirect based on role
            const redirectPath = formData.role === 'doctor' ? '/provider-dashboard' : '/patient-dashboard';
            navigate(redirectPath);
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authBox}>
                <h2 className={styles.title}>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            className={styles.input}
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

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

                    <div className={styles.formGroup}>
                        <label className={styles.label}>I am a...</label>
                        <select
                            name="role"
                            className={styles.select}
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="patient">Patient</option>
                            <option value="doctor">Healthcare Provider</option>
                        </select>
                    </div>

                    {formData.role === 'doctor' && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Medical License Number</label>
                            <input
                                type="text"
                                name="license_no"
                                className={styles.input}
                                value={formData.license_no}
                                onChange={handleChange}
                                placeholder="Enter Medical License"
                                required
                            />
                        </div>
                    )}

                    <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            name="data_usage_consent"
                            id="data_usage_consent"
                            checked={formData.data_usage_consent}
                            onChange={handleCheckboxChange}
                            required
                            style={{ width: 'auto', margin: 0 }}
                        />
                        <label htmlFor="data_usage_consent" style={{ margin: 0, fontWeight: 'normal' }}>
                            I consent to data usage for healthcare purposes *
                        </label>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className={styles.linkText}>
                    Already have an account? <Link to="/login" className={styles.link}>Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;

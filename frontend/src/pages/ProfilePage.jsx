import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Dashboard.module.css';

const ProfilePage = () => {
    const { logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        allergies: '',
        medications: ''
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/profile');
                setProfile(response.data);
                setFormData({
                    allergies: (response.data.allergies || []).join(', '),
                    medications: (response.data.medications || []).join(', ')
                });
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert comma-separated strings to arrays
            const payload = {
                allergies: formData.allergies.split(',').map(item => item.trim()).filter(item => item),
                medications: formData.medications.split(',').map(item => item.trim()).filter(item => item)
            };
            await api.put('/users/profile', payload);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Failed to update profile", error);
            setMessage('Failed to update profile.');
        }
    };

    if (loading) return <div>Loading Profile...</div>;

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h1 className={styles.welcomeText}>My Profile</h1>
                <button onClick={logout} className={styles.logoutButton}>Logout</button>
            </header>

            <div className={styles.gridContainer}>
                {/* Profile Info Card */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Profile Information</h3>
                    <div style={{ marginBottom: '1rem' }}>
                        <strong>Name:</strong> {profile?.full_name || 'Not provided'}
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <strong>Email:</strong> {profile?.email}
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <strong>Role:</strong> {profile?.role}
                    </div>
                    {profile?.license_no && (
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>License Number:</strong> {profile.license_no}
                        </div>
                    )}
                    <div style={{ marginBottom: '1rem' }}>
                        <strong>Data Consent:</strong> {profile?.data_usage_consent ? 'Granted' : 'Not granted'}
                    </div>
                </div>

                {/* Edit Profile Card */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Medical Information</h3>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Allergies (comma-separated)</label>
                            <textarea
                                name="allergies"
                                className={styles.input}
                                value={formData.allergies}
                                onChange={handleChange}
                                rows="3"
                                placeholder="e.g., Peanuts, Penicillin, Latex"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Medications (comma-separated)</label>
                            <textarea
                                name="medications"
                                className={styles.input}
                                value={formData.medications}
                                onChange={handleChange}
                                rows="3"
                                placeholder="e.g., Aspirin 100mg, Metformin 500mg"
                            />
                        </div>
                        <button type="submit" className={styles.updateButton}>Save Changes</button>
                        {message && <p style={{ color: 'green', marginTop: '10px', textAlign: 'center' }}>{message}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

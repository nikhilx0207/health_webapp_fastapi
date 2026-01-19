import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Dashboard.module.css';

const PatientDashboard = () => {
    const { logout } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [dailyLogForm, setDailyLogForm] = useState({
        steps: 0,
        water_intake_ml: 0
    });
    const [goalForm, setGoalForm] = useState({
        steps: 0,
        sleep_hours: 0
    });
    const [message, setMessage] = useState('');

    const healthTips = [
        "Drink at least 8 glasses of water a day.",
        "Aim for 30 minutes of moderate exercise daily.",
        "Quality sleep is crucial for immune function.",
        "Eat a variety of colorful fruits and vegetables."
    ];
    const [randomTip] = useState(healthTips[Math.floor(Math.random() * healthTips.length)]);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/patient/dashboard');
            setDashboardData(response.data);
            if (response.data.goals) {
                setGoalForm({
                    steps: response.data.goals.steps,
                    sleep_hours: response.data.goals.sleep_hours
                });
            }
            if (response.data.daily_log) {
                setDailyLogForm({
                    steps: response.data.daily_log.steps,
                    water_intake_ml: response.data.daily_log.water_intake_ml
                });
            }
        } catch (error) {
            console.error("Failed to fetch dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleDailyLogChange = (e) => {
        setDailyLogForm({
            ...dailyLogForm,
            [e.target.name]: parseInt(e.target.value) || 0
        });
    };

    const handleLogDaily = async (e) => {
        e.preventDefault();
        try {
            await api.post('/patient/daily-log', {
                user_id: '', // Backend will use current user
                date: new Date().toISOString().split('T')[0],
                steps: dailyLogForm.steps,
                water_intake_ml: dailyLogForm.water_intake_ml
            });
            setMessage('Daily log saved successfully!');
            setShowModal(false);
            // Refresh dashboard to show updated progress
            await fetchDashboard();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Failed to log daily progress", error);
            setMessage('Failed to save log.');
        }
    };

    const handleGoalChange = (e) => {
        setGoalForm({
            ...goalForm,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateGoals = async (e) => {
        e.preventDefault();
        try {
            await api.post('/patient/goals', {
                steps: parseInt(goalForm.steps),
                sleep_hours: parseFloat(goalForm.sleep_hours)
            });
            setMessage('Goals updated successfully!');
            setDashboardData(prev => ({
                ...prev,
                goals: {
                    steps: parseInt(goalForm.steps),
                    sleep_hours: parseFloat(goalForm.sleep_hours)
                }
            }));
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Failed to update goals", error);
            setMessage('Failed to update goals.');
        }
    };

    if (loading) return <div>Loading Dashboard...</div>;

    const stepsPercent = Math.min((dashboardData?.goals?.steps / 10000) * 100, 100) || 0;
    const sleepPercent = Math.min((dashboardData?.goals?.sleep_hours / 9) * 100, 100) || 0;

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h1 className={styles.welcomeText}>Welcome, {dashboardData?.user?.split(' ')[0] || 'Patient'}</h1>
                <button onClick={logout} className={styles.logoutButton}>Logout</button>
            </header>

            {message && <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}

            <button
                onClick={() => setShowModal(true)}
                style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    marginBottom: '1.5rem'
                }}
            >
                Log Daily Progress
            </button>

            <div className={styles.gridContainer}>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Wellness Goals</h3>
                    <div className={styles.metric}>
                        <div className={styles.metricLabel}>
                            <span>Daily Steps</span>
                            <span>{dashboardData?.goals?.steps || 0} / 10,000</span>
                        </div>
                        <div className={styles.progressBarBg}>
                            <div className={styles.progressBarFill} style={{ width: `${stepsPercent}%` }}></div>
                        </div>
                    </div>
                    <div className={styles.metric}>
                        <div className={styles.metricLabel}>
                            <span>Sleep (Hours)</span>
                            <span>{dashboardData?.goals?.sleep_hours || 0} / 9 hrs</span>
                        </div>
                        <div className={styles.progressBarBg}>
                            <div className={`${styles.progressBarFill} ${styles.sleepFill}`} style={{ width: `${sleepPercent}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Preventive Reminders</h3>
                    <ul className={styles.reminderList}>
                        {dashboardData?.reminders?.map((reminder, idx) => (
                            <li key={idx} className={styles.reminderItem}>• {reminder}</li>
                        )) || <li className={styles.reminderItem}>No upcoming reminders.</li>}
                    </ul>
                </div>

                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Update Today's Goals</h3>
                    <form onSubmit={handleUpdateGoals}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Steps</label>
                            <input
                                type="number"
                                name="steps"
                                className={styles.input}
                                value={goalForm.steps}
                                onChange={handleGoalChange}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Sleep (Hours)</label>
                            <input
                                type="number"
                                step="0.1"
                                name="sleep_hours"
                                className={styles.input}
                                value={goalForm.sleep_hours}
                                onChange={handleGoalChange}
                            />
                        </div>
                        <button type="submit" className={styles.updateButton}>Save Changes</button>
                    </form>
                </div>

                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Daily Health Tip</h3>
                    <div className={styles.tipBox}>
                        "{randomTip}"
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        maxWidth: '500px',
                        width: '90%'
                    }}>
                        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Log Daily Progress</h2>
                        <form onSubmit={handleLogDaily}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Steps Today</label>
                                <input
                                    type="number"
                                    name="steps"
                                    className={styles.input}
                                    value={dailyLogForm.steps}
                                    onChange={handleDailyLogChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Water Intake (ml)</label>
                                <input
                                    type="number"
                                    name="water_intake_ml"
                                    className={styles.input}
                                    value={dailyLogForm.water_intake_ml}
                                    onChange={handleDailyLogChange}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="submit" className={styles.updateButton}>Save Log</button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        backgroundColor: '#6b7280',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem',
                                        borderRadius: '6px',
                                        flex: 1,
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Dashboard.module.css';

const ProviderDashboard = () => {
    const { logout } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientDetail, setPatientDetail] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/doctor/patients');
                setPatients(response.data);
            } catch (error) {
                console.error("Failed to fetch patients", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    const handleRowClick = async (patient) => {
        console.log(`Clicked ${patient.name}`);
        setSelectedPatient(patient);
        try {
            const response = await api.get(`/doctor/patient/${patient.email}`);
            setPatientDetail(response.data);
            setShowModal(true);
        } catch (error) {
            console.error("Failed to fetch patient details", error);
        }
    };

    if (loading) return <div>Loading Patients...</div>;

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h1 className={styles.welcomeText}>Provider Dashboard</h1>
                <button onClick={logout} className={styles.logoutButton}>Logout</button>
            </header>

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Assigned Patients</h3>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Patient Name</th>
                                <th>Email</th>
                                <th>Latest Goal Status</th>
                                <th>Compliance Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((patient, index) => (
                                <tr key={index} onClick={() => handleRowClick(patient)}>
                                    <td>{patient.name || 'Unknown'}</td>
                                    <td>{patient.email}</td>
                                    <td>{patient.latest_wellness_goal_status}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${patient.compliance_status === 'Goal Met' ? styles.statusSuccess : styles.statusPending}`}>
                                            {patient.compliance_status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {patients.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center' }}>No patients found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Patient Detail Modal */}
            {showModal && patientDetail && (
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
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Patient Summary: {patientDetail.name}</h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>Contact</h3>
                            <p style={{ color: '#64748b' }}>{patientDetail.email}</p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>Allergies</h3>
                            {patientDetail.allergies && patientDetail.allergies.length > 0 ? (
                                <ul style={{ color: '#64748b', paddingLeft: '1.5rem' }}>
                                    {patientDetail.allergies.map((allergy, idx) => (
                                        <li key={idx}>{allergy}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ color: '#64748b' }}>None reported</p>
                            )}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>Medications</h3>
                            {patientDetail.medications && patientDetail.medications.length > 0 ? (
                                <ul style={{ color: '#64748b', paddingLeft: '1.5rem' }}>
                                    {patientDetail.medications.map((med, idx) => (
                                        <li key={idx}>{med}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ color: '#64748b' }}>None reported</p>
                            )}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>Current Goals</h3>
                            {patientDetail.current_goals ? (
                                <div style={{ color: '#64748b' }}>
                                    <p>Steps: {patientDetail.current_goals.steps}</p>
                                    <p>Sleep: {patientDetail.current_goals.sleep_hours} hours</p>
                                </div>
                            ) : (
                                <p style={{ color: '#64748b' }}>No goals set</p>
                            )}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>Recent Activity (Last 7 Days)</h3>
                            {patientDetail.recent_logs && patientDetail.recent_logs.length > 0 ? (
                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {patientDetail.recent_logs.map((log, idx) => (
                                        <div key={idx} style={{
                                            padding: '0.5rem',
                                            marginBottom: '0.5rem',
                                            backgroundColor: '#f8fafc',
                                            borderRadius: '6px',
                                            color: '#64748b'
                                        }}>
                                            <strong>{log.date}</strong>: {log.steps} steps, {log.water_intake_ml}ml water
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#64748b' }}>No recent activity</p>
                            )}
                        </div>

                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '6px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderDashboard;

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PublicInfo.module.css';

const PublicInfo = () => {
    const healthTopics = [
        {
            title: "COVID-19 Updates",
            description: "Stay informed about the latest COVID-19 guidelines, vaccination information, and safety protocols.",
            icon: "🦠"
        },
        {
            title: "Seasonal Flu Prevention",
            description: "Learn about flu prevention strategies, vaccination schedules, and when to seek medical attention.",
            icon: "🤧"
        },
        {
            title: "Mental Health Resources",
            description: "Access resources for mental wellness, stress management, and professional support services.",
            icon: "🧠"
        },
        {
            title: "Nutrition & Wellness",
            description: "Discover healthy eating habits, dietary guidelines, and tips for maintaining a balanced lifestyle.",
            icon: "🥗"
        }
    ];

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.logo}>🏥 Health Portal</h1>
                    <nav className={styles.nav}>
                        <Link to="/login" className={styles.navLink}>Login</Link>
                        <Link to="/signup" className={styles.navButton}>Sign Up</Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h2 className={styles.heroTitle}>Your Health, Our Priority</h2>
                    <p className={styles.heroSubtitle}>Access comprehensive healthcare information and manage your wellness journey</p>
                    <Link to="/signup" className={styles.ctaButton}>Get Started</Link>
                </div>
            </section>

            {/* Health Information Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>General Health Information</h2>
                <div className={styles.topicsGrid}>
                    {healthTopics.map((topic, index) => (
                        <div key={index} className={styles.topicCard}>
                            <div className={styles.topicIcon}>{topic.icon}</div>
                            <h3 className={styles.topicTitle}>{topic.title}</h3>
                            <p className={styles.topicDescription}>{topic.description}</p>
                            <button className={styles.readMoreButton}>Read More →</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Privacy Policy Section */}
            <section className={styles.section} style={{ backgroundColor: '#f8fafc' }}>
                <div className={styles.policyContainer}>
                    <h2 className={styles.sectionTitle}>Privacy Policy</h2>
                    <div className={styles.policyContent}>
                        <h3>Data Collection & Usage</h3>
                        <p>
                            We collect personal health information to provide you with personalized healthcare services.
                            Your data is encrypted and stored securely in compliance with HIPAA regulations.
                        </p>

                        <h3>Information Security</h3>
                        <p>
                            We employ industry-standard security measures including encryption, secure authentication,
                            and regular security audits to protect your sensitive health information.
                        </p>

                        <h3>Data Sharing</h3>
                        <p>
                            Your health information is only shared with authorized healthcare providers involved in your care.
                            We never sell your personal data to third parties.
                        </p>

                        <h3>Your Rights</h3>
                        <p>
                            You have the right to access, modify, or delete your personal health information at any time.
                            You can also withdraw consent for data usage through your profile settings.
                        </p>

                        <h3>Audit Logging</h3>
                        <p>
                            All access to your health records is logged and monitored. You can review who has accessed
                            your information and when through your account dashboard.
                        </p>

                        <h3>Contact Us</h3>
                        <p>
                            For privacy concerns or questions, please contact our privacy officer at privacy@healthportal.com
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <p>&copy; 2026 Health Portal. All rights reserved.</p>
                <div className={styles.footerLinks}>
                    <a href="#terms">Terms of Service</a>
                    <a href="#privacy">Privacy Policy</a>
                    <a href="#contact">Contact</a>
                </div>
            </footer>
        </div>
    );
};

export default PublicInfo;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [clientName, setClientName] = useState(localStorage.getItem('clientName') || '');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleClientEnter = () => {
    if (!clientName.trim()) {
      setMessage('Veuillez entrer votre nom de client.');
      return;
    }
    localStorage.setItem('clientName', clientName.trim());
    navigate('/client-dashboard');
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>Bienvenue sur Chauffeur System RT</h1>
        <p style={styles.description}>
          Choisissez votre rôle :
        </p>

        <div style={styles.section}>
          <h2>Chauffeur</h2>
          <p>Connectez-vous ou créez un compte pour accéder au dashboard chauffeur.</p>
          <div style={styles.buttonGroup}>
            <button style={styles.btnPrimary} onClick={() => navigate('/login')}>
              Connexion Chauffeur
            </button>
            <button style={styles.btnSecondary} onClick={() => navigate('/register')}>
              Inscription Chauffeur
            </button>
          </div>
        </div>

        <div style={styles.section}>
          <h2>Client</h2>
          <p>Entrez votre nom pour accéder au dashboard client et commander.</p>
          <input
            type="text"
            placeholder="Votre nom"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            style={styles.input}
          />
          <button style={styles.btnPrimary} onClick={handleClientEnter}>
            Entrer comme client
          </button>
          {message && <p style={styles.error}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: '20px'
  },
  card: {
    width: '100%',
    maxWidth: '760px',
    backgroundColor: '#fff',
    borderRadius: '14px',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(15, 23, 42, 0.08)'
  },
  description: {
    color: '#4b5563',
    marginBottom: '24px'
  },
  section: {
    marginBottom: '28px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  btnPrimary: {
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 18px',
    cursor: 'pointer'
  },
  btnSecondary: {
    backgroundColor: '#ec4899',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 18px',
    cursor: 'pointer'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    marginBottom: '14px'
  },
  error: {
    color: '#dc2626',
    marginTop: '10px'
  }
};

export default Home;

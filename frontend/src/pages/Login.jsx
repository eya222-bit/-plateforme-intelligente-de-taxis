import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', mot_de_passe: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    // Si ton backend attend un JSON standard :
    const response = await api.post('/login', {
      email: formData.email,
      mot_de_passe: formData.mot_de_passe
    });
      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur de connexion');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Connexion Chauffeur 🚗</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={formData.mot_de_passe}
          onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
          required
        />
        <button type="submit">Se connecter</button>
      </form>
      <p>Pas encore de compte ? <Link to="/register">S'inscrire</Link></p>
    </div>
  );
};

const styles = {
  container: { maxWidth: '400px', margin: '50px auto', padding: '20px', textAlign: 'center', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  error: { color: 'red' }
};

export default Login;
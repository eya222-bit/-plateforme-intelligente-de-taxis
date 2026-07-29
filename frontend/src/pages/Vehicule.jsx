import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Vehicule = () => {
  const [vehicule, setVehicule] = useState({
    marque: '',
    modele: '',
    immatriculation: '',
    couleur: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Charger les données du véhicule au chargement
  useEffect(() => {
    fetchVehicule();
  }, []);

  const fetchVehicule = async () => {
    try {
      const response = await api.get('/vehicules/mon-vehicule');
      if (response.data) {
        setVehicule(response.data);
      }
    } catch (err) {
      console.log("Aucun véhicule encore enregistré.");
    }
  };

  // 2. Sauvegarder ou mettre à jour le véhicule
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/vehicules/', vehicule);
      setMessage({ type: 'success', text: 'Informations du véhicule enregistrées avec succès ! 🚗' });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Erreur lors de l\'enregistrement du véhicule.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>🚗 Gestion de Mon Véhicule</h2>
        <p style={{ color: '#666' }}>Renseignez les détails de la voiture utilisée pour les courses.</p>

        {message.text && (
          <div style={message.type === 'success' ? styles.successAlert : styles.errorAlert}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Marque :
            <input
              type="text"
              placeholder="Ex: Peugeot, Symbol, Toyota..."
              value={vehicule.marque}
              onChange={(e) => setVehicule({ ...vehicule, marque: e.target.value })}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Modèle :
            <input
              type="text"
              placeholder="Ex: 208, Clio, Corolla..."
              value={vehicule.modele}
              onChange={(e) => setVehicule({ ...vehicule, modele: e.target.value })}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Immatriculation (Matricule) :
            <input
              type="text"
              placeholder="Ex: 220 TN 1234"
              value={vehicule.immatriculation}
              onChange={(e) => setVehicule({ ...vehicule, immatriculation: e.target.value })}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Couleur :
            <input
              type="text"
              placeholder="Ex: Noir, Blanc, Gris..."
              value={vehicule.couleur}
              onChange={(e) => setVehicule({ ...vehicule, couleur: e.target.value })}
              required
              style={styles.input}
            />
          </label>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Enregistrement...' : 'Enregistrer le Véhicule'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: '40px auto',
    padding: '30px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
  label: { display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: 'bold', fontSize: '14px' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', fontWeight: 'normal' },
  button: { padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  successAlert: { backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '6px', marginBottom: '15px' },
  errorAlert: { backgroundColor: '#ffe3e3', color: '#dc3545', padding: '10px', borderRadius: '6px', marginBottom: '15px' }
};

export default Vehicule;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [activeCourse, setActiveCourse] = useState(null);
  const [offres, setOffres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    // 1. Vérification plus souple de la session (regarde 'clientName' OU 'user')
    const clientName = localStorage.getItem('clientName');
    const userStored = localStorage.getItem('user');
    
    if (!clientName && !userStored) {
      navigate('/login');
      return;
    }

    const saved = localStorage.getItem('clientActiveCourse');
    if (!saved) {
      setChargement(false);
      return;
    }

    try {
      const course = JSON.parse(saved);
      setActiveCourse(course);

      const fetchOffers = async () => {
        try {
          const res = await api.get(`/courses/${course.id}/offres`);
          setOffres(res.data);
        } catch (err) {
          console.error('Erreur récupération offres :', err);
        } finally {
          setChargement(false);
        }
      };

      fetchOffers();
      const interval = setInterval(fetchOffers, 3000);
      return () => clearInterval(interval);
    } catch (e) {
      console.error("Erreur de parsing du localStorage:", e);
      setChargement(false);
    }
  }, [navigate]);

  const accepterOffre = async (offreId) => {
    if (!activeCourse) return;

    try {
      const res = await api.post(`/courses/${activeCourse.id}/accepter`, { offre_id: offreId });
      setSelectedOffer(res.data);
      alert(`Offre acceptée : ${res.data.chauffeur_nom} à ${res.data.prix} TND`);
    } catch (err) {
      console.error('Erreur acceptation offre :', err);
      alert('Impossible d’accepter cette offre.');
    }
  };

  if (chargement) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '20px', textAlign: 'center' }}>Chargement en cours...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.sidebar}>
          <h2>Tableau de Bord Client 👤</h2>

          {/* 🌟 BOUTON PRINCIPAL DE COMMANDE (RELIÉ À ClientDemand.jsx) */}
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button 
              onClick={() => navigate('/commander')} 
              style={styles.btnCommander}
            >
              🚖 Commander une nouvelle course
            </button>
          </div>

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />

          <h3>Mes Propositions & Course Active</h3>

          {!activeCourse ? (
            <div style={styles.card}>
              <p>Aucune course active pour le moment.</p>
              <p>Cliquez sur le bouton <strong>"Commander une nouvelle course"</strong> ci-dessus pour ouvrir la carte et choisir votre destination.</p>
            </div>
          ) : (
            <>
              <div style={styles.card}>
                <h4>Course #{activeCourse.id}</h4>
                <p><strong>Client :</strong> {activeCourse.client_nom}</p>
                <p><strong>Destination :</strong> {activeCourse.destination_nom}</p>
                <p><strong>Distance :</strong> {activeCourse.distance_km} km</p>
                <p><strong>Statut :</strong> {activeCourse.statut}</p>
              </div>

              {offres.length === 0 ? (
                <div style={styles.card}>
                  <p>Aucune proposition reçue pour l'instant.</p>
                  <p>Veuillez patienter pendant que les chauffeurs proposent leur tarif.</p>
                </div>
              ) : (
                offres.map((offre) => (
                  <div key={offre.id} style={styles.card}>
                    <p><strong>Chauffeur :</strong> {offre.chauffeur_nom}</p>
                    <p><strong>Prix :</strong> {offre.prix} TND</p>
                    <p><strong>Statut :</strong> {offre.statut}</p>
                    <button onClick={() => accepterOffre(offre.id)} style={styles.btn}>Accepter cette offre</button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
  sidebar: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  card: { border: '1px solid #e0e0e0', padding: '15px', borderRadius: '6px', marginBottom: '15px', backgroundColor: '#f9f9f9' },
  btn: { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginTop: '5px', fontWeight: 'bold' },
  // Style du nouveau bouton Commander :
  btnCommander: { 
    width: '100%', 
    padding: '14px', 
    backgroundColor: '#007bff', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '6px', 
    fontSize: '16px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    boxShadow: '0 4px 6px rgba(0, 123, 255, 0.2)' 
  }
};

export default ClientDashboard;
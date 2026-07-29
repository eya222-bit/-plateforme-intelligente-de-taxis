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
    const clientName = localStorage.getItem('clientName');
    if (!clientName) {
      navigate('/');
      return;
    }

    const saved = localStorage.getItem('clientActiveCourse');
    if (!saved) {
      setChargement(false);
      return;
    }

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
  }, []);

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

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.sidebar}>
          <h2>Mes Propositions</h2>
          {!activeCourse ? (
            <div style={styles.card}>
              <p>Aucune course active.</p>
              <p>Créez une demande depuis la page <strong>Commander</strong>.</p>
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

              {selectedOffer && (
                <div style={styles.successCard}>
                  <p>✅ Offre acceptée par {selectedOffer.chauffeur_nom} à {selectedOffer.prix} TND.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '30px' },
  sidebar: { width: '600px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  btn: { padding: '10px 18px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' },
  successCard: { backgroundColor: '#e6ffed', padding: '16px', borderRadius: '10px', border: '1px solid #8fdb99' }
};

export default ClientDashboard;

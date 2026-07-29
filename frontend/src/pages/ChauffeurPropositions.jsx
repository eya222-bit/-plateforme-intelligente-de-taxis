import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ChauffeurPropositions = () => {
  // Coordonnées par défaut (ex: Tunis)
  const [positionChauffeur] = useState([36.8065, 10.1815]); 
  const [coursesProches, setCoursesProches] = useState([]);
  const [prixSaisis, setPrixSaisis] = useState({});
  const [chargement, setChargement] = useState(true);

  const fetchCourses = async () => {
    try {
      const res = await api.get(`/courses/proches?lat_chauffeur=${positionChauffeur[0]}&lng_chauffeur=${positionChauffeur[1]}`);
      console.log("📦 Courses reçues depuis la BDD :", res.data);
      setCoursesProches(res.data);
    } catch (err) {
      console.error("❌ Erreur lors de la récupération :", err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    const interval = setInterval(fetchCourses, 2000); // Polling toutes les 2s
    return () => clearInterval(interval);
  }, []);

  const envoyerPrix = async (courseId) => {
    const prix = prixSaisis[courseId];
    if (!prix) {
      alert("Saisissez un prix en TND.");
      return;
    }

    try {
      await api.post('/courses/proposer-prix', {
        course_id: parseInt(courseId),
        prix: parseFloat(prix)
      });
      alert("Proposition transmise au client !");
      setPrixSaisis({ ...prixSaisis, [courseId]: '' });
    } catch (err) {
      console.error("Erreur envoi prix :", err);
      alert("Erreur lors de l'envoi de la proposition.");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>📥 Demandes de courses disponibles</h2>

      {chargement && <p style={{ color: '#007bff' }}>Mise à jour des courses...</p>}

      {coursesProches.length === 0 ? (
        <div style={{ padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px' }}>
          <p style={{ color: '#666', margin: 0 }}>Aucune demande de course pour le moment.</p>
          <small style={{ color: '#888' }}>
            Créez une course depuis l'écran client (`/commander`) pour la voir apparaître ici.
          </small>
        </div>
      ) : (
        coursesProches.map((c) => (
          <div key={c.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>👤 {c.client_nom}</h3>
              <span style={badgeStyle}>
                À {c.distance_du_chauffeur_km} km de vous
              </span>
            </div>

            <p style={{ margin: '10px 0 5px 0' }}>
              📍 <strong>Destination :</strong> {c.destination_nom}
            </p>
            <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666' }}>
              📏 Distance du trajet : <strong>{c.distance_km} km</strong>
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number" 
                placeholder="Votre tarif (TND)" 
                value={prixSaisis[c.id] || ''} 
                onChange={(e) => setPrixSaisis({ ...prixSaisis, [c.id]: e.target.value })}
                style={inputStyle}
              />
              <button 
                onClick={() => envoyerPrix(c.id)}
                style={btnStyle}
              >
                Proposer
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const cardStyle = { border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const badgeStyle = { backgroundColor: '#e3f2fd', color: '#0d47a1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' };
const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 };
const btnStyle = { padding: '8px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' };

export default ChauffeurPropositions;
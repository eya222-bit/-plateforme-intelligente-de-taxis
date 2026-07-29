import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ChauffeurPropositions = () => {
  const [coursesDispo, setCoursesDispo] = useState([]);
  const [prixPropose, setPrixPropose] = useState({});

  // Charger régulièrement les demandes à proximité
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/courses/disponibles');
        setCoursesDispo(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const envoyerProposition = async (courseId) => {
    const prix = prixPropose[courseId];
    if (!prix) {
      alert("Veuillez saisir un prix en TND.");
      return;
    }

    try {
      await api.post('/courses/proposer-prix', {
        course_id: courseId,
        prix_propose: parseFloat(prix)
      });
      alert("Proposition de prix envoyée au client !");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📥 Demandes de courses à proximité</h2>
      {coursesDispo.length === 0 ? (
        <p>Aucune demande de course pour le moment...</p>
      ) : (
        coursesDispo.map((c) => (
          <div key={c.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <h4>Client : {c.client_nom}</h4>
            <p>📍 Destination : <strong>{c.destination_nom}</strong></p>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="number" 
                placeholder="Votre prix (TND)" 
                value={prixPropose[c.id] || ''} 
                onChange={(e) => setPrixPropose({ ...prixPropose, [c.id]: e.target.value })}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button 
                onClick={() => envoyerProposition(c.id)}
                style={{ padding: '8px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Proposer ce prix
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChauffeurPropositions;
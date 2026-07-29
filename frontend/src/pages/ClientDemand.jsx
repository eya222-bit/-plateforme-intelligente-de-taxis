import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from '../components/Navbar';
import api from '../services/api';

const ClientDemand = () => {
  const navigate = useNavigate();

  // Position par défaut : Tunis
  const [depart, setDepart] = useState([36.8065, 10.1815]); 
  const [destination, setDestination] = useState(null);
  const [destNom, setDestNom] = useState('');
  
  const [mode, setMode] = useState('DESTINATION'); // 'DEPART' ou 'DESTINATION'
  const [chargement, setChargement] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [offres, setOffres] = useState([]);

  // Récupérer la vraie position GPS si disponible
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setDepart([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  // Gestion du clic sur la carte
  const MapClicker = () => {
    useMapEvents({
      click(e) {
        const coords = [e.latlng.lat, e.latlng.lng];
        if (mode === 'DEPART') {
          setDepart(coords);
        } else {
          setDestination(coords);
        }
      },
    });
    return null;
  };

  // Envoi de la demande au backend
  const commander = async () => {
    console.log("--> Bouton 'Lancer la recherche' cliqué !");
    console.log("Départ:", depart);
    console.log("Destination:", destination);

    if (!destination) {
      alert("⚠️ Veuillez cliquer sur la carte pour choisir votre point de destination.");
      return;
    }

    setChargement(true);

    try {
      const payload = {
        client_nom: localStorage.getItem('clientName') || 'Client',
        lat_depart: depart[0],
        lng_depart: depart[1],
        destination_nom: destNom || "Destination sélectionnée sur carte",
        lat_dest: destination[0],
        lng_dest: destination[1]
      };

      console.log("Payload envoyé à l'API :", payload);

      const res = await api.post('/courses/demander', payload);
      console.log("Réponse reçue du serveur :", res.data);

      localStorage.setItem('clientActiveCourse', JSON.stringify(res.data));
      setActiveCourse(res.data);
      alert("✅ Demande envoyée avec succès ! Les chauffeurs à proximité vont vous proposer un prix.");
      navigate('/client-dashboard');
    } catch (err) {
      console.error("❌ Erreur lors de la commande :", err);
      alert("Erreur lors de l'envoi de la demande. Vérifiez que le serveur FastAPI fonctionne.");
    } finally {
      setChargement(false);
    }
  };

  // Polling des offres de prix (toutes les 2 secondes)
  useEffect(() => {
    let timer;
    if (activeCourse && activeCourse.id) {
      timer = setInterval(async () => {
        try {
          const res = await api.get(`/courses/${activeCourse.id}/offres`);
          setOffres(res.data);
        } catch (err) {
          console.error("Erreur récupération offres :", err);
        }
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [activeCourse]);

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        
        {/* Sidebar Formulaire */}
        <div style={{ width: '380px', padding: '20px', backgroundColor: '#f8f9fa', borderRight: '1px solid #ddd', boxSizing: 'border-box' }}>
          <h2>🚕 Commander un Trajet</h2>

          <p style={{ fontSize: '13px', color: '#555', marginBottom: '15px' }}>
            Sélectionnez un mode puis cliquez sur la carte :
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
            <button 
              type="button"
              onClick={() => setMode('DEPART')} 
              style={{ ...btnStyle, backgroundColor: mode === 'DEPART' ? '#007bff' : '#6c757d' }}
            >
              📍 1. Pointer le Départ {mode === 'DEPART' && '(Actif)'}
            </button>
            <button 
              type="button"
              onClick={() => setMode('DESTINATION')} 
              style={{ ...btnStyle, backgroundColor: mode === 'DESTINATION' ? '#28a745' : '#6c757d' }}
            >
              🏁 2. Pointer la Destination {mode === 'DESTINATION' && '(Actif)'}
            </button>
          </div>

          <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Nom / Adresse (Optionnel) :</label>
          <input 
            type="text" 
            placeholder="Ex: Marsa, Centre Ville..." 
            value={destNom} 
            onChange={(e) => setDestNom(e.target.value)}
            style={inputStyle}
          />

          {destination ? (
            <div style={{ padding: '8px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', marginBottom: '15px', fontSize: '12px' }}>
              ✓ Destination pointée sur la carte !
            </div>
          ) : (
            <div style={{ padding: '8px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px', marginBottom: '15px', fontSize: '12px' }}>
              ⚠️ Cliquez sur la carte pour définir la destination.
            </div>
          )}

          <button 
            type="button"
            onClick={commander} 
            disabled={chargement}
            style={{ ...btnStyle, backgroundColor: chargement ? '#ccc' : '#007bff', fontSize: '16px', padding: '12px' }}
          >
            {chargement ? "Envoi en cours..." : "🚀 Lancer la recherche"}
          </button>

          <hr style={{ margin: '20px 0' }} />

          {/* Offres reçues */}
          <h3>💰 Offres des Chauffeurs</h3>
          {activeCourse && (
            <p style={{ fontSize: '13px', color: '#333' }}>
              Course N°<strong>{activeCourse.id}</strong> — Distance : <strong>{activeCourse.distance_km} km</strong>
            </p>
          )}

          {offres.length === 0 ? (
            <p style={{ color: '#888', fontSize: '13px' }}>
              {activeCourse ? "Recherche de chauffeurs en cours..." : "Pointez la destination et lancez la recherche."}
            </p>
          ) : (
            offres.map((o) => (
              <div key={o.id} style={cardOffreStyle}>
                <div>
                  <strong>{o.chauffeur_nom}</strong>
                  <div style={{ color: '#28a745', fontSize: '18px', fontWeight: 'bold' }}>{o.prix} TND</div>
                </div>
                <button 
                  onClick={() => alert(`Course acceptée avec ${o.chauffeur_nom} !`)} 
                  style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Accepter
                </button>
              </div>
            ))
          )}
        </div>

        {/* Carte Leaflet */}
        <div style={{ flex: 1 }}>
          <MapContainer center={depart} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClicker />

            {/* Départ */}
            <Marker position={depart}>
              <Popup>📍 Départ</Popup>
            </Marker>

            {/* Destination */}
            {destination && (
              <Marker position={destination}>
                <Popup>🏁 Destination : {destNom || "Choisie"}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

      </div>
    </div>
  );
};

const btnStyle = { width: '100%', padding: '10px', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
const cardOffreStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#fff', borderRadius: '6px', marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };

export default ClientDemand;
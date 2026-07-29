import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Navbar from '../components/Navbar';
import api from '../services/api';

// Correction pour les icônes par défaut de Leaflet avec Webpack/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const Dashboard = () => {
  const [chauffeurName, setChauffeurName] = useState('');
  const [position, setPosition] = useState([36.8065, 10.1815]);
  const [estDisponible, setEstDisponible] = useState(true);
  const [demandes, setDemandes] = useState([
    { id: 1, client: 'Sami', lat: 36.8100, lng: 10.1850, destination: 'Aéroport Tunis-Carthage', prix: '15 TND' },
    { id: 2, client: 'Aymen', lat: 36.8020, lng: 10.1780, destination: 'Centre Ville', prix: '8 TND' }
  ]);
  const [coursesProches, setCoursesProches] = useState([]);
  const [prixSaisis, setPrixSaisis] = useState({});
  const [chargementCourses, setChargementCourses] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.log('Géolocalisation refusée ou indisponible :', err)
      );
    }
  }, []);

  const accepterCourse = (id) => {
    alert(`Course #${id} acceptée !`);
    setDemandes(demandes.filter((d) => d.id !== id));
  };

  const fetchCoursesProches = async () => {
    try {
      const res = await api.get(`/courses/proches?lat_chauffeur=${position[0]}&lng_chauffeur=${position[1]}`);
      console.log('Courses backend reçues :', res.data);
      setCoursesProches(res.data);
    } catch (err) {
      console.error('Erreur récupération courses proches :', err);
    } finally {
      setChargementCourses(false);
    }
  };

  useEffect(() => {
    fetchCoursesProches();
    const interval = setInterval(fetchCoursesProches, 3000);
    return () => clearInterval(interval);
  }, [position]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setChauffeurName(`${res.data.nom} ${res.data.prenom}`.trim());
      } catch (err) {
        console.error('Erreur récupération profil chauffeur :', err);
      }
    };
    fetchProfile();
  }, []);

  const proposerPrix = async (courseId) => {
    const prix = prixSaisis[courseId];
    if (!prix) {
      alert('Veuillez saisir un prix en TND.');
      return;
    }

    try {
      await api.post('/courses/proposer-prix', {
        course_id: courseId,
        prix: parseFloat(prix)
      });
      alert(`Proposition transmise au client par ${chauffeurName || 'votre profil'} !`);
      setPrixSaisis({ ...prixSaisis, [courseId]: '' });
    } catch (err) {
      console.error('Erreur envoi prix :', err);
      alert('Erreur lors de l’envoi de la proposition.');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.sidebar}>
          <h3>Statut Chauffeur</h3>
          <button
            onClick={() => setEstDisponible(!estDisponible)}
            style={{
              ...styles.statusBtn,
              backgroundColor: estDisponible ? '#28a745' : '#6c757d'
            }}
          >
            {estDisponible ? ' En Service' : ' Hors Service'}
          </button>

          <hr style={{ margin: '20px 0' }} />

          <section style={{ marginBottom: '20px' }}>
            <h4>Demandes statiques (ancienne version)</h4>
            {demandes.map((item) => (
              <div key={`static-${item.id}`} style={styles.card}>
                <p><strong>Client :</strong> {item.client}</p>
                <p><strong>Destination :</strong> {item.destination}</p>
                <p><strong>Prix :</strong> {item.prix}</p>
                <button
                  onClick={() => accepterCourse(item.id)}
                  style={styles.acceptBtn}
                  disabled={!estDisponible}
                >
                  Accepter la course
                </button>
              </div>
            ))}
          </section>

          <section>
            <h4>Bonjour {chauffeurName || 'Chauffeur'}</h4>
            <p>Répondez aux demandes avec votre tarif réel.</p>
            <h4>Demandes temps réel (backend)</h4>
            {chargementCourses ? (
              <p style={{ color: '#007bff' }}>Chargement des demandes...</p>
            ) : coursesProches.length === 0 ? (
              <div style={styles.card}>
                <p style={{ color: '#666', margin: 0 }}>Aucune demande de course disponible.</p>
                <small style={{ color: '#888' }}>
                  Créez une demande dans `/commander` pour la voir ici.
                </small>
              </div>
            ) : (
              coursesProches.map((c) => (
                <div key={`real-${c.id}`} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h4 style={{ margin: 0 }}>{c.client_nom}</h4>
                    <span style={styles.badge}>{c.distance_du_chauffeur_km} km</span>
                  </div>
                  <p style={{ margin: '10px 0 5px 0' }}><strong>Destination :</strong> {c.destination_nom}</p>
                  <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666' }}>
                    Distance demande : {c.distance_km} km
                  </p>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="number"
                      placeholder="Votre prix (TND)"
                      value={prixSaisis[c.id] || ''}
                      onChange={(e) => setPrixSaisis({ ...prixSaisis, [c.id]: e.target.value })}
                      style={styles.input}
                    />
                    <button onClick={() => proposerPrix(c.id)} style={styles.btn}>Proposer</button>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>

        <div style={styles.mapContainer}>
          <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={position} icon={customIcon}>
              <Popup>Vous êtes ici (Chauffeur)</Popup>
            </Marker>

            {demandes.map((c) => (
              <Marker key={`static-marker-${c.id}`} position={[c.lat, c.lng]} icon={customIcon}>
                <Popup>
                  <strong>{c.client}</strong><br />
                  Vers: {c.destination}
                </Popup>
              </Marker>
            ))}

            {coursesProches.map((c) => (
              <Marker key={`real-marker-${c.id}`} position={c.depart} icon={customIcon}>
                <Popup>
                  <strong>{c.client_nom}</strong><br />
                  Vers: {c.destination_nom}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', height: 'calc(100vh - 60px)' },
  sidebar: { width: '320px', padding: '20px', backgroundColor: '#f8f9fa', borderRight: '1px solid #ddd', overflowY: 'auto' },
  mapContainer: { flex: 1 },
  statusBtn: { width: '100%', padding: '12px', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  card: { backgroundColor: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  acceptBtn: { width: '100%', padding: '8px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '8px' }
};

export default Dashboard;
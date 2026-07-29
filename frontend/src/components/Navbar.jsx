import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>🚗 Chauffeur System RT</div>
      <div style={styles.menu}>
        {token ? (
          <>
            <button onClick={() => navigate('/ChauffeurDashboard')} style={styles.linkBtn}>Dashboard</button>
            <button onClick={() => navigate('/vehicule')} style={styles.linkBtn}>Mon Véhicule</button>
            <button onClick={() => navigate('/Home')} style={styles.linkBtn}>Page d'accueil</button>
            <button onClick={handleLogout} style={styles.logoutBtn}>Déconnexion</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/client-dashboard')} style={styles.linkBtn}>Mes Propositions</button>
            <button onClick={() => navigate('/commander')} style={styles.linkBtn}>Commander</button>
            <button onClick={() => navigate('/Home')} style={styles.linkBtn}>Page d'accueil</button>
            <button onClick={handleLogout} style={styles.logoutBtn}>Déconnexion</button>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  brand: { fontSize: '20px', fontWeight: 'bold' },
  menu: { display: 'flex', gap: '15px' },
  linkBtn: { background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '15px' },
  logoutBtn: { backgroundColor: '#dc3551', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default Navbar;
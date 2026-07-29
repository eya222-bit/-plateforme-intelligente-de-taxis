import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // Si pas de token, redirection vers la page de Login
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Logout = () => {
  const { dispatch } = useContext(AuthContext);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' }); // Clear user state and remove from localStorage
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;

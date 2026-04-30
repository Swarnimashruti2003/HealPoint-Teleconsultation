import { useState, useEffect } from 'react';

export function useAuth() {
  const [idToken, setIdToken] = useState<string | null>(() => 
    typeof window !== 'undefined' ? localStorage.getItem('idToken') : null
  );
  const [currentUser, setCurrentUser] = useState<any>(() => 
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('currentUser') || 'null') : null
  );

  const login = (token: string, user: any) => {
    setIdToken(token);
    setCurrentUser(user);
    localStorage.setItem('idToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setIdToken(null);
    setCurrentUser(null);
    localStorage.removeItem('idToken');
    localStorage.removeItem('currentUser');
  };

  return { idToken, currentUser, login, logout };
}

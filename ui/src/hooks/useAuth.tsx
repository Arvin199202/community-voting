import { useState, useEffect } from 'react';

interface User {
  address: string;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);

        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setUser({
              address: accounts[0],
              isAuthenticated: true
            });
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const connect = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setUser({
          address: accounts[0],
          isAuthenticated: true
        });
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const disconnect = () => {
    setUser(null);
  };

  return {
    user,
    isLoading,
    connect,
    disconnect
  };
};

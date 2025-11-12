import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';

export const WalletConnector: React.FC = () => {
  const { user, connect, disconnect } = useAuth();
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      if (window.ethereum) {
        await disconnect();

        await new Promise(resolve => setTimeout(resolve, 500));

        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        if (accounts && accounts.length > 0) {
          setUser({
            address: accounts[0],
            isAuthenticated: true
          });
        }
      }
    } catch (error) {
      console.error('Reconnection failed:', error);
      try {
        await connect();
      } catch (connectError) {
        console.error('Fallback connection failed:', connectError);
      }
    } finally {
      setIsReconnecting(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Connected: {user.address.slice(0, 6)}...{user.address.slice(-4)}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleReconnect}
          disabled={isReconnecting}
        >
          {isReconnecting ? 'Reconnecting...' : 'Reconnect Wallet'}
        </Button>
        <Button variant="secondary" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connect}>
      Connect Wallet
    </Button>
  );
};

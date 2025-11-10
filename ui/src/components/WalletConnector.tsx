import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';

export const WalletConnector: React.FC = () => {
  const { user, connect, disconnect } = useAuth();
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await disconnect();
      setTimeout(async () => {
        await connect();
        setIsReconnecting(false);
      }, 1000);
    } catch (error) {
      console.error('Reconnection failed:', error);
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

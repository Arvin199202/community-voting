import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

export const WalletConnector: React.FC = () => {
  const { user, connect, disconnect } = useAuth();
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
    setSuccess(null);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleReconnect = async () => {
    setIsReconnecting(true);
    setError(null);
    setSuccess(null);

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not detected. Please install MetaMask to continue.');
      }

      await disconnect();

      await new Promise(resolve => setTimeout(resolve, 500));

      const accounts: string[] = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts && Array.isArray(accounts) && accounts.length > 0 && typeof accounts[0] === 'string') {
        setUser({
          address: accounts[0],
          isAuthenticated: true
        });
        showSuccess('Wallet reconnected successfully!');
      } else {
        throw new Error('No accounts found. Please connect your wallet.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Reconnection failed';
      showError(errorMessage);

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
      <div className="flex flex-col gap-2">
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

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
            {success}
          </div>
        )}
      </div>
    );
  }

  return (
    <Button onClick={connect}>
      Connect Wallet
    </Button>
  );
};

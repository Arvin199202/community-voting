import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';

interface AuthMiddlewareProps {
  children: React.ReactNode;
}

export const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
  const { user, isLoading, connect } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to participate in the community voting system.
          </p>
          <Button onClick={connect} className="w-full">
            Connect Wallet
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            This application requires MetaMask or a compatible Web3 wallet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
};

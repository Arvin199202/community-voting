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

  return (
    <>
      {children}
    </>
  );
};

import { useState } from 'react';
import { AuthContext } from './AuthContext';
import { axiosClient } from '../utils/axiosClient';
import React from 'react';

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [githubConnected, setGithubConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosClient.get('/auth/me', {
          withCredentials: true,
        });

        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout', {}, { withCredentials: true });
    } catch {
      // even if logout fails, clear local state
    } finally {
      setIsAuthenticated(false);
      setGithubConnected(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        githubConnected,
        isLoading,
        setGithubConnected,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
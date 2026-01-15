import { createContext } from 'react';
import type { AuthContextType } from './Auth.types';

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  githubConnected: false,
  setGithubConnected: () => {},
  login: () => {},
  logout: async () => {},
});

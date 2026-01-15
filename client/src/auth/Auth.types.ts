export type AuthContextType = {
  isAuthenticated: boolean;
  githubConnected: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  setGithubConnected: (value: boolean) => void;
};
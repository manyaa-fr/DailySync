export interface GitHubAccount {
  github_id: number;
  username: string;
  access_token?: string;
  connected_at: string;
}

export interface UserProfileData {
  avatar_url?: string | null;
  location?: string;
  about?: string;
  skills?: string[];
  social_links?: Record<string, string>;
}

export interface UserStats {
  total_commits: number;
  hours_logged: number;
  current_streak: number;
  last_sync_date?: string | null | undefined;
}

export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  github?: GitHubAccount;
  profile?: UserProfileData;
  stats?: UserStats;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  notifications_enabled: boolean;
  email_digest_frequency: 'daily' | 'weekly' | 'never';
  theme_preference: 'system' | 'light' | 'dark';
  privacy_level: 'public' | 'private';
}

export interface PasswordChangeRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  profile?: UserProfileData;
}

export interface AuthUser {
  user_id: string;
  email: string;
}
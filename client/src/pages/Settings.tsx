import React, { useEffect, useState } from 'react';
import {
  Moon,
  Sun,
  Bell,
  Lock,
  Trash2,
  Mail,
  Loader,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, SectionTitle } from '../components/ui/UIComponents';
import { useTheme } from '../context/Theme/useTheme';
import { useAuth } from '../auth/useAuth';
import { axiosClient } from '../utils/axiosClient';
import type { UserSettings } from '../types/User';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true,
    email_digest_frequency: 'weekly',
    theme_preference: theme || 'system',
    privacy_level: 'private',
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/user/settings');
        setSettings(response.data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        setError('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle notification preference change
  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      setError(null);
      await axiosClient.put('/user/settings', {
        ...settings,
        notifications_enabled: enabled,
      });
      setSettings((prev) => ({
        ...prev,
        notifications_enabled: enabled,
      }));
      setSuccess('Notification settings updated.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to update notification settings:', err);
      setError('Failed to update notification settings.');
    }
  };

  // Handle email digest frequency change
  const handleDigestFrequencyChange = async (frequency: 'daily' | 'weekly' | 'never') => {
    try {
      setError(null);
      await axiosClient.put('/user/settings', {
        ...settings,
        email_digest_frequency: frequency,
      });
      setSettings((prev) => ({
        ...prev,
        email_digest_frequency: frequency,
      }));
      setSuccess('Email digest preferences updated.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to update digest frequency:', err);
      setError('Failed to update email preferences.');
    }
  };

  // Handle theme change
  const handleThemeChange = (newTheme: 'system' | 'light' | 'dark') => {
    try {
      setError(null);
      // Only pass light/dark to setTheme; system is just a preference
      if (newTheme !== 'system') {
        setTheme(newTheme);
      }
      setSettings((prev) => ({
        ...prev,
        theme_preference: newTheme,
      }));
      setSuccess('Theme updated.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to update theme:', err);
      setError('Failed to update theme.');
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!passwordForm.old_password) {
      setError('Current password is required.');
      return;
    }
    if (!passwordForm.new_password) {
      setError('New password is required.');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New passwords do not match.');
      return;
    }

    try {
      setPasswordChanging(true);
      await axiosClient.put('/user/password', passwordForm);

      setSuccess('Password changed successfully.');
      setPasswordForm({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      console.error('Failed to change password:', err);
      const errorMessage = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to change password. Please try again.';
      setError(errorMessage);
    } finally {
      setPasswordChanging(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE MY ACCOUNT') {
      setError('Please type the confirmation text exactly.');
      return;
    }

    try {
      setDeletingAccount(true);
      setError(null);

      // Get password from user before deletion
      const password = window.prompt('Enter your password to confirm account deletion:');
      if (!password) return;

      await axiosClient.delete('/auth/account', {
        data: { password },
      });

      setSuccess('Account deleted. Logging you out...');
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err: unknown) {
      console.error('Failed to delete account:', err);
      const errorMessage = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to delete account. Please try again.';
      setError(errorMessage);
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      {/* Success Alert */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Theme Settings */}
      <Card className="p-8 border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <SectionTitle title="Theme" />
            <p className="text-sm text-muted-foreground mt-1">Customize app appearance</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {['system', 'light', 'dark'].map((themeOption) => (
            <button
              key={themeOption}
              onClick={() => handleThemeChange(themeOption as 'system' | 'light' | 'dark')}
              className={`p-4 rounded-lg border-2 transition flex items-center justify-center gap-3 ${
                settings.theme_preference === themeOption
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary hover:border-primary/50'
              }`}
            >
              {themeOption === 'light' && <Sun size={20} />}
              {themeOption === 'dark' && <Moon size={20} />}
              {themeOption === 'system' && <div className="w-5 h-5 flex items-center justify-center">⚙️</div>}
              <span className="capitalize font-medium">{themeOption}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-8 border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <SectionTitle title="Notifications" />
            <p className="text-sm text-muted-foreground mt-1">Manage notification preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-primary" />
              <div>
                <p className="font-medium text-foreground">Enable Notifications</p>
                <p className="text-xs text-muted-foreground">Receive important alerts</p>
              </div>
            </div>
            <button
              onClick={() => handleNotificationToggle(!settings.notifications_enabled)}
              className={`relative w-12 h-7 rounded-full transition ${
                settings.notifications_enabled ? 'bg-primary' : 'bg-secondary border border-border'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition ${
                  settings.notifications_enabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Email Digest Frequency */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              <Mail size={16} className="inline mr-2" />
              Email Digest Frequency
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['daily', 'weekly', 'never'].map((freq) => (
                <button
                  key={freq}
                  onClick={() =>
                    handleDigestFrequencyChange(freq as 'daily' | 'weekly' | 'never')
                  }
                  className={`p-3 rounded-lg border-2 transition capitalize font-medium ${
                    settings.email_digest_frequency === freq
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-secondary hover:border-primary/50 text-foreground'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Password Settings */}
      <Card className="p-8 border-border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Lock size={24} className="text-primary" />
          <div>
            <SectionTitle title="Change Password" />
            <p className="text-sm text-muted-foreground mt-1">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.old ? 'text' : 'password'}
                value={passwordForm.old_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    old_password: e.target.value,
                  })
                }
                placeholder="Enter your current password"
                className="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    old: !showPasswords.old,
                  })
                }
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password: e.target.value,
                  })
                }
                placeholder="Enter your new password"
                className="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    new: !showPasswords.new,
                  })
                }
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirm_password: e.target.value,
                  })
                }
                placeholder="Confirm your new password"
                className="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    confirm: !showPasswords.confirm,
                  })
                }
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordChanging}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {passwordChanging ? (
              <>
                <Loader size={18} className="animate-spin" /> Changing...
              </>
            ) : (
              <>
                <Lock size={18} /> Change Password
              </>
            )}
          </button>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="p-8 border-2 border-destructive/30 shadow-sm bg-destructive/5 dark:bg-destructive/10">
        <div className="flex items-center gap-3 mb-6">
          <Trash2 size={24} className="text-destructive" />
          <div>
            <SectionTitle title="Danger Zone" />
            <p className="text-sm text-muted-foreground mt-1">Irreversible actions</p>
          </div>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full px-4 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition font-medium flex items-center justify-center gap-2"
        >
          <Trash2 size={18} /> Delete Account
        </button>
      </Card>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="p-8 max-w-md w-full border-border shadow-lg">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle size={24} className="text-destructive" />
              Delete Account?
            </h2>

            <p className="text-muted-foreground mb-6">
              This action is permanent and cannot be undone. All your data will be deleted
              including:
            </p>

            <ul className="list-disc list-inside text-sm text-muted-foreground mb-6 space-y-1">
              <li>Profile information</li>
              <li>Time logs</li>
              <li>GitHub snapshots</li>
              <li>AI summaries</li>
            </ul>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Type "<span className="font-bold">DELETE MY ACCOUNT</span>" to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full px-4 py-2 border border-border rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-destructive"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm('');
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={
                  deletingAccount || deleteConfirm !== 'DELETE MY ACCOUNT'
                }
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deletingAccount ? (
                  <>
                    <Loader size={18} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} /> Delete Permanently
                  </>
                )}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

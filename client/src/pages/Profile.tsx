import React, { useEffect, useState } from 'react';
import {
  Mail,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Github,
  LogOut,
  Loader,
  AlertCircle,
} from 'lucide-react';
import { Card, SectionTitle, Badge } from '../components/ui/UIComponents';
import { useAuth } from '../auth/useAuth';
import {axiosClient} from '../utils/axiosClient';
import type { UserProfile } from '../types/User';

export default function ProfilePage() {
  useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [disconnectingGithub, setDisconnectingGithub] = useState(false);

  // Editable fields
  const [formData, setFormData] = useState({
    fullName: '',
    location: '',
    about: '',
    skills: [] as string[],
  });

  const [skillInput, setSkillInput] = useState('');

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosClient.get('/user/profile');
        setProfile(response.data);

        // Initialize form data
        setFormData({
          fullName: response.data.fullName || '',
          location: response.data.profile?.location || '',
          about: response.data.profile?.about || '',
          skills: response.data.profile?.skills || [],
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add skill
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  // Remove skill
  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setError(null);
      await axiosClient.put('/user/profile', {
        fullName: formData.fullName,
        profile: {
          location: formData.location,
          about: formData.about,
          skills: formData.skills,
          avatar_url: profile?.profile?.avatar_url,
          social_links: profile?.profile?.social_links || {},
        },
      });

      // Update local state
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              fullName: formData.fullName,
              profile: {
                ...prev.profile,
                location: formData.location,
                about: formData.about,
                skills: formData.skills,
              },
            }
          : null
      );

      setEditing(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Failed to save profile changes. Please try again.');
    }
  };

  // Disconnect GitHub
  const handleDisconnectGithub = async () => {
    if (!window.confirm('Are you sure you want to disconnect GitHub?')) return;

    try {
      setDisconnectingGithub(true);
      setError(null);
      await axiosClient.delete('/github/disconnect');

      // Update local state
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              github: undefined,
            }
          : null
      );
    } catch (err) {
      console.error('Failed to disconnect GitHub:', err);
      setError('Failed to disconnect GitHub. Please try again.');
    } finally {
      setDisconnectingGithub(false);
    }
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <AlertCircle className="w-8 h-8 mx-auto text-destructive" />
          <p className="text-muted-foreground">{error || 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  const initials = profile.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="relative mb-24 mt-8">
        <div className="h-48 w-full bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl border border-border"></div>
        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
          <div className="w-32 h-32 rounded-full border-[6px] border-background bg-primary flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-lg">
            {initials}
          </div>
          <div className="pb-2">
            {editing ? (
              <div className="space-y-2 mb-4">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="text-3xl font-bold bg-transparent border-b-2 border-primary text-foreground outline-none"
                  placeholder="Full Name"
                />
                <p className="text-muted-foreground text-sm">
                  {profile.email}
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-foreground">
                  {profile.fullName}
                </h1>
                <p className="text-muted-foreground">{profile.email}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <div className="md:col-span-1 space-y-6">
          {/* About Card */}
          <Card className="p-6 space-y-4 border-border shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">About</h3>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="p-1 hover:bg-secondary rounded-md transition"
                  title="Edit profile"
                >
                  <Edit2 size={18} className="text-muted-foreground" />
                </button>
              )}
            </div>

            <div className="border-b border-border pb-3" />

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Location
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin size={16} className="text-muted-foreground" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                      className="flex-1 px-3 py-2 border border-border rounded-md bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    About
                  </label>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-md bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary resize-none mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition font-medium text-sm"
                  >
                    <Save size={16} /> Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border text-foreground rounded-md hover:bg-secondary transition font-medium text-sm"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="flex-shrink-0" />
                  <span>{profile.email}</span>
                </div>
                {profile.profile?.location && (
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="flex-shrink-0" />
                    <span>{profile.profile.location}</span>
                  </div>
                )}
                {profile.github?.username && (
                  <div className="flex items-center gap-3">
                    <Github size={16} className="flex-shrink-0" />
                    <span>{profile.github.username}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="flex-shrink-0" />
                  <span>Joined {formatDate(profile.created_at)}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Skills Card */}
          <Card className="p-6 border-border shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Skills</h3>

            {editing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="Add a skill..."
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={addSkill}
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="neutral"
                      className="cursor-pointer hover:opacity-75 transition group"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill}
                      <X size={12} className="ml-1 opacity-0 group-hover:opacity-100" />
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.skills && formData.skills.length > 0 ? (
                  formData.skills.map((skill) => (
                    <Badge key={skill} variant="neutral">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No skills added yet</p>
                )}
              </div>
            )}
          </Card>

          {/* GitHub Card */}
          <Card className="p-6 border-border shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">GitHub</h3>
            {profile.github?.username ? (
              <div className="space-y-3">
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Github size={16} /> Connected
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Last synced: {formatDate(profile.stats?.last_sync_date)}
                  </p>
                  <button
                    onClick={handleDisconnectGithub}
                    disabled={disconnectingGithub}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition text-sm font-medium disabled:opacity-50"
                  >
                    {disconnectingGithub ? (
                      <>
                        <Loader size={14} className="animate-spin" /> Disconnecting...
                      </>
                    ) : (
                      <>
                        <LogOut size={14} /> Disconnect
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-secondary rounded-lg text-center">
                <Github size={24} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  Connect your GitHub account to see metrics
                </p>
                <button className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition text-sm font-medium">
                  Connect GitHub
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Performance Snapshot */}
          <Card className="p-8 border-border shadow-sm">
            <SectionTitle title="Performance Snapshot" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="p-5 rounded-xl bg-secondary text-center hover:bg-secondary/80 transition">
                <div className="text-3xl font-bold text-primary">
                  {profile.stats?.total_commits || 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">
                  Total Commits
                </div>
              </div>

              <div className="p-5 rounded-xl bg-secondary text-center hover:bg-secondary/80 transition">
                <div className="text-3xl font-bold text-primary">
                  {profile.stats?.hours_logged || 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">
                  Hours Logged
                </div>
              </div>

              <div className="p-5 rounded-xl bg-secondary text-center hover:bg-secondary/80 transition">
                <div className="text-3xl font-bold text-primary">
                  {formData.skills.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">
                  Skills
                </div>
              </div>

              <div className="p-5 rounded-xl bg-secondary text-center hover:bg-secondary/80 transition">
                <div className="text-3xl font-bold text-primary">
                  {profile.stats?.current_streak || 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">
                  Day Streak
                </div>
              </div>
            </div>
          </Card>

          {/* About Section */}
          {profile.profile?.about && !editing && (
            <Card className="p-8 border-border shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Bio</h3>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                {profile.profile.about}
              </p>
            </Card>
          )}

          {/* Account Info */}
          <Card className="p-8 border-border shadow-sm">
            <h3 className="font-semibold text-foreground mb-6">Account Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground text-sm">Email Verified</span>
                <Badge
                  variant={profile.is_verified ? 'success' : 'neutral'}
                >
                  {profile.is_verified ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground text-sm">Account Created</span>
                <span className="text-foreground text-sm font-medium">
                  {formatDate(profile.created_at)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Last Updated</span>
                <span className="text-foreground text-sm font-medium">
                  {formatDate(profile.updated_at)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

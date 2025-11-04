import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FaTwitter, FaDiscord, FaTelegram, FaGithub, FaUser, FaLock, FaCog } from 'react-icons/fa';
import SEO from '../components/SEO';

const ProfilePage = () => {
  const { user, loading, error, updateProfile, updatePassword } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    socialAccounts: {
      twitter: user?.socialAccounts?.twitter || '',
      discord: user?.socialAccounts?.discord || '',
      telegram: user?.socialAccounts?.telegram || '',
      github: user?.socialAccounts?.github || '',
    },
    preferences: {
      emailNotifications: user?.preferences?.emailNotifications !== false, // Default to true
      darkMode: user?.preferences?.darkMode || false,
    },
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        displayName: user.displayName || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        socialAccounts: {
          twitter: user.socialAccounts?.twitter || '',
          discord: user.socialAccounts?.discord || '',
          telegram: user.socialAccounts?.telegram || '',
          github: user.socialAccounts?.github || '',
        },
        preferences: {
          emailNotifications: user.preferences?.emailNotifications !== false, // Default to true
          darkMode: user.preferences?.darkMode || false,
        },
      });
    }
  }, [user]);
  
  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (socialAccounts, preferences)
      const [parent, child] = name.split('.');
      setProfileForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      // Handle top-level properties
      setProfileForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };
  
  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setProfileSubmitting(true);
    
    try {
      await updateProfile(profileForm);
      toast.show({
        title: 'Success',
        message: 'Profile updated successfully',
        type: 'success',
      });
    } catch (err) {
      setFormError(err.message);
      toast.show({
        title: 'Error',
        message: err.message,
        type: 'error',
      });
    } finally {
      setProfileSubmitting(false);
    }
  };
  
  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    setPasswordSubmitting(true);
    
    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast.show({
        title: 'Success',
        message: 'Password updated successfully',
        type: 'success',
      });
    } catch (err) {
      setFormError(err.message);
      toast.show({
        title: 'Error',
        message: err.message,
        type: 'error',
      });
    } finally {
      setPasswordSubmitting(false);
    }
  };
  
  // Redirect if not logged in
  if (!user) {
    return navigate('/login');
  }
  
  return (
    <>
      <SEO
        title="My Profile | Airdrops.geo"
        description="Manage your profile settings, connect social accounts, and customize your experience on Airdrops.geo."
        canonicalUrl="/profile"
      />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--macos-text)] mb-6">My Profile</h1>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Profile
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'security'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('security')}
          >
            <FaLock /> Security
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'preferences'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('preferences')}
          >
            <FaCog /> Preferences
          </button>
        </div>
        
        {/* Error message */}
        {formError && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {formError}
          </div>
        )}
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-[var(--macos-text)]">Basic Information</h2>
                  
                  {/* Avatar */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[var(--macos-text-secondary)] mb-1">
                      Profile Picture
                    </label>
                    <div className="flex items-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-4">
                        {profileForm.avatar ? (
                          <img
                            src={profileForm.avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/80?text=Avatar';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FaUser size={32} />
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          name="avatar"
                          value={profileForm.avatar}
                          onChange={handleProfileChange}
                          placeholder="Enter image URL"
                          className="macos-input w-full text-sm"
                        />
                        <p className="text-xs text-[var(--macos-text-secondary)] mt-1">
                          Enter a URL to your profile picture
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Display Name */}
                  <div className="mb-4">
                    <label htmlFor="displayName" className="block text-sm font-medium text-[var(--macos-text-secondary)] mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={profileForm.displayName}
                      onChange={handleProfileChange}
                      placeholder="How you want to be known"
                      className="macos-input w-full text-sm"
                    />
                  </div>
                  
                  {/* Bio */}
                  <div className="mb-4">
                    <label htmlFor="bio" className="block text-sm font-medium text-[var(--macos-text-secondary)] mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell us about yourself"
                      rows="4"
                      className="macos-input w-full text-sm"
                      maxLength="500"
                    ></textarea>
                    <p className="text-xs text-[var(--macos-text-secondary)] mt-1">
                      {profileForm.bio.length}/500 characters
                    </p>
                  </div>
                </div>
                
                {/* Right column */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-[var(--macos-text)]">Social Accounts</h2>
                  
                  {/* Twitter */}
                  <div className="mb-4">
                    <label htmlFor="twitter" className="block text-sm font-medium text-[var(--macos-text-secondary)] mb-1">
                      <div className="flex items-center">
                        <FaTwitter className="mr-2 text-blue-400" />
                        Twitter
                      </div>
                    </label>
                    <input
                      type="text"
                      id="twitter"
                      name="socialAccounts.twitter"
                      value={profileForm.socialAccounts.twitter}
                      onChange={handleProfileChange}
                      placeholder="Your Twitter username"
                      className="macos-input w-full text-sm"
                    />
                  </div>
                  
                  {/* Discord */}
                  <div className="mb-4">
                    <label htmlFor="discord" className="block text-sm font-medium text-[var(--macos-text-secondary)] mb-1">
                      <div className="flex items-center">
                        <FaDiscord className="mr-2 text-indigo-500" />
                        Discord
                      </div>
                    </label>
                    <input
                      type="text"
                      id="discord"
                      name="socialAccounts.discord"
                      value={profileForm.socialAccounts.discord}
                      onChange={handleProfileChange}
                      placeholder="Your Discord username"
                      className="macos-input w-full text-sm"
                    />
                  </div>
                  
                  {/* Telegram */}
                  <div className="mb-4">
                    <label htmlFor="telegram" className="block text-sm font-medium text-[var(--macos-text-secondary)] mb-1">
                      <div className="flex items-center">
                        <FaTelegram className="mr-2 text-blue-500" />
                        Telegram
                      </div>
                    </label>
                    <input
                      type="text"
                      id="telegram"
                      name="socialAccounts.telegram"
                      value={profileForm.socialAccounts.telegram}
                      onChange={handleProfileChange}
                      placeholder="Your Telegram username"
                      className="macos-input w-full text-sm"
                    />
                  </div>
                  
                  {/* GitHub */}
                  <div className="mb-4">
                    <label htmlFor="github" className="block text-sm font-medium text-[var(--macos-text-secondary)] mb-1">
                      <div className="flex items-center">
                        <FaGithub className="mr-2 text-gray-700 dark:text-gray-300" />
                        GitHub
                      </div>
                    </label>
                    <input
                      type="text"
                      id="github"
                      name="socialAccounts.github"
                      value={profileForm.socialAccounts.github}
                      onChange={handleProfileChange}
                      placeholder="Your GitHub username"
                      className="macos-input w-full text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  disabled={profileSubmitting}
                >
                  {profileSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-[var(--macos-text)]">Change Password</h2>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="max-w-md">
                {/* Current Password */}
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-[var(--macos-text-secondary)] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="macos-input w-full text-sm"
                  />
                </div>
                
                {/* New Password */}
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-[var(--macos-text-secondary)] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                    className="macos-input w-full text-sm"
                  />
                  <p className="text-xs text-[var(--macos-text-secondary)] mt-1">
                    Password must be at least 6 characters
                  </p>
                </div>
                
                {/* Confirm Password */}
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--macos-text-secondary)] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="macos-input w-full text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  disabled={passwordSubmitting}
                >
                  {passwordSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-[var(--macos-text)]">Preferences</h2>
            
            <form onSubmit={handleProfileSubmit}>
              <div className="max-w-md">
                {/* Email Notifications */}
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferences.emailNotifications"
                      checked={profileForm.preferences.emailNotifications}
                      onChange={handleProfileChange}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-sm text-[var(--macos-text)]">
                      Receive email notifications
                    </span>
                  </label>
                  <p className="text-xs text-[var(--macos-text-secondary)] mt-1 ml-7">
                    Get notified about important updates and new airdrops
                  </p>
                </div>
                
                {/* Dark Mode */}
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferences.darkMode"
                      checked={profileForm.preferences.darkMode}
                      onChange={handleProfileChange}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-sm text-[var(--macos-text)]">
                      Dark Mode
                    </span>
                  </label>
                  <p className="text-xs text-[var(--macos-text-secondary)] mt-1 ml-7">
                    Use dark theme by default
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  disabled={profileSubmitting}
                >
                  {profileSubmitting ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;

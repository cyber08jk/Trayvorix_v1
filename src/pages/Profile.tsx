import { useState, useEffect, useRef } from 'react';
import { getUserProfile, updateUserProfile, uploadAvatar } from '../services/profile';
import { addLog } from '../services/logs';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { useAuth, useRole } from '@hooks/useAuth';
import { useToast } from '@components/common/Toast';
import { useCurrency } from '@contexts/CurrencyContext';
import { LogView } from '@components/common/LogView';

interface PersonalInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    jobTitle: string;
    bio: string;
    currency: string;
    location: string;
    avatar_url?: string;
}


interface SecurityInfo {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface Preferences {
    emailNotifications: boolean;
    desktopNotifications: boolean;
    language: string;
    timezone: string;
}

export function Profile() {
    const { user, updatePassword, refreshProfile } = useAuth();
    const { role } = useRole();
    const toast = useToast();
    const { setCurrency: setGlobalCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'preferences'>('personal');
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('system');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helper function for toast
    const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        if (toast?.showToast) {
            toast.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    };


    // Initialize theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme === 'dark') {
            setCurrentTheme('dark');
            document.documentElement.classList.add('dark');
        } else if (savedTheme === 'light') {
            setCurrentTheme('light');
            document.documentElement.classList.remove('dark');
        } else {
            setCurrentTheme('system');
            // Apply system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, []);

    // Personal Information State
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        firstName: 'User',
        lastName: '',
        email: user?.email || '',
        phone: '',
        jobTitle: 'Inventory Manager',
        bio: 'Experienced inventory manager with a focus on supply chain optimization.',
        currency: '',
        location: '',
        avatar_url: '',
    });
    // Fetch currency and location from Supabase on mount
    useEffect(() => {
        // Try localStorage first
        const savedCurrency = localStorage.getItem('userCurrency');
        const savedLocation = localStorage.getItem('userLocation');

        if (user?.id) {
            getUserProfile(user.id)
                .then((data) => {
                    setPersonalInfo((prev) => ({
                        ...prev,
                        currency: data?.currency || savedCurrency || 'USD',
                        location: data?.location || savedLocation || 'India',
                        avatar_url: data?.avatar_url || '',
                    }));
                })
                .catch(() => {
                    // Fallback to localStorage or defaults
                    setPersonalInfo((prev) => ({
                        ...prev,
                        currency: savedCurrency || 'USD',
                        location: savedLocation || 'India'
                    }));
                });
        } else {
            // Demo mode - use localStorage
            setPersonalInfo((prev) => ({
                ...prev,
                currency: savedCurrency || 'USD',
                location: savedLocation || 'India'
            }));
        }
    }, [user]);


    // Security State
    const [securityInfo, setSecurityInfo] = useState<SecurityInfo>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Preferences State
    const [preferences, setPreferences] = useState<Preferences>({
        emailNotifications: true,
        desktopNotifications: false,
        language: 'English (US)',
        timezone: 'India Standard Time (IST)',
    });

    // Load saved data on mount
    useEffect(() => {
        const savedProfile = localStorage.getItem('userProfile');
        const savedPreferences = localStorage.getItem('userPreferences');

        if (savedProfile) {
            try {
                setPersonalInfo(prev => ({ ...prev, ...JSON.parse(savedProfile) }));
            } catch (e) {
                console.error('Error parsing saved profile:', e);
            }
        }
        if (savedPreferences) {
            try {
                setPreferences(JSON.parse(savedPreferences));
            } catch (e) {
                console.error('Error parsing saved preferences:', e);
            }
        }


        // Update email from user if available
        if (user?.email) {
            setPersonalInfo(prev => ({ ...prev, email: user.email || '' }));
        }
    }, [user]);

    // Handle Personal Info Save
    const handleSavePersonalInfo = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            // In a real app we would save to Supabase here if not handled by individual field updates
            // But preserving existing demo logic:
            localStorage.setItem('userProfile', JSON.stringify(personalInfo));

            // Also update Supabase if user exists (except currency/location which are handled inline)
            if (user?.id) {
                // For now just basic fields if we wanted to sync them
            }

            showToast('Personal information updated successfully!', 'success');
        } catch {
            showToast('Failed to update personal information', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Handle Avatar Upload
    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            showToast('Image size must be less than 2MB', 'error');
            return;
        }

        if (!user?.id) {
            showToast('Cannot upload avatar in demo mode', 'info');
            return;
        }

        setUploadingAvatar(true);
        try {
            // Upload to storage
            const publicUrl = await uploadAvatar(user.id, file);

            // Update profile record
            await updateUserProfile(user.id, { avatar_url: publicUrl });

            // Update state
            setPersonalInfo(prev => ({ ...prev, avatar_url: publicUrl }));

            // Refresh global profile context
            await refreshProfile();

            showToast('Profile picture updated!', 'success');
        } catch (error: any) {
            console.error('Avatar upload error:', error);
            showToast(error.message || 'Failed to upload image', 'error');
        } finally {
            setUploadingAvatar(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Handle Password Update
    const handleUpdatePassword = async () => {
        if (!securityInfo.currentPassword) {
            showToast('Please enter your current password', 'error');
            return;
        }
        if (securityInfo.newPassword.length < 6) {
            showToast('New password must be at least 6 characters', 'error');
            return;
        }
        if (securityInfo.newPassword !== securityInfo.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        setSaving(true);
        try {
            if (updatePassword) {
                const { error } = await updatePassword(securityInfo.newPassword);
                if (error) {
                    showToast(error.message || 'Failed to update password', 'error');
                } else {
                    showToast('Password updated successfully!', 'success');
                    setSecurityInfo({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }
            } else {
                // Demo mode - just simulate success
                await new Promise(resolve => setTimeout(resolve, 800));
                showToast('Password updated successfully!', 'success');
                setSecurityInfo({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch {
            showToast('Failed to update password', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Handle 2FA Toggle
    const handleToggle2FA = () => {
        setTwoFactorEnabled(!twoFactorEnabled);
        showToast(
            twoFactorEnabled ? 'Two-factor authentication disabled' : 'Two-factor authentication enabled',
            'success'
        );
    };

    // Handle Preferences Save
    const handleSavePreferences = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            localStorage.setItem('userPreferences', JSON.stringify(preferences));
            showToast('Preferences saved successfully!', 'success');
        } catch {
            showToast('Failed to save preferences', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Handle Theme Change
    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        setCurrentTheme(theme);

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else if (theme === 'light') {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.removeItem('theme');
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
        showToast(`Theme changed to ${theme}`, 'success');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    My Profile
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar / Tabs */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <Card>
                        <div className="flex flex-col items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                />
                                {personalInfo.avatar_url ? (
                                    <img
                                        src={personalInfo.avatar_url}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-transparent group-hover:border-indigo-500 transition-all"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg group-hover:shadow-xl transition-all">
                                        {personalInfo.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}

                                {/* Overlay for hover */}
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity mb-4">
                                    {uploadingAvatar ? (
                                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                                {personalInfo.firstName} {personalInfo.lastName}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                {role || 'Operator'}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {user?.email}
                            </p>
                        </div>
                        <nav className="p-2 space-y-1">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'personal'
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Personal Information
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'security'
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Security
                            </button>
                            <button
                                onClick={() => setActiveTab('preferences')}
                                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'preferences'
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Preferences
                            </button>
                        </nav>
                    </Card>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <Card>
                        {/* Personal Information Tab */}
                        {activeTab === 'personal' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Personal Information</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Update your personal details and contact information.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {/* Currency Field */}
                                    <div className="sm:col-span-2 flex items-center gap-3">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                                            <select
                                                value={personalInfo.currency}
                                                onChange={e => setPersonalInfo(prev => ({ ...prev, currency: e.target.value }))}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white transition-colors"
                                            >
                                                <option value="USD">USD - US Dollar</option>
                                                <option value="EUR">EUR - Euro</option>
                                                <option value="INR">INR - Indian Rupee</option>
                                                <option value="GBP">GBP - British Pound</option>
                                                <option value="JPY">JPY - Japanese Yen</option>
                                                <option value="CNY">CNY - Chinese Yuan</option>
                                                <option value="AUD">AUD - Australian Dollar</option>
                                                <option value="CAD">CAD - Canadian Dollar</option>
                                                <option value="SGD">SGD - Singapore Dollar</option>
                                                <option value="ZAR">ZAR - South African Rand</option>
                                            </select>
                                        </div>
                                        <Button
                                            variant="primary"
                                            onClick={async () => {
                                                if (!user?.id) {
                                                    // Demo mode - just save locally
                                                    setGlobalCurrency(personalInfo.currency);
                                                    showToast('Currency changed!', 'success');
                                                    return;
                                                }
                                                try {
                                                    await updateUserProfile(user.id, { currency: personalInfo.currency });
                                                    await addLog(user.id, 'Currency Change', `Currency set to ${personalInfo.currency}`);
                                                    setGlobalCurrency(personalInfo.currency);
                                                    showToast('Currency changed!', 'success');
                                                } catch (error: any) {
                                                    console.error('Currency update error:', error);
                                                    // Fallback to localStorage
                                                    setGlobalCurrency(personalInfo.currency);
                                                    showToast('Currency changed locally!', 'success');
                                                }
                                            }}
                                        >
                                            Change
                                        </Button>
                                    </div>
                                    {/* Location Field */}
                                    <div className="sm:col-span-2 flex items-center gap-3">
                                        <Input
                                            label="Location"
                                            value={personalInfo.location}
                                            onChange={(e) => setPersonalInfo(prev => ({ ...prev, location: e.target.value }))}
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="primary"
                                            onClick={async () => {
                                                if (!user?.id) {
                                                    // Demo mode - just save locally
                                                    localStorage.setItem('userLocation', personalInfo.location);
                                                    showToast('Location changed!', 'success');
                                                    return;
                                                }
                                                try {
                                                    await updateUserProfile(user.id, { location: personalInfo.location });
                                                    await addLog(user.id, 'Location Change', `Location set to ${personalInfo.location}`);
                                                    localStorage.setItem('userLocation', personalInfo.location);
                                                    showToast('Location changed!', 'success');
                                                } catch (error: any) {
                                                    console.error('Location update error:', error);
                                                    // Fallback to localStorage
                                                    localStorage.setItem('userLocation', personalInfo.location);
                                                    showToast('Location changed locally!', 'success');
                                                }
                                            }}
                                        >
                                            Change
                                        </Button>
                                    </div>
                                    <Input
                                        label="First Name"
                                        value={personalInfo.firstName}
                                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                                    />
                                    <Input
                                        label="Last Name"
                                        value={personalInfo.lastName}
                                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                                    />
                                    <Input
                                        label="Email Address"
                                        value={personalInfo.email}
                                        disabled
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={personalInfo.phone}
                                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="+91 98765 43210"
                                    />
                                    <div className="sm:col-span-2">
                                        <Input
                                            label="Job Title"
                                            value={personalInfo.jobTitle}
                                            onChange={(e) => setPersonalInfo(prev => ({ ...prev, jobTitle: e.target.value }))}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Bio
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={personalInfo.bio}
                                            onChange={(e) => setPersonalInfo(prev => ({ ...prev, bio: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setPersonalInfo({
                                                firstName: 'User',
                                                lastName: '',
                                                email: user?.email || '',
                                                phone: '',
                                                jobTitle: 'Inventory Manager',
                                                bio: '',
                                                currency: 'USD',
                                                location: 'India',
                                                avatar_url: '',
                                            });
                                            showToast('Form reset to defaults', 'info');
                                        }}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleSavePersonalInfo}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security Settings</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Manage your password and security preferences.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <Input
                                        label="Current Password"
                                        type="password"
                                        value={securityInfo.currentPassword}
                                        onChange={(e) => setSecurityInfo(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        placeholder="Enter current password"
                                    />
                                    <Input
                                        label="New Password"
                                        type="password"
                                        value={securityInfo.newPassword}
                                        onChange={(e) => setSecurityInfo(prev => ({ ...prev, newPassword: e.target.value }))}
                                        placeholder="Enter new password (min 6 characters)"
                                    />
                                    <Input
                                        label="Confirm New Password"
                                        type="password"
                                        value={securityInfo.confirmPassword}
                                        onChange={(e) => setSecurityInfo(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        placeholder="Confirm new password"
                                    />
                                    {securityInfo.newPassword && securityInfo.confirmPassword &&
                                        securityInfo.newPassword !== securityInfo.confirmPassword && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                Passwords do not match
                                            </p>
                                        )}
                                    {securityInfo.newPassword && securityInfo.newPassword.length < 6 && (
                                        <p className="text-sm text-amber-500 flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Password must be at least 6 characters
                                        </p>
                                    )}
                                </div>
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h4>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Protect your account with 2FA security.
                                            </p>
                                            <p className={`text-xs mt-1 ${twoFactorEnabled ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {twoFactorEnabled ? '✓ Currently enabled' : '○ Currently disabled'}
                                            </p>
                                        </div>
                                        <Button
                                            variant={twoFactorEnabled ? "danger" : "secondary"}
                                            onClick={handleToggle2FA}
                                        >
                                            {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                                        </Button>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Active Sessions</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Current Session</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Windows • Chrome • Active now</p>
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full">
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        variant="primary"
                                        onClick={handleUpdatePassword}
                                        disabled={saving || !securityInfo.currentPassword || !securityInfo.newPassword || securityInfo.newPassword !== securityInfo.confirmPassword}
                                    >
                                        {saving ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">App Preferences</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Customize your experience.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {/* Email Notifications Toggle */}
                                    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Receive emails about account activity</p>
                                        </div>
                                        <button
                                            onClick={() => setPreferences(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.emailNotifications ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Desktop Notifications Toggle */}
                                    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Desktop Notifications</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Get push notifications on your device</p>
                                        </div>
                                        <button
                                            onClick={() => setPreferences(prev => ({ ...prev, desktopNotifications: !prev.desktopNotifications }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.desktopNotifications ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${preferences.desktopNotifications ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Language Select */}
                                    <div className="py-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Language
                                        </label>
                                        <select
                                            value={preferences.language}
                                            onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                                            className="block w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white transition-colors"
                                        >
                                            <option value="English (US)">English (US)</option>
                                            <option value="Hindi">Hindi</option>
                                            <option value="Spanish">Spanish</option>
                                            <option value="French">French</option>
                                            <option value="German">German</option>
                                            <option value="Japanese">Japanese</option>
                                        </select>
                                    </div>

                                    {/* Timezone Select */}
                                    <div className="py-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Timezone
                                        </label>
                                        <select
                                            value={preferences.timezone}
                                            onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                                            className="block w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white transition-colors"
                                        >
                                            <option value="India Standard Time (IST)">India Standard Time (IST)</option>
                                            <option value="Pacific Time (PT)">Pacific Time (PT)</option>
                                            <option value="Eastern Time (ET)">Eastern Time (ET)</option>
                                            <option value="Greenwich Mean Time (GMT)">Greenwich Mean Time (GMT)</option>
                                            <option value="Central European Time (CET)">Central European Time (CET)</option>
                                            <option value="Japan Standard Time (JST)">Japan Standard Time (JST)</option>
                                        </select>
                                    </div>

                                    {/* Theme Section */}
                                    <div className="py-4 border-t border-gray-200 dark:border-gray-700">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Theme
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                className={`p-4 border-2 rounded-lg text-center transition-all ${currentTheme === 'light'
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500 ring-offset-2'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 bg-white dark:bg-gray-800'
                                                    }`}
                                                onClick={() => handleThemeChange('light')}
                                            >
                                                <svg className="w-6 h-6 mx-auto text-yellow-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                                </svg>
                                                <span className={`text-sm font-medium ${currentTheme === 'light' ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300'}`}>Light</span>
                                            </button>
                                            <button
                                                className={`p-4 border-2 rounded-lg text-center transition-all ${currentTheme === 'dark'
                                                    ? 'border-indigo-500 bg-gray-800 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 bg-gray-800'
                                                    }`}
                                                onClick={() => handleThemeChange('dark')}
                                            >
                                                <svg className="w-6 h-6 mx-auto text-indigo-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                                </svg>
                                                <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-indigo-400' : 'text-gray-300'}`}>Dark</span>
                                            </button>
                                            <button
                                                className={`p-4 border-2 rounded-lg text-center transition-all ${currentTheme === 'system'
                                                    ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                                                    } bg-gradient-to-r from-white to-gray-700`}
                                                onClick={() => handleThemeChange('system')}
                                            >
                                                <svg className="w-6 h-6 mx-auto text-gray-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.321A1 1 0 0113.22 17H6.78a1 1 0 01-.39-1.922l.804-.32.122-.49H5a2 2 0 01-2-2V5zm12 0H5v8h10V5z" clipRule="evenodd" />
                                                </svg>
                                                <span className={`text-sm font-medium ${currentTheme === 'system' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>System</span>
                                            </button>
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            Current: <span className="font-medium capitalize">{currentTheme}</span> mode
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setPreferences({
                                                emailNotifications: true,
                                                desktopNotifications: false,
                                                language: 'English (US)',
                                                timezone: 'India Standard Time (IST)',
                                            });
                                            showToast('Preferences reset to defaults', 'info');
                                        }}
                                    >
                                        Reset to Default
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleSavePreferences}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Preferences'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
            <LogView />
        </div>
    );
}

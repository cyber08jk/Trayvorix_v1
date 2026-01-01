import { Button } from '@components/common/Button';
import { Card } from '@components/common/Card';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function Settings() {
    const { theme, toggleTheme } = useTheme();
    const { user, userRole } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Manage your application preferences and system configurations
                </p>
            </div>

            {/* Appearance */}
            <Card title="Appearance" subtitle="Customize how Trayvorix looks on your device">
                <div className="flex items-center justify-between py-2">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Theme</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Toggle between Light and Dark mode
                        </p>
                    </div>
                    <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 cursor-pointer" onClick={toggleTheme}>
                        <button
                            className={`p-1.5 rounded-full transition-all duration-200 ${theme === 'light' ? 'bg-white text-yellow-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </button>
                        <button
                            className={`p-1.5 rounded-full transition-all duration-200 ${theme === 'dark' ? 'bg-gray-600 text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </Card>

            {/* Account Settings */}
            <Card title="Account" subtitle="Manage your profile and security">
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Profile Information</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Update your name, avatar, and contact details
                            </p>
                        </div>
                        <Button variant="secondary" onClick={() => navigate('/profile')}>
                            Edit Profile
                        </Button>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Address</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user?.email}
                            </p>
                        </div>
                        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                            Verified
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Current Role</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Your access level in the system
                            </p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 capitalize">
                            {userRole}
                        </span>
                    </div>
                </div>
            </Card>

            {/* About */}
            <div className="flex justify-center pt-8">
                <p className="text-xs text-gray-400 dark:text-gray-600">
                    Trayvorix v1.0.0 • Build 20241226
                </p>
            </div>
        </div>
    );
}

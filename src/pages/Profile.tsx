import { useState } from 'react';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { useAuth, useRole } from '@hooks/useAuth';

export function Profile() {
    const { user } = useAuth();
    const { role } = useRole();
    const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'preferences'>('personal');

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
                            <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl font-bold mb-4">
                                {user?.email?.[0].toUpperCase() || 'U'}
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {user?.email?.split('@')[0] || 'User'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                {role || 'Operator'}
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
                        {activeTab === 'personal' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Personal Information</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Update your personal details and contact information.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <Input label="First Name" defaultValue="Param" />
                                    <Input label="Last Name" defaultValue="Singh" />
                                    <Input label="Email Address" defaultValue={user?.email || ''} disabled />
                                    <Input label="Phone Number" defaultValue="+91 98765 43210" />
                                    <div className="sm:col-span-2">
                                        <Input label="Job Title" defaultValue="Senior Inventory Manager" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Bio
                                        </label>
                                        <textarea
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                            defaultValue="Experienced inventory manager with a focus on supply chain optimization and warehouse efficiency."
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button variant="primary">Save Changes</Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security Settings</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Manage your password and security preferences.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <Input label="Current Password" type="password" />
                                    <Input label="New Password" type="password" />
                                    <Input label="Confirm New Password" type="password" />
                                </div>
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h4>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">Protect your account with 2FA security.</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Currently disabled</p>
                                        </div>
                                        <Button variant="secondary">Enable 2FA</Button>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button variant="primary">Update Password</Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">App Preferences</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Customize your experience.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Receive emails about account activity</p>
                                        </div>
                                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                            <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400" />
                                            <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer checked:bg-green-400"></label>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Desktop Notifications</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Get push notifications on your device</p>
                                        </div>
                                        <Button variant="secondary" size="sm">Configure</Button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Language
                                        </label>
                                        <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                            <option>English (US)</option>
                                            <option>Hindi</option>
                                            <option>Spanish</option>
                                            <option>French</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Timezone
                                        </label>
                                        <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                            <option>India Standard Time (IST)</option>
                                            <option>Pacific Time (PT)</option>
                                            <option>Eastern Time (ET)</option>
                                            <option>Greenwich Mean Time (GMT)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button variant="primary">Save Preferences</Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

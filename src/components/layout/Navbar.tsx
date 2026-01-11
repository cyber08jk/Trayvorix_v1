import { useState, useEffect, useRef } from 'react';
import { getNotifications, Notification } from '../../services/notifications';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@contexts/ThemeContext';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, signOut, userRole, profile } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (showNotifications && user?.id) {
      setLoadingNotifications(true);
      getNotifications(user.id)
        .then(setNotifications)
        .catch(() => setNotifications([]))
        .finally(() => setLoadingNotifications(false));
    }
  }, [showNotifications, user]);
  /* replaced with useTheme */
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';
  const toggleDarkMode = toggleTheme;

  /*
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme preference or use system preference
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  */

  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    // Close menu on route change
    setShowUserMenu(false);

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location]);

  // Handle dark mode toggle
  /*
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  */

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    } else if (e.key === 'Escape' && showUserMenu) {
      setShowUserMenu(false);
    }
  };

  const handleSignOutClick = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <nav
      className="fixed top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-200"
      aria-label="Main navigation"
    >
      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 text-gray-600 dark:text-gray-300 rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
              aria-label="Toggle menu"
              aria-expanded={false}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link
              to="/dashboard"
              className="flex items-center ml-2 lg:ml-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 rounded-md"
              aria-label="Trayvorix Home"
            >
              <div className="flex items-center justify-center transition-all duration-300">
                <img src="/logo.png" alt="Trayvorix Logo" className="w-10 h-10" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                Trayvorix
              </span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              onKeyDown={(e) => handleKeyDown(e, toggleDarkMode)}
              className="p-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              )}
            </button>


            {/* Notifications */}
            <div className="relative">
              <button
                className="p-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
                aria-label="View notifications"
                onClick={() => setShowNotifications((v) => !v)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <span className="sr-only">View notifications</span>
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                )}
              </button>
              {/* Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">Notifications</div>
                  {loadingNotifications ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications</div>
                  ) : (
                    <ul>
                      {notifications.map((notif) => (
                        <li key={notif.id} className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 ${notif.read ? '' : 'bg-indigo-50 dark:bg-gray-900'}`}>
                          <div className="font-medium text-gray-800 dark:text-gray-100">{notif.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">{notif.message}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(notif.created_at).toLocaleString()}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                onKeyDown={(e) => handleKeyDown(e, () => setShowUserMenu(!showUserMenu))}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
                id="user-menu-button"
              >
                {/* User Avatar */}
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="User avatar"
                    className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-gray-100 dark:ring-gray-700"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'D'}
                  </div>
                )}
                <span className="sr-only">Open user menu</span>
              </button>

              {/* User Dropdown Menu */}
              <div
                className={`absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none transition-all duration-200 transform origin-top-right ${showUserMenu ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabIndex={-1}
              >
                {/* User Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    {/* Large Avatar */}
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="User"
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
                        {user?.email || 'demo@trayvorix.com'}
                      </p>
                      <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 capitalize border border-indigo-100 dark:border-indigo-800">
                        {userRole || 'Demo User'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2 space-y-1">
                  <Link
                    to={location.pathname.startsWith('/demo') ? '/demo-profile' : '/profile'}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors group"
                    onClick={() => setShowUserMenu(false)}
                    role="menuitem"
                    tabIndex={-1}
                  >
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors shadow-sm">
                      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    Profile Settings
                  </Link>

                  <button
                    onClick={handleSignOutClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors group"
                    role="menuitem"
                    tabIndex={-1}
                  >
                    <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-md group-hover:bg-white dark:group-hover:bg-red-900/30 transition-colors shadow-sm">
                      <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

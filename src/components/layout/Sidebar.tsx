import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  path?: string;
  icon: React.ReactNode;
  children?: NavItem[];
}



export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Operations']);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Check if we're in demo mode
  const isDemoMode = location.pathname.startsWith('/demo');

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      onClose();
    }
  }, [location.pathname, isMobile, isOpen, onClose]);

  // Update mobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        onClose();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onClose]);

  const toggleMenu = (menuName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(m => m !== menuName)
        : [...prev, menuName]
    );
  };

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: isDemoMode ? '/demo-dashboard' : '/dashboard',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
    },
    {
      name: 'Products',
      path: isDemoMode ? '/demo-products' : '/products',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'Operations',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
      children: [
        {
          name: 'Receipts',
          path: isDemoMode ? '/demo-receipts' : '/receipts',
          icon: <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
        },
        {
          name: 'Deliveries',
          path: isDemoMode ? '/demo-deliveries' : '/deliveries',
          icon: <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" /></svg>
        },
        {
          name: 'Invoices',
          path: isDemoMode ? '/demo-invoices' : '/invoices',
          icon: <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
        },
        {
          name: 'Adjustments',
          path: isDemoMode ? '/demo-adjustments' : '/adjustments',
          icon: <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
        },
        {
          name: 'Move History',
          path: isDemoMode ? '/demo-movements' : '/movements',
          icon: <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" /></svg>
        },
      ],
    },
    {
      name: 'Warehouses',
      path: isDemoMode ? '/demo-warehouses' : '/warehouses',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'Analytics',
      path: isDemoMode ? '/demo-analytics' : '/analytics',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
    },
  ];

  const renderNavItem = (item: NavItem, isChild = false, depth = 0) => {
    if (item.children) {
      const isExpanded = expandedMenus.includes(item.name);
      return (
        <li key={item.name} className="relative">
          <button
            onClick={(e) => toggleMenu(item.name, e)}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-colors ${isExpanded
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            aria-expanded={isExpanded}
            aria-controls={`submenu-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex items-center space-x-3">
              <span className={`transition-colors ${isExpanded ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div
            id={`submenu-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            className={`transition-all duration-200 overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}
            role="region"
            aria-label={`${item.name} submenu`}
          >
            <ul className="mt-1 ml-4 pl-3 space-y-1 border-l-2 border-gray-200 dark:border-gray-700">
              {item.children.map((child) => renderNavItem(child, true, depth + 1))}
            </ul>
          </div>
        </li>
      );
    }

    return (
      <li key={item.path}>
        <NavLink
          to={item.path!}
          onClick={onClose}
          className={({ isActive }) =>
            `group flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${isChild ? 'text-sm' : ''
            } ${isActive
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`
          }
          aria-current={location.pathname === item.path ? 'page' : undefined}
        >
          {({ isActive }) => (
            <>
              <span className={`transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <span className="absolute right-4 w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" aria-hidden="true" />
              )}
            </>
          )}
        </NavLink>
      </li>
    );
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={`fixed top-0 left-0 z-40 w-72 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:top-16 lg:h-[calc(100vh-4rem)]`}
        aria-label="Sidebar"
      >
        <div className="h-full px-4 py-4 overflow-y-auto">
          <nav>
            <ul className="space-y-1.5">
              {navItems.map((item) => renderNavItem(item))}
            </ul>

            {/* Admin Section - Only visible for admin users */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <p className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Admin
              </p>
              <NavLink
                to="/access-requests"
                className={({ isActive }) =>
                  `group flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
                onClick={onClose}
              >
                {({ isActive }) => (
                  <>
                    <svg
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                        }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <span className="font-medium">Access Management</span>
                    {isActive && (
                      <span className="absolute right-4 w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" aria-hidden="true" />
                    )}
                  </>
                )}
              </NavLink>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <NavLink
                to={isDemoMode ? '/demo-profile' : '/profile'}
                className={({ isActive }) =>
                  `group flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
                onClick={onClose}
              >
                {({ isActive }) => (
                  <>
                    <svg
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                        }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">My Profile</span>
                    {isActive && (
                      <span className="absolute right-4 w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" aria-hidden="true" />
                    )}
                  </>
                )}
              </NavLink>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}

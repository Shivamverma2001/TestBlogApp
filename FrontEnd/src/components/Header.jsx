import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSignOutAlt, FaTachometerAlt, FaNewspaper } from 'react-icons/fa';
import { authService } from '../services/api';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = authService.isAdmin();
  const isOnDashboard = location.pathname === '/admin';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <div 
              onClick={() => navigate('/')} 
              className="flex items-center flex-shrink-0 cursor-pointer"
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                BlogApp
              </span>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {isAdmin && (
              isOnDashboard ? (
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                >
                  <FaNewspaper className="mr-2" />
                  View Blog
                </button>
              ) : (
                <button
                  onClick={() => navigate('/admin')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                >
                  <FaTachometerAlt className="mr-2" />
                  Dashboard
                </button>
              )
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 
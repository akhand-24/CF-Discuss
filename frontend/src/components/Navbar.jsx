import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-red-600 tracking-tight">
              <span>CF-Discuss</span>
            </Link>
            <div className="hidden md:flex space-x-6 text-sm font-medium text-slate-600">
              <Link to="/" className="hover:text-red-600 transition-colors duration-200">
                Discussions
              </Link>
              <Link to="/contests" className="hover:text-red-600 transition-colors duration-200">
                Contests
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex md:hidden space-x-3 text-sm font-medium text-slate-600 mr-2">
              <Link to="/" className="hover:text-red-600 transition-colors">
                Discussions
              </Link>
              <Link to="/contests" className="hover:text-red-600 transition-colors">
                Contests
              </Link>
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-sm font-semibold text-slate-800">{user.username}</span>
                  <span className="text-xs text-red-500 font-mono">@{user.cfHandle}</span>
                </div>
                <Link
                  to="/ask"
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow transition-colors duration-200"
                >
                  Ask Question
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-600 rounded-md transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-red-600 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

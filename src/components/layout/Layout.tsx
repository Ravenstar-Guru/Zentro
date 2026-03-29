import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Compass,
  User,
  MessageSquare,
  Users,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ZentroLogo } from './ZentroLogo';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/connections', icon: Users, label: 'Connections' },
  { path: '/requests', icon: MessageSquare, label: 'Requests', hasBadge: true },
  { path: '/profile', icon: User, label: 'Profile' },
];

export const Layout: React.FC = () => {
  const location = useLocation();
  const { currentUser, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-space-gradient flex flex-col relative overflow-hidden">
      {/* Ambient background particles/effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-glow-cyan/10 rounded-full blur-3xl float-animation"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-glow-purple/10 rounded-full blur-3xl float-animation delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-glow-pink/5 rounded-full blur-2xl float-animation delay-500"></div>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden glass fixed top-0 left-0 right-0 z-50 shadow-glow-cyan/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/home" onClick={() => setMobileMenuOpen(false)}>
            <ZentroLogo size={32} showText={false} />
          </Link>
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <Link to="/requests" className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5 text-glow-cyan" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-glow-pink rounded-full animate-pulse"></span>
            </Link>
            {/* Profile avatar */}
            <Link to="/profile">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-glow-cyan to-glow-purple flex items-center justify-center text-white text-xs font-bold border border-white/20">
                {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-space-200" />
              ) : (
                <Menu className="w-6 h-6 text-space-200" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/10 overflow-hidden"
            >
              <nav className="px-4 py-4 space-y-2">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'nav-link-active'
                          : 'nav-link-inactive'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {item.hasBadge && (
                        <span className="ml-auto w-5 h-5 bg-glow-pink rounded-full text-xs text-white flex items-center justify-center animate-pulse">
                          3
                        </span>
                      )}
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mt-4 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Desktop Layout */}
      <div className="flex flex-1 lg:flex-row relative z-10">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 glass border-r border-white/10 fixed h-full">
          <div className="p-6 border-b border-white/10">
            <Link to="/home">
              <ZentroLogo size={48} />
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link relative ${
                    isActive ? 'nav-link-active' : 'nav-link-inactive'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.hasBadge && (
                    <span className="ml-auto w-5 h-5 bg-glow-pink rounded-full text-xs text-white flex items-center justify-center animate-pulse">
                      3
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute left-0 w-1 h-8 bg-gradient-to-r from-glow-cyan to-glow-purple rounded-r-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-glow-cyan to-glow-purple flex items-center justify-center text-white font-bold text-sm border-2 border-white/20 shadow-glow-cyan/30">
                {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-space-200 truncate">
                  {currentUser?.displayName || 'User'}
                </p>
                <p className="text-xs text-space-400 truncate">
                  {currentUser?.college || 'No college set'}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all font-medium border border-transparent hover:border-red-500/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 relative z-10">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/10 z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-all ${
                  isActive
                    ? 'text-glow-cyan'
                    : 'text-space-500'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.hasBadge && (
                  <span className="absolute top-1 w-2 h-2 bg-glow-pink rounded-full animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ZentroLogo } from '../components/layout/ZentroLogo';
import { Button } from '../components/common/Button';

export const Login: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Failed to sign in:', err);
      // Show user-friendly error message
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Firebase Auth. Check Firebase console > Authentication > Authorized domains.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled. Please enable it in Firebase Console > Authentication > Sign-in method.');
      } else if (err.code?.includes('auth/')) {
        setError(`Authentication error: ${err.message}`);
      } else {
        setError('Failed to sign in. Please check your Firebase configuration and ensure Google Auth is enabled.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-space-gradient relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0
                ? 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)'
                : i % 3 === 1
                ? 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)'
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-glow-cyan/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-glow-purple/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10 max-w-md w-full px-4"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-glow-cyan to-glow-purple opacity-50 scale-110"></div>
            <ZentroLogo size={120} />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-space-100 mb-3 drop-shadow-glow-cyan"
        >
          Zentro
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-lg text-space-300 mb-10 max-w-md mx-auto"
        >
          Connect, learn, and grow together
        </motion.p>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-sm text-red-300 max-w-md shadow-glow-red/20 backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Google Sign In Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-4"
        >
          <Button
            variant="glow"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 text-lg gap-3"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <>
                {/* Google Icon */}
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-lg">Continue with Google</span>
              </>
            )}
          </Button>

          <p className="text-xs text-space-500 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>

        {/* Theme Toggle */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          onClick={toggleTheme}
          className="mt-8 p-3 rounded-full bg-space-900/50 hover:bg-space-800/50 border border-space-700/50 transition-all backdrop-blur-sm"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <svg className="w-6 h-6 text-glow-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-glow-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 text-space-500 text-sm relative z-10"
      >
        Connect with peers who share your skills
      </motion.p>
    </div>
  );
};

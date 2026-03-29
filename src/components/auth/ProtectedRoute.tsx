import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfileComplete?: boolean;
}

/**
 * Check if a user profile is complete
 * Required: college, city, phoneNumber, at least one skill in skillsHave and skillsWant, skillLevel, availability
 */
function isProfileComplete(user: User | null): boolean {
  if (!user) return false;

  const hasBasicInfo = user.college?.trim() && user.city?.trim() && user.phoneNumber?.trim();
  const hasSkills = user.skillsHave?.length > 0 && user.skillsWant?.length > 0;
  const hasPreferences = user.skillLevel && user.availability;

  return !!(hasBasicInfo && hasSkills && hasPreferences);
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireProfileComplete = true
}) => {
  const { currentUser, firebaseUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!firebaseUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireProfileComplete && !isProfileComplete(currentUser)) {
    // Redirect to onboarding if profile incomplete
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

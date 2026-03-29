import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { MapPin, Clock, ArrowRight, Bookmark, X } from 'lucide-react';
import { User } from '../../types';
import { RequestPopup } from '../requests/RequestPopup';
import { SKILL_ID_TO_NAME } from '../../utils/constants';

interface UserCardProps {
  user: User & { matchPercentage?: number };
  onConnect?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onConnect }) => {
  const [saved, setSaved] = useState(false);
  const [showRequestPopup, setShowRequestPopup] = useState(false);

  const getMatchColor = (percentage?: number): string => {
    if (percentage === undefined) return 'text-gray-600 dark:text-gray-400';
    if (percentage >= 70) return 'text-green-600 dark:text-green-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getMatchBg = (percentage?: number): string => {
    if (percentage === undefined) return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    if (percentage >= 70) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    if (percentage >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
  };

  const getAvailabilityColor = (availability: string): string => {
    switch (availability) {
      case 'part-time':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'full-time':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
      case 'weekends':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getSkillLevelColor = (level: string): string => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const handleConnect = () => {
    setShowRequestPopup(true);
  };

  const handleRequestSubmit = () => {
    setShowRequestPopup(false);
    if (onConnect) onConnect();
  };

  // Preview skills (show max 3)
  const previewSkillsHave = user.skillsHave.slice(0, 3);
  const previewSkillsWant = user.skillsWant.slice(0, 3);
  const remainingHave = user.skillsHave.length - 3;
  const remainingWant = user.skillsWant.length - 3;

  return (
    <>
      <Card hover className="h-full flex flex-col relative group">
        {/* Match percentage badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getMatchBg(user.matchPercentage)}`}>
            {user.matchPercentage !== undefined ? `${user.matchPercentage}%` : '?'}
          </span>
        </div>

        {/* Profile section */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex-shrink-0 overflow-hidden border-2 border-white dark:border-gray-700 shadow-md">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                {user.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
              {user.displayName}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="truncate">{user.college || 'No college'}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{user.area || user.city || 'Location not set'}</span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Teaches</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {previewSkillsHave.map(skillId => (
              <span
                key={skillId}
                className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 text-xs rounded-full"
              >
                {SKILL_ID_TO_NAME[skillId] || skillId.replace(/-/g, ' ')}
              </span>
            ))}
            {remainingHave > 0 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{remainingHave} more
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="w-3 h-3 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Wants</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {previewSkillsWant.map(skillId => (
              <span
                key={skillId}
                className="px-2 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-200 text-xs rounded-full"
              >
                {SKILL_ID_TO_NAME[skillId] || skillId.replace(/-/g, ' ')}
              </span>
            ))}
            {remainingWant > 0 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{remainingWant} more
              </span>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getSkillLevelColor(user.skillLevel)}`}>
            {user.skillLevel}
          </span>
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getAvailabilityColor(user.availability)}`}>
            {user.availability.replace('-', ' ')}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          <Button
            variant="primary"
            onClick={handleConnect}
            className="flex-1"
          >
            Connect
          </Button>
          <Button
            variant={saved ? 'primary' : 'secondary'}
            onClick={() => setSaved(!saved)}
            className="p-3"
            icon={<Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />}
          />
        </div>
      </Card>

      {/* Request Popup */}
      <RequestPopup
        isOpen={showRequestPopup}
        onClose={() => setShowRequestPopup(false)}
        toUserId={user.uid}
        toUserName={user.displayName}
        onSubmit={handleRequestSubmit}
      />
    </>
  );
};

export default UserCard;

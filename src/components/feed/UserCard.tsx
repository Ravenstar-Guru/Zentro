import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { MessageCircle } from 'lucide-react';
import { User } from '../../types';
import { RequestPopup } from '../requests/RequestPopup';
import { SKILL_ID_TO_NAME } from '../../utils/constants';

interface UserCardProps {
  user: User & { matchPercentage?: number };
  onConnect?: () => void;
  highlight?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onConnect, highlight = false }) => {
  const [saved, setSaved] = useState(false);
  const [showRequestPopup, setShowRequestPopup] = useState(false);

  const getMatchColor = (percentage?: number): string => {
    if (percentage === undefined) return 'text-space-400';
    if (percentage >= 70) return 'text-glow-green';
    if (percentage >= 50) return 'text-glow-amber';
    return 'text-red-400';
  };

  const getMatchBg = (percentage?: number): string => {
    if (percentage === undefined) return 'bg-space-800/50 text-space-400 border border-space-700/50';
    if (percentage >= 70) return 'bg-glow-green/20 text-glow-green border border-glow-green/30';
    if (percentage >= 50) return 'bg-glow-amber/20 text-glow-amber border border-glow-amber/30';
    return 'bg-red-500/20 text-red-400 border border-red-500/30';
  };

  const getAvailabilityColor = (availability: string): string => {
    switch (availability) {
      case 'part-time':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'full-time':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'weekends':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
      default:
        return 'bg-space-800/50 text-space-300 border border-space-700/50';
    }
  };

  const getSkillLevelColor = (level: string): string => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'advanced':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      default:
        return 'bg-space-800/50 text-space-300 border border-space-700/50';
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          hover
          className={`h-full flex flex-col relative group ${highlight ? 'border-glow-cyan/50 shadow-glow-cyan/20' : ''}`}
          glow={highlight}
        >
          {/* Match percentage badge */}
          <div className="absolute top-3 right-3 z-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`
                px-3 py-1 rounded-full text-sm font-bold shadow-lg
                ${getMatchBg(user.matchPercentage)}
              `}
            >
              {user.matchPercentage !== undefined ? `${user.matchPercentage}%` : '?'}
            </motion.div>
          </div>

          {/* Profile section */}
          <div className="flex items-start gap-3 mb-4">
            <div className="relative">
              <div className="avatar-ring w-16 h-16 rounded-full flex-shrink-0 overflow-hidden border-2 border-glow-cyan/50 shadow-glow-cyan/30">
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
                  <div className="w-full h-full flex items-center justify-center text-space-100 text-xl font-bold bg-gradient-to-br from-glow-cyan/30 to-glow-purple/30">
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              {highlight && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-glow-green rounded-full border-2 border-space-900 shadow-glow-green/50 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-space-100 text-lg truncate">
                {user.displayName}
              </h3>
              <div className="flex items-center gap-1 text-sm text-space-400 mb-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="truncate">{user.college || 'No college'}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-space-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{user.area || user.city || 'Location not set'}</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-space-400">Teaches</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {previewSkillsHave.map(skillId => (
                <span
                  key={skillId}
                  className="skill-teach px-2.5 py-1 text-xs rounded-full"
                >
                  {SKILL_ID_TO_NAME[skillId] || skillId.replace(/-/g, ' ')}
                </span>
              ))}
              {remainingHave > 0 && (
                <span className="px-2.5 py-1 bg-space-800/50 text-space-400 text-xs rounded-full">
                  +{remainingHave} more
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <svg className="w-3 h-3 text-space-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              <span className="text-xs font-medium text-space-400">Wants</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {previewSkillsWant.map(skillId => (
                <span
                  key={skillId}
                  className="skill-want px-2.5 py-1 text-xs rounded-full"
                >
                  {SKILL_ID_TO_NAME[skillId] || skillId.replace(/-/g, ' ')}
                </span>
              ))}
              {remainingWant > 0 && (
                <span className="px-2.5 py-1 bg-space-800/50 text-space-400 text-xs rounded-full">
                  +{remainingWant} more
                </span>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getSkillLevelColor(user.skillLevel)}`}>
              {user.skillLevel}
            </span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getAvailabilityColor(user.availability)}`}>
              {user.availability.replace('-', ' ')}
            </span>
          </div>

          {/* Actions */}
          <div className="mt-auto flex gap-2">
            <Button
              variant="glow"
              onClick={handleConnect}
              className="flex-1"
            >
              Connect
            </Button>
            <Button
              variant={saved ? 'primary' : 'secondary'}
              onClick={() => setSaved(!saved)}
              className="p-3"
              icon={
                <svg className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 19V5z" />
                </svg>
              }
            />
            <Button
              variant="ghost"
              className="p-3"
              icon={<MessageCircle className="w-4 h-4" />}
            />
          </div>
        </Card>
      </motion.div>

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

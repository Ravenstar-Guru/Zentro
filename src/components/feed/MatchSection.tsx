import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { UserCard } from './UserCard';
import { MatchResult } from '../../types';

interface MatchSectionProps {
  title: string;
  users: MatchResult[];
  onViewAll?: () => void;
  className?: string;
}

export const MatchSection: React.FC<MatchSectionProps> = ({
  title,
  users,
  onViewAll,
  className = ''
}) => {
  if (users.length === 0) return null;

  return (
    <section className={`mb-8 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        {onViewAll && users.length > 3 && (
          <button
            onClick={onViewAll}
            className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Horizontal Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-hide snap-x snap-mandatory">
        {users.map((user, index) => (
          <motion.div
            key={user.uid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-72 snap-start"
          >
            <UserCard user={user} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default MatchSection;

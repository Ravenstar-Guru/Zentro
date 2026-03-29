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
  highlight?: boolean;
}

export const MatchSection: React.FC<MatchSectionProps> = ({
  title,
  users,
  onViewAll,
  className = '',
  highlight = false
}) => {
  if (users.length === 0) return null;

  return (
    <section className={`${className} ${highlight ? 'relative' : ''}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <motion.h2
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`text-xl font-bold gradient-text-primary`}
        >
          {title}
        </motion.h2>
        {onViewAll && users.length > 3 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ x: 2 }}
            onClick={onViewAll}
            className="text-glow-cyan text-sm font-medium flex items-center gap-1 hover:text-glow-blue transition-all"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative">
        {/* Glow edges on scroll area */}
        <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-space-gradient to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-space-gradient to-transparent z-10 pointer-events-none"></div>

        {/* Horizontal Scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-glow snap-x snap-mandatory">
          {users.map((user, index) => (
            <motion.div
              key={user.uid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="flex-shrink-0 w-72 snap-start"
            >
              <UserCard user={user} highlight={highlight} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative accent for highlighted sections */}
      {highlight && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute -bottom-6 left-0 right-0 h-0.5 bg-gradient-to-r from-glow-cyan via-glow-purple to-glow-cyan rounded-full blur-sm"
        ></motion.div>
      )}
    </section>
  );
};

export default MatchSection;

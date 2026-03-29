import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { MatchSection } from '../components/feed/MatchSection';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Search, RefreshCw, Activity } from 'lucide-react';
import { SectionedMatches } from '../types';

export const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const { getMatches } = useData();
  const navigate = useNavigate();

  const [matches, setMatches] = useState<SectionedMatches | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMatches();
  }, [currentUser]);

  const loadMatches = async () => {
    if (!currentUser) return;

    try {
      const matchesData = await getMatches(currentUser);
      setMatches(matchesData);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
  };

  const totalMatches = useMemo(() => {
    if (!matches) return 0;
    return (
      matches.bestMatches.length +
      matches.sameCollege.length +
      matches.nearby.length +
      matches.exploreMore.length
    );
  }, [matches]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Card hover={false} className="overflow-hidden">
          <div className="animate-pulse">
            <div className="h-32 bg-space-800/50 rounded-2xl mb-4"></div>
            <div className="h-8 bg-space-800/50 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-space-800/50 rounded w-1/4"></div>
          </div>
        </Card>
        {[1, 2, 3].map(i => (
          <div key={i}>
            <div className="h-6 bg-space-800/50 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="flex gap-4">
              {[1, 2, 3].map(j => (
                <div key={j} className="flex-shrink-0 w-72 h-80 bg-space-800/50 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Card hover={false} className="text-center py-12">
        <p className="text-space-400">
          Please log in to view your matches.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Stats Section */}
      <Card hover={false} className="overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-glow-cyan/10 via-glow-purple/10 to-transparent"></div>
        <div className="relative p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-2"
              >
                <Activity className="w-5 h-5 text-glow-cyan" />
                <span className="text-sm font-medium text-glow-cyan uppercase tracking-wider">Dashboard</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl font-bold text-space-100 mb-2"
              >
                Your Smart Matches
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-space-300 text-lg"
              >
                {totalMatches} potential connections waiting for you
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4"
            >
              <div className="text-center p-4 bg-white/5 dark:bg-space-900/50 rounded-xl border border-white/10 backdrop-blur-sm">
                <p className="text-2xl font-bold gradient-text">{matches?.bestMatches.length || 0}</p>
                <p className="text-xs text-space-400 uppercase">Best</p>
              </div>
              <div className="text-center p-4 bg-white/5 dark:bg-space-900/50 rounded-xl border border-white/10 backdrop-blur-sm">
                <p className="text-2xl font-bold text-space-200">{matches?.sameCollege.length || 0}</p>
                <p className="text-xs text-space-400 uppercase">College</p>
              </div>
              <div className="text-center p-4 bg-white/5 dark:bg-space-900/50 rounded-xl border border-white/10 backdrop-blur-sm">
                <p className="text-2xl font-bold text-space-200">{matches?.nearby.length || 0}</p>
                <p className="text-xs text-space-400 uppercase">Nearby</p>
              </div>
            </motion.div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              loading={refreshing}
              icon={<RefreshCw className="w-4 h-4" />}
              className="backdrop-blur-sm"
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Search Bar - Quick Access */}
      <Card hover={false} className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-space-500" />
            <input
              type="text"
              placeholder="Search people, skills, or locations..."
              className="input-field pl-12"
              onClick={() => navigate('/explore')}
              readOnly
            />
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/explore')}
          >
            Explore
          </Button>
        </div>
      </Card>

      {/* Match Sections */}
      <MatchSection
        title="🏆 Best Matches"
        users={matches?.bestMatches || []}
        highlight
      />

      <MatchSection
        title="🏫 Same College"
        users={matches?.sameCollege || []}
      />

      <MatchSection
        title="📍 Nearby"
        users={matches?.nearby || []}
      />

      <MatchSection
        title="🌍 Explore More"
        users={matches?.exploreMore || []}
      />

      {/* Empty State */}
      {totalMatches === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card hover={false} className="text-center py-12">
            <div className="w-16 h-16 bg-space-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-space-500" />
            </div>
            <h3 className="text-lg font-semibold text-space-200 mb-2">
              No matches yet
            </h3>
            <p className="text-space-400 mb-4">
              Complete your profile to start finding matches. Or explore more users in the Explore tab.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={() => navigate('/explore')}>
                Explore Users
              </Button>
              <Button variant="secondary" onClick={() => navigate('/profile')}>
                Complete Profile
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Home;

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { MatchSection } from '../components/feed/MatchSection';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Search, RefreshCw } from 'lucide-react';
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
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} hover={false}>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3].map(j => (
                  <div key={j} className="flex-shrink-0 w-72">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Card hover={false} className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to view your matches.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Matches
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {totalMatches} potential connections near you
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          loading={refreshing}
          icon={<RefreshCw className="w-4 h-4" />}
        />
      </div>

      {/* Best Matches */}
      <MatchSection
        title="🏆 Best Matches"
        users={matches?.bestMatches || []}
      />

      {/* Same College */}
      <MatchSection
        title="🏫 Same College"
        users={matches?.sameCollege || []}
      />

      {/* Nearby */}
      <MatchSection
        title="📍 Nearby"
        users={matches?.nearby || []}
      />

      {/* Explore More */}
      <MatchSection
        title="🌍 Explore More"
        users={matches?.exploreMore || []}
      />

      {/* Empty State */}
      {totalMatches === 0 && (
        <Card hover={false} className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No matches yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Complete your profile to start finding matches. Or explore more users in the Explore tab.
          </p>
          <Button onClick={() => navigate('/explore')}>
            Explore Users
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Home;

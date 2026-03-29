import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { UserCard } from '../components/feed/UserCard';
import { User, UserFilters } from '../types';
import { ALL_SKILLS } from '../utils/constants';
import { Search, SlidersHorizontal, X, GraduationCap, MapPin, Globe } from 'lucide-react';

export const Explore: React.FC = () => {
  const { getAllUsers } = useData();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<UserFilters>({
    skills: [],
    college: '',
    area: '',
    city: ''
  });

  const skills = useMemo(() => ALL_SKILLS, []);

  // Derive filter options from users
  const colleges = useMemo(() =>
    Array.from(new Set(allUsers.map(u => u.college).filter(Boolean))).sort(),
    [allUsers]
  );

  const areas = useMemo(() =>
    Array.from(new Set(allUsers.map(u => u.area).filter(Boolean))).sort(),
    [allUsers]
  );

  const cities = useMemo(() =>
    Array.from(new Set(allUsers.map(u => u.city).filter(Boolean))).sort(),
    [allUsers]
  );

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useMemo(() => {
    let filtered = allUsers;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.displayName.toLowerCase().includes(query) ||
        user.college.toLowerCase().includes(query) ||
        user.city.toLowerCase().includes(query) ||
        user.area.toLowerCase().includes(query) ||
        user.skillsHave.some(s => s.toLowerCase().includes(query)) ||
        user.skillsWant.some(s => s.toLowerCase().includes(query))
      );
    }

    // Apply structured filters
    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(user =>
        filters.skills!.some(skill =>
          user.skillsHave.includes(skill) || user.skillsWant.includes(skill)
        )
      );
    }

    if (filters.college) {
      filtered = filtered.filter(u => u.college === filters.college);
    }

    if (filters.area) {
      filtered = filtered.filter(u => u.area === filters.area);
    }

    if (filters.city) {
      filtered = filtered.filter(u => u.city === filters.city);
    }

    return filtered;
  }, [allUsers, searchQuery, filters]);

  const clearFilters = () => {
    setFilters({
      skills: [],
      college: '',
      area: '',
      city: ''
    });
    setSearchQuery('');
  };

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() ||
      (filters.skills && filters.skills.length > 0) ||
      filters.college ||
      filters.area ||
      filters.city
    );
  }, [searchQuery, filters]);

  const toggleSkillFilter = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills?.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...(prev.skills || []), skill]
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 h-12 bg-space-800/50 rounded-2xl animate-pulse"></div>
          <div className="w-12 h-12 bg-space-800/50 rounded-full animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} hover={false} className="h-80">
              <div className="animate-pulse">
                <div className="h-48 bg-space-800/50 rounded-2xl mb-3"></div>
                <div className="h-4 bg-space-800/50 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-space-800/50 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
          Explore the Community
        </h1>
        <p className="text-space-400">
          Find skilled people who share your interests
        </p>
      </motion.div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-space-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, college, city, or skill..."
            className="input-glow pl-12"
          />
        </div>
        <Button
          size="lg"
          variant={hasActiveFilters ? 'glow' : 'secondary'}
          onClick={() => setShowFilters(!showFilters)}
          icon={<SlidersHorizontal className="w-5 h-5" />}
        >
          {hasActiveFilters ? (
            <span className="relative">
              Filters
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-glow-pink rounded-full flex items-center justify-center text-xs text-white animate-pulse">
                {filters.skills?.length || 1}
              </span>
            </span>
          ) : (
            'Filters'
          )}
        </Button>
      </div>

      {/* Active Filter Chips */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap gap-2"
          >
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-4 py-2 bg-glow-cyan/20 text-glow-cyan border border-glow-cyan/30 rounded-full text-sm font-medium backdrop-blur-sm">
                🔍 {searchQuery}
                <button onClick={() => setSearchQuery('')} className="ml-1 hover:bg-glow-cyan/30 rounded-full p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {(filters.skills || []).map(skill =>
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-4 py-2 bg-glow-purple/20 text-glow-purple border border-glow-purple/30 rounded-full text-sm font-medium backdrop-blur-sm"
              >
                💡 {skill}
                <button onClick={() => toggleSkillFilter(skill)} className="ml-1 hover:bg-glow-purple/30 rounded-full p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {filters.college && (
              <span className="inline-flex items-center gap-1 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm font-medium backdrop-blur-sm">
                <GraduationCap className="w-3.5 h-3.5" />
                {filters.college}
                <button onClick={() => setFilters(prev => ({ ...prev, college: '' }))} className="ml-1 hover:bg-green-500/30 rounded-full p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {filters.area && (
              <span className="inline-flex items-center gap-1 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-sm font-medium backdrop-blur-sm">
                <MapPin className="w-3.5 h-3.5" />
                {filters.area}
                <button onClick={() => setFilters(prev => ({ ...prev, area: '' }))} className="ml-1 hover:bg-blue-500/30 rounded-full p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {filters.city && (
              <span className="inline-flex items-center gap-1 px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-sm font-medium backdrop-blur-sm">
                <Globe className="w-3.5 h-3.5" />
                {filters.city}
                <button onClick={() => setFilters(prev => ({ ...prev, city: '' }))} className="ml-1 hover:bg-orange-500/30 rounded-full p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-space-400 hover:text-space-200 underline font-medium"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card hover={false} className="border-glow-cyan/30 bg-space-900/50 backdrop-blur-xl">
              <div className="space-y-6 p-4">
                {/* Skills Filter */}
                <div>
                  <label className="block text-sm font-semibold text-space-200 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-glow-cyan"></span>
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-space-900/50 rounded-xl border border-space-800/50">
                    {skills.map(skill => {
                      const isSelected = filters.skills?.includes(skill);
                      return (
                        <button
                          key={skill}
                          onClick={() => toggleSkillFilter(skill)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-glow-cyan to-glow-purple text-white shadow-lg shadow-glow-cyan/30'
                              : 'bg-space-800/50 text-space-300 hover:bg-space-700/50 hover:text-space-200'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                  {filters.skills && filters.skills.length > 0 && (
                    <p className="text-xs text-space-400 mt-2 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-glow-cyan"></span>
                      {filters.skills.length} skill{filters.skills.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* College Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-space-200 mb-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-glow-cyan" />
                      College
                    </label>
                    <select
                      value={filters.college}
                      onChange={e => setFilters(prev => ({ ...prev, college: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">All Colleges</option>
                      {colleges.map(college => (
                        <option key={college} value={college}>
                          {college}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Area Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-space-200 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-glow-purple" />
                      Area
                    </label>
                    <select
                      value={filters.area}
                      onChange={e => setFilters(prev => ({ ...prev, area: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">All Areas</option>
                      {areas.map(area => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-space-200 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-glow-blue" />
                      City
                    </label>
                    <select
                      value={filters.city}
                      onChange={e => setFilters(prev => ({ ...prev, city: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">All Cities</option>
                      {cities.map(city => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="secondary"
                    onClick={clearFilters}
                    className="flex-1 py-3 border border-space-700/50"
                  >
                    Clear Filters
                  </Button>
                  <Button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 py-3 bg-gradient-to-r from-glow-cyan to-glow-purple hover:from-glow-blue hover:to-glow-purple shadow-lg shadow-glow-cyan/30"
                  >
                    Apply & Close
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-space-400">
            {applyFilters.length} user{applyFilters.length !== 1 ? 's' : ''} found
            {hasActiveFilters && ' (filtered)'}
          </p>
        </div>

        {applyFilters.length === 0 ? (
          <Card hover={false} className="text-center py-12">
            <div className="w-16 h-16 bg-space-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-space-500" />
            </div>
            <h3 className="text-lg font-semibold text-space-200 mb-2">
              No users found
            </h3>
            <p className="text-space-400 mb-4">
              Try adjusting your search or filters to find more people.
            </p>
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Card>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
          >
            {applyFilters.map((user, index) => (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <UserCard user={user} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Explore;

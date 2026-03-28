import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { UserCard } from '../components/feed/UserCard';
import { User, UserFilters } from '../types';
import {
  Search,
  Filter,
  X,
  GraduationCap,
  MapPin,
  Globe,
  SlidersHorizontal
} from 'lucide-react';
// Skills are loaded from constants
import { ALL_SKILLS } from '../utils/constants';

export const Explore: React.FC = () => {
  const { getAllUsers, filteredUsers } = useData();

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
      <div className="space-y-4">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} hover={false}>
              <div className="animate-pulse h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Explore Users
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Discover skilled people around you
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, college, city, or skill..."
            className="input-field pl-12"
          />
        </div>
        <Button
          variant={hasActiveFilters ? 'primary' : 'secondary'}
          onClick={() => setShowFilters(!showFilters)}
          icon={<SlidersHorizontal className="w-4 h-4" />}
        >
          {hasActiveFilters ? (
            <span className="relative">
              Filters
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center">
                !
              </span>
            </span>
          ) : (
            'Filters'
          )}
        </Button>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-200 rounded-full text-sm">
              Search: {searchQuery}
              <button onClick={() => setSearchQuery('')}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {(filters.skills || []).map(skill =>
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-200 rounded-full text-sm"
            >
              {skill}
              <button onClick={() => toggleSkillFilter(skill)}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {filters.college && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded-full text-sm">
              <GraduationCap className="w-3.5 h-3.5" />
              {filters.college}
              <button onClick={() => setFilters(prev => ({ ...prev, college: '' }))}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {filters.area && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded-full text-sm">
              <MapPin className="w-3.5 h-3.5" />
              {filters.area}
              <button onClick={() => setFilters(prev => ({ ...prev, area: '' }))}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {filters.city && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-200 rounded-full text-sm">
              <Globe className="w-3.5 h-3.5" />
              {filters.city}
              <button onClick={() => setFilters(prev => ({ ...prev, city: '' }))}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          <button
            onClick={clearFilters}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
          >
            Clear all
          </button>
        </motion.div>
      )}

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card hover={false} className="mb-6">
              <div className="space-y-6">
                {/* Skills Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto scrollbar-thin">
                    {skills.map(skill => {
                      const isSelected = filters.skills?.includes(skill);
                      return (
                        <button
                          key={skill}
                          onClick={() => toggleSkillFilter(skill)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            isSelected
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                  {filters.skills && filters.skills.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {filters.skills.length} skill{filters.skills.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* College Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      <GraduationCap className="w-4 h-4 inline mr-2" />
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
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
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
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      <Globe className="w-4 h-4 inline mr-2" />
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
                    className="flex-1"
                  >
                    Clear Filters
                  </Button>
                  <Button
                    onClick={() => setShowFilters(false)}
                    className="flex-1"
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
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {applyFilters.length} user{applyFilters.length !== 1 ? 's' : ''} found
            {hasActiveFilters && ' (filtered)'}
          </p>
        </div>

        {applyFilters.length === 0 ? (
          <Card hover={false} className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No users found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search or filters to find more people.
            </p>
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;

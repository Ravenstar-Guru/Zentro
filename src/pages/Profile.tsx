import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, GraduationCap, Edit2, Camera, Save, X, Globe, User as UserIcon } from 'lucide-react';
import { Skill, User } from '../types';

export const Profile: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { getUserSkills, getUser } = useData();
  const [searchParams] = useSearchParams();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Check if we're viewing another user's profile
  const uidParam = searchParams.get('uid');

  useEffect(() => {
    const loadUser = async () => {
      if (uidParam && uidParam !== currentUser?.uid) {
        setLoadingUser(true);
        try {
          const user = await getUser(uidParam);
          setViewedUser(user);
        } catch (error) {
          console.error('Error loading user:', error);
        } finally {
          setLoadingUser(false);
        }
      } else {
        setViewedUser(null); // Viewing own profile
      }
    };
    loadUser();
  }, [uidParam, currentUser, getUser]);

  // Use viewedUser if set, otherwise currentUser
  const displayUser = viewedUser || currentUser;

  const [formData, setFormData] = useState<{
    displayName: string;
    college: string;
    area: string;
    city: string;
    phoneNumber: string;
    bio: string;
    skillsHave: string[];
    skillsWant: string[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    availability: 'part-time' | 'full-time' | 'weekends' | 'flexible';
  }>({
    displayName: displayUser?.displayName || '',
    college: displayUser?.college || '',
    area: displayUser?.area || '',
    city: displayUser?.city || '',
    phoneNumber: displayUser?.phoneNumber || '',
    bio: displayUser?.bio || '',
    skillsHave: displayUser?.skillsHave || [],
    skillsWant: displayUser?.skillsWant || [],
    skillLevel: displayUser?.skillLevel || 'beginner',
    availability: displayUser?.availability || 'flexible'
  });

  useEffect(() => {
    const loadSkills = async () => {
      const userSkills = await getUserSkills();
      setSkills(userSkills);
    };
    loadSkills();
  }, [getUserSkills]);

  // Update form data when displayUser changes
  useEffect(() => {
    if (displayUser) {
      setFormData({
        displayName: displayUser.displayName || '',
        college: displayUser.college || '',
        area: displayUser.area || '',
        city: displayUser.city || '',
        phoneNumber: displayUser.phoneNumber || '',
        bio: displayUser.bio || '',
        skillsHave: displayUser.skillsHave || [],
        skillsWant: displayUser.skillsWant || [],
        skillLevel: displayUser.skillLevel || 'beginner',
        availability: displayUser.availability || 'flexible'
      });
    }
  }, [displayUser]);

  // Get skill names from IDs
  const skillsHaveNames = currentUser?.skillsHave
    ? currentUser.skillsHave.map(id =>
        skills.find(s => s.id === id)?.name || id
      )
    : [];

  const skillsWantNames = currentUser?.skillsWant
    ? currentUser.skillsWant.map(id =>
        skills.find(s => s.id === id)?.name || id
      )
    : [];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      displayName: currentUser?.displayName || '',
      college: currentUser?.college || '',
      area: currentUser?.area || '',
      city: currentUser?.city || '',
      phoneNumber: currentUser?.phoneNumber || '',
      bio: currentUser?.bio || '',
      skillsHave: currentUser?.skillsHave || [],
      skillsWant: currentUser?.skillsWant || [],
      skillLevel: currentUser?.skillLevel || 'beginner',
      availability: currentUser?.availability || 'flexible'
    });
  };

  if (!currentUser) {
    return (
      <Card hover={false} className="text-center py-12">
        <p className="text-space-400">
          Please log in to view your profile.
        </p>
      </Card>
    );
  }

  if (loadingUser) {
    return (
      <div className="space-y-6">
        <Card hover={false} className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glow-cyan mx-auto"></div>
          <p className="mt-4 text-space-400">Loading profile...</p>
        </Card>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <Card hover={false} className="text-center py-12">
        <p className="text-space-400">
          User not found.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card hover={false} className="overflow-hidden relative">
          {/* Cover Gradient */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-glow-cyan/30 via-glow-purple/30 to-glow-cyan/30"></div>

          <div className="relative pt-16 px-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
              {/* Profile Picture */}
              <div className="relative">
                <div className="avatar-ring w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-space-900 shadow-glow-cyan/40 overflow-hidden">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentUser.displayName?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-space-900 rounded-full shadow-lg flex items-center justify-center border-2 border-glow-cyan">
                    <Camera className="w-4 h-4 text-glow-cyan" />
                  </button>
                )}
              </div>

              {/* Name & Location */}
              <div className="flex-1 text-center sm:text-left mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={e => handleInputChange('displayName', e.target.value)}
                    className="text-2xl font-bold bg-space-900 border-b-2 border-glow-cyan focus:outline-none w-full max-w-xs text-space-100"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-space-100">
                    {currentUser.displayName}
                  </h1>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-space-400">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-glow-cyan" />
                    <span>{currentUser.college || 'No college'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-glow-purple" />
                    <span>{currentUser.area || currentUser.city || 'No location'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {viewedUser ? (
                  // Viewing another user - no edit buttons
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.history.back()}
                  >
                    Back
                  </Button>
                ) : isEditing ? (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleCancel}
                      icon={<X className="w-4 h-4" />}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      loading={loading}
                      icon={<Save className="w-4 h-4" />}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="glow"
                    onClick={() => setIsEditing(true)}
                    icon={<Edit2 className="w-4 h-4" />}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={e => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="input-field resize-none"
                />
              ) : (
                <p className="text-space-300 leading-relaxed">
                  {currentUser.bio || 'No bio added yet.'}
                </p>
              )}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <Card hover={false} className="text-center">
                <p className="text-2xl font-bold gradient-text mb-1">
                  {skillsHaveNames.length}
                </p>
                <p className="text-xs text-space-400 uppercase tracking-wider">Skills to Teach</p>
              </Card>
              <Card hover={false} className="text-center">
                <p className="text-2xl font-bold text-glow-purple mb-1">
                  {skillsWantNames.length}
                </p>
                <p className="text-xs text-space-400 uppercase tracking-wider">Skills to Learn</p>
              </Card>
              <Card hover={false} className="text-center">
                <p className="text-2xl font-bold text-space-200 mb-1 capitalize">
                  {currentUser.skillLevel}
                </p>
                <p className="text-xs text-space-400 uppercase tracking-wider">Level</p>
              </Card>
              <Card hover={false} className="text-center">
                <p className="text-2xl font-bold text-space-200 mb-1 capitalize">
                  {currentUser.availability.replace('-', ' ')}
                </p>
                <p className="text-xs text-space-400 uppercase tracking-wider">Availability</p>
              </Card>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Skills Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card hover={false}>
          <h3 className="text-lg font-bold text-space-200 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-glow-cyan" />
            Skills I Teach
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-space-400 mb-2">
                  {formData.skillsHave.length} selected
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-space-900/50 rounded-xl border border-space-800/50">
                  {skills.map(skill => {
                    const isSelected = formData.skillsHave.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            skillsHave: prev.skillsHave.includes(skill.id)
                              ? prev.skillsHave.filter(id => id !== skill.id)
                              : [...prev.skillsHave, skill.id]
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          isSelected
                            ? 'bg-glow-cyan text-white shadow-glow-cyan/30'
                            : 'bg-space-800/50 text-space-300 hover:bg-space-700/50'
                        }`}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skillsHaveNames.length > 0 ? (
                skillsHaveNames.map((skillName, i) => (
                  <span
                    key={i}
                    className="skill-teach px-3 py-1.5"
                  >
                    {skillName}
                  </span>
                ))
              ) : (
                <p className="text-space-500 text-sm">No skills added</p>
              )}
            </div>
          )}
        </Card>

        <Card hover={false}>
          <h3 className="text-lg font-bold text-space-200 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-glow-purple" />
            Skills I Want to Learn
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-space-400 mb-2">
                  {formData.skillsWant.length} selected
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-space-900/50 rounded-xl border border-space-800/50">
                  {skills.map(skill => {
                    const isSelected = formData.skillsWant.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            skillsWant: prev.skillsWant.includes(skill.id)
                              ? prev.skillsWant.filter(id => id !== skill.id)
                              : [...prev.skillsWant, skill.id]
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          isSelected
                            ? 'bg-glow-purple text-white shadow-glow-purple/30'
                            : 'bg-space-800/50 text-space-300 hover:bg-space-700/50'
                        }`}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skillsWantNames.length > 0 ? (
                skillsWantNames.map((skillName, i) => (
                  <span
                    key={i}
                    className="skill-want px-3 py-1.5"
                  >
                    {skillName}
                  </span>
                ))
              ) : (
                <p className="text-space-500 text-sm">No skills added</p>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card hover={false}>
          <h3 className="text-lg font-bold text-space-200 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-space-900/50 rounded-xl border border-space-800/50">
              <Mail className="w-5 h-5 text-glow-cyan" />
              <div>
                <p className="text-xs text-space-400">Email</p>
                <p className="text-space-200 font-medium">
                  {currentUser.email || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-space-900/50 rounded-xl border border-space-800/50">
              <Phone className="w-5 h-5 text-glow-purple" />
              <div>
                <p className="text-xs text-space-400">Phone</p>
                <p className="text-space-200 font-medium">
                  {currentUser.phoneNumber || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-space-900/50 rounded-xl border border-space-800/50">
              <MapPin className="w-5 h-5 text-glow-blue" />
              <div>
                <p className="text-xs text-space-400">Area</p>
                <p className="text-space-200 font-medium">
                  {currentUser.area || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-space-900/50 rounded-xl border border-space-800/50">
              <Globe className="w-5 h-5 text-glow-amber" />
              <div>
                <p className="text-xs text-space-400">City</p>
                <p className="text-space-200 font-medium">
                  {currentUser.city || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;

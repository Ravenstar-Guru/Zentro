import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { MapPin, Phone, Mail, Clock, GraduationCap, Edit2, Camera, Save, X, Globe } from 'lucide-react';
import { Skill } from '../types';

export const Profile: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { getUserSkills } = useData();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const loadSkills = async () => {
      const userSkills = await getUserSkills();
      setSkills(userSkills);
    };
    loadSkills();
  }, [getUserSkills]);

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
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to view your profile.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card hover={false} className="relative overflow-hidden">
        {/* Cover Gradient */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary-500 to-accent-500"></div>

        <div className="relative pt-16 px-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden">
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
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center border-2 border-primary-500">
                  <Camera className="w-4 h-4 text-primary-500" />
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
                  className="text-2xl font-bold bg-gray-50 dark:bg-gray-900 border-b-2 border-primary-500 focus:outline-none w-full max-w-xs text-gray-900 dark:text-white"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentUser.displayName}
                </h1>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>{currentUser.college || 'No college'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{currentUser.area || currentUser.city || 'No location'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {isEditing ? (
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
                  variant="primary"
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
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentUser.bio || 'No bio added yet.'}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                {skillsHaveNames.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Skills to Teach</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-accent-600 dark:text-accent-400 mb-1">
                {skillsWantNames.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Skills to Learn</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-1 capitalize">
                {currentUser.skillLevel}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Level</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-1 capitalize">
                {currentUser.availability.replace('-', ' ')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Availability</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Skills Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hover={false}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary-500" />
            Skills I Teach
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formData.skillsHave.length} selected
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-xl">
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
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
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
                    className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                  >
                    {skillName}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No skills added</p>
              )}
            </div>
          )}
        </Card>

        <Card hover={false}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent-500" />
            Skills I Want to Learn
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formData.skillsWant.length} selected
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-xl">
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
                            ? 'bg-accent-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
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
                    className="px-3 py-1.5 bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-200 rounded-full text-sm"
                  >
                    {skillName}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No skills added</p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Contact Info */}
      <Card hover={false}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {currentUser.email || 'Not provided'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {currentUser.phoneNumber || 'Not provided'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Area</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {currentUser.area || 'Not provided'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <Globe className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">City</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {currentUser.city || 'Not provided'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Fix: Need to create Input component. Let me create it quickly.
// Actually, I'll just inline a simple input for now. The Card component and Button are already created.

export default Profile;

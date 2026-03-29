import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { uploadProfileImage } from '../services/users';
import { compressImage } from '../utils/compressImage';
import { SKILLS_CATEGORIES, SKILL_CATEGORY_LABELS, AVAILABILITY_OPTIONS, SKILL_LEVEL_OPTIONS } from '../utils/constants';
import { OnboardingData, Skill } from '../types';
import { Camera, Check, ChevronRight } from 'lucide-react';

const STEPS = ['Basic Info', 'Skills', 'Preferences', 'About'];

export const Onboarding: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { getUserSkills } = useData();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);

  const [formData, setFormData] = useState<OnboardingData>({
    displayName: currentUser?.displayName || '',
    college: currentUser?.college || '',
    area: currentUser?.area || '',
    city: currentUser?.city || '',
    phoneNumber: currentUser?.phoneNumber || '',
    skillsHave: currentUser?.skillsHave || [],
    skillsWant: currentUser?.skillsWant || [],
    skillLevel: currentUser?.skillLevel || 'beginner',
    availability: currentUser?.availability || 'flexible',
    bio: currentUser?.bio || '',
    photoURL: currentUser?.photoURL || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('programming');

  useEffect(() => {
    const loadSkills = async () => {
      const userSkills = await getUserSkills();
      setSkills(userSkills);
    };
    loadSkills();
  }, [getUserSkills]);

  const filteredSkills = skills.filter(
    skill => skill.category === selectedCategory
  );

  const updateField = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.college.trim()) {
        newErrors.college = 'College name is required';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
        newErrors.phoneNumber = 'Invalid phone number format';
      }
    }

    if (step === 1) {
      if (formData.skillsHave.length === 0) {
        newErrors.skillsHave = 'Select at least one skill you can teach';
      }
      if (formData.skillsWant.length === 0) {
        newErrors.skillsWant = 'Select at least one skill you want to learn';
      }
    }

    if (step === 2) {
      if (!formData.skillLevel) {
        newErrors.skillLevel = 'Select your skill level';
      }
      if (!formData.availability) {
        newErrors.availability = 'Select your availability';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedFile = await compressImage(file);
      setPhotoFile(compressedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Failed to process image:', error);
      setErrors(prev => ({ ...prev, photo: 'Failed to upload image. Please try again.' }));
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      // Upload photo if one was selected
      let photoURL = formData.photoURL;
      if (photoFile && currentUser) {
        try {
          photoURL = await uploadProfileImage(currentUser.uid, photoFile);
        } catch (uploadError) {
          console.error('Failed to upload profile image:', uploadError);
          setErrors({ submit: 'Failed to upload profile image. Please try again.' });
          setLoading(false);
          return;
        }
      }

      await updateUserProfile({
        ...formData,
        photoURL: photoURL || undefined
      });
      window.location.href = '/home';
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skillId: string, type: 'have' | 'want') => {
    const field = type === 'have' ? 'skillsHave' : 'skillsWant';
    updateField(
      field,
      formData[field].includes(skillId)
        ? formData[field].filter(id => id !== skillId)
        : [...formData[field], skillId]
    );
  };

  return (
    <div className="min-h-screen bg-space-gradient py-8 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-glow-cyan/10 rounded-full blur-3xl float-animation"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-glow-purple/10 rounded-full blur-3xl float-animation delay-1000"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Complete Your Profile
          </h1>
          <p className="text-space-400">
            Let's set up your profile to find the perfect matches
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      index < currentStep
                        ? 'bg-gradient-to-r from-glow-cyan to-glow-purple text-white shadow-glow-cyan/30'
                        : index === currentStep
                        ? 'bg-space-900 border-2 border-glow-cyan text-glow-cyan'
                        : 'bg-space-800 text-space-500'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </motion.div>
                  <span className="text-xs mt-2 text-space-400 hidden sm:block">
                    {step}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      index < currentStep
                        ? 'bg-gradient-to-r from-glow-cyan to-glow-purple'
                        : 'bg-space-800'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="mb-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 0: Basic Info */}
            {currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                <h2 className="text-xl font-bold text-space-100 mb-4">
                  Basic Information
                </h2>

                {/* Photo Upload */}
                <div className="flex flex-col items-center mb-6">
                  <label className="cursor-pointer group">
                    <div className="relative">
                      <div className="avatar-ring w-24 h-24 rounded-full flex items-center justify-center overflow-hidden">
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-space-100 bg-gradient-to-br from-glow-cyan/30 to-glow-purple/30">
                            <Camera className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 bg-space-900 rounded-full p-2 shadow-lg border-2 border-glow-cyan">
                        <Camera className="w-4 h-4 text-glow-cyan" />
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-space-400 mt-2">
                    Upload a profile photo
                  </p>
                </div>

                {/* College */}
                <div>
                  <label className="block text-sm font-medium text-space-300 mb-2">
                    College/University
                  </label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={e => updateField('college', e.target.value)}
                    placeholder="e.g., MIT, Stanford University"
                    className="input-field"
                  />
                  {errors.college && (
                    <p className="mt-1 text-sm text-red-400">{errors.college}</p>
                  )}
                </div>

                {/* Area */}
                <div>
                  <label className="block text-sm font-medium text-space-300 mb-2">
                    Area/Locality
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={e => updateField('area', e.target.value)}
                    placeholder="e.g., Downtown, Silicon Valley"
                    className="input-field"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-space-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => updateField('city', e.target.value)}
                    placeholder="e.g., San Francisco, New York"
                    className="input-field"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-400">{errors.city}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-space-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={e => updateField('phoneNumber', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="input-field"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-400">{errors.phoneNumber}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 1: Skills */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                <h2 className="text-xl font-bold text-space-100 mb-4">
                  Your Skills
                </h2>

                {/* Skills categories */}
                <div>
                  <label className="block text-sm font-medium text-space-300 mb-3">
                    Select Category
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(SKILL_CATEGORY_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedCategory(key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedCategory === key
                            ? 'bg-gradient-to-r from-glow-cyan to-glow-purple text-white shadow-glow-cyan/30'
                            : 'bg-space-800 text-space-300 hover:bg-space-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills I can teach */}
                <div>
                  <label className="block text-sm font-medium text-space-300 mb-2">
                    Skills I Can Teach
                    <span className="ml-2 text-xs text-space-500">
                      ({formData.skillsHave.length} selected)
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-space-900/50 rounded-xl border border-space-800/50">
                    {filteredSkills.map(skill => {
                      const skillId = skill.id;
                      const isSelected = formData.skillsHave.includes(skillId);
                      return (
                        <button
                          key={skillId}
                          type="button"
                          onClick={() => toggleSkill(skillId, 'have')}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            isSelected
                              ? 'bg-glow-cyan text-white shadow-glow-cyan/30'
                              : 'bg-space-800 text-space-300 hover:bg-space-700'
                          }`}
                        >
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                  {errors.skillsHave && (
                    <p className="mt-1 text-sm text-red-400">{errors.skillsHave}</p>
                  )}
                </div>

                {/* Skills I want to learn */}
                <div>
                  <label className="block text-sm font-medium text-space-300 mb-2">
                    Skills I Want to Learn
                    <span className="ml-2 text-xs text-space-500">
                      ({formData.skillsWant.length} selected)
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-space-900/50 rounded-xl border border-space-800/50">
                    {filteredSkills.map(skill => {
                      const skillId = skill.id;
                      const isSelected = formData.skillsWant.includes(skillId);
                      return (
                        <button
                          key={skillId}
                          type="button"
                          onClick={() => toggleSkill(skillId, 'want')}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            isSelected
                              ? 'bg-glow-purple text-white shadow-glow-purple/30'
                              : 'bg-space-800 text-space-300 hover:bg-space-700'
                          }`}
                        >
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                  {errors.skillsWant && (
                    <p className="mt-1 text-sm text-red-400">{errors.skillsWant}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Preferences */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                <h2 className="text-xl font-bold text-space-100 mb-4">
                  Preferences
                </h2>

                <div>
                  <label className="block text-sm font-medium text-space-300 mb-2">
                    Skill Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {SKILL_LEVEL_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField('skillLevel', option.value as any)}
                        className={`p-3 rounded-xl text-center transition-all ${
                          formData.skillLevel === option.value
                            ? 'bg-glow-cyan text-white shadow-glow-cyan/30'
                            : 'bg-space-800 text-space-300 hover:bg-space-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-space-500 mt-2">
                    This helps us match you appropriately
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-space-300 mb-2">
                    Availability
                  </label>
                  <div className="space-y-2">
                    {AVAILABILITY_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField('availability', option.value as any)}
                        className={`w-full p-3 rounded-xl text-left transition-all flex items-center ${
                          formData.availability === option.value
                            ? 'bg-glow-cyan/20 text-glow-cyan border border-glow-cyan/30'
                            : 'bg-space-800 text-space-300 hover:bg-space-700 border-2 border-transparent'
                        }`}
                      >
                        {formData.availability === option.value && (
                          <Check className="w-5 h-5 mr-2" />
                        )}
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Bio */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                <h2 className="text-xl font-bold text-space-100 mb-4">
                  Tell Us About Yourself
                </h2>

                <div>
                  <label className="block text-sm font-medium text-space-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={e => updateField('bio', e.target.value)}
                    placeholder="Share a bit about yourself, your goals, and what you're looking for in skill exchanges..."
                    rows={5}
                    className="input-field resize-none"
                  />
                  <p className="text-xs text-space-500 mt-1">
                    {formData.bio.length}/500 characters
                  </p>
                </div>

                <div className="bg-glow-cyan/10 p-4 rounded-xl border border-glow-cyan/20">
                  <h3 className="font-semibold text-glow-cyan mb-2">
                    Here's what you've selected:
                  </h3>
                  <ul className="space-y-2 text-sm text-space-300">
                    <li><span className="font-medium">College:</span> {formData.college}</li>
                    <li><span className="font-medium">City:</span> {formData.city}</li>
                    <li><span className="font-medium">Skills to teach:</span> {formData.skillsHave.length} selected</li>
                    <li><span className="font-medium">Skills to learn:</span> {formData.skillsWant.length} selected</li>
                    <li><span className="font-medium">Level:</span> {formData.skillLevel}</li>
                    <li><span className="font-medium">Availability:</span> {formData.availability}</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-space-800/50">
            {currentStep > 0 ? (
              <Button variant="secondary" onClick={prevStep}>
                Back
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < STEPS.length - 1 ? (
              <Button onClick={nextStep} className="gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={loading}
                className="gap-2 bg-gradient-to-r from-glow-cyan to-glow-purple hover:from-glow-blue hover:to-glow-purple shadow-lg shadow-glow-cyan/30"
              >
                <Check className="w-4 h-4" />
                Complete Profile
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

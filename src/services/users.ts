import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { User, Skill } from '../types';
import { ALL_SKILLS } from '../utils/constants';
import { compressImage } from '../utils/compressImage';

/**
 * Get all skills from constants
 */
export function getUserSkills(): Skill[] {
  return ALL_SKILLS.map((name, index) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    category: getCategoryForSkill(name)
  }));
}

/**
 * Helper to determine skill category
 */
function getCategoryForSkill(skillName: string): string {
  const categories = {
    programming: ['JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C++', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'SQL', 'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'REST', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'DevOps', 'Machine Learning', 'Data Science', 'AI', 'TensorFlow', 'PyTorch'],
    design: ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI', 'UX', 'Web Design', 'Mobile Design', 'Brand', 'Typography', 'Color', 'Prototyping', 'Wireframing', 'Research', 'Interaction', 'Motion', 'After Effects', 'Principle', 'Lottie'],
    business: ['Marketing', 'Digital Marketing', 'SEO', 'Content Marketing', 'Social Media', 'Analytics', 'Google Analytics', 'Growth', 'Sales', 'CRM', 'HubSpot', 'Salesforce', 'Negotiation', 'Strategy', 'Finance', 'Accounting', 'Project Management', 'Agile', 'Scrum', 'Product Management', 'Business Analysis'],
    languages: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Mandarin', 'Cantonese', 'Japanese', 'Korean', 'Hindi', 'Arabic', 'Russian', 'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Thai', 'Vietnamese', 'Indonesian'],
    music: ['Piano', 'Guitar', 'Violin', 'Drums', 'Bass', 'Vocals', 'Music Production', 'Ableton', 'FL Studio', 'Logic Pro', 'Pro Tools', 'Mixing', 'Mastering', 'Songwriting', 'Composition', 'Music Theory', 'DJing', 'Beat Making'],
    art: ['Drawing', 'Painting', 'Watercolor', 'Oil Painting', 'Digital Art', 'Procreate', 'Concept Art', 'Character Design', 'Illustration', 'Comics', 'Animation', '3D Modeling', 'Blender', 'Maya', 'Cinema 4D', 'ZBrush', 'Substance Painter'],
    writing: ['Copywriting', 'Content Writing', 'Technical Writing', 'Blog Writing', 'Journalism', 'Creative Writing', 'Editing', 'Proofreading', 'Grant Writing', 'Script Writing', 'Storytelling', 'SEO Writing', 'Academic Writing'],
    marketing: ['Brand Strategy', 'Market Research', 'Public Relations', 'Email Marketing', 'Marketing Automation', 'Campaign Management', 'Copywriting', 'Content Strategy', 'Video Marketing', 'Influencer Marketing', 'Affiliate Marketing', 'E-commerce'],
    teaching: ['Curriculum Design', 'Lesson Planning', 'Online Teaching', 'Tutoring', 'Mentoring', 'Workshop Facilitation', 'E-learning', 'Instructional Design', 'Assessment', 'Classroom Management', 'Pedagogy']
  };

  for (const [category, skills] of Object.entries(categories)) {
    if (skills.some(s => skillName.toLowerCase().includes(s.toLowerCase()))) {
      return category;
    }
  }
  return 'other';
}

/**
 * Get user by UID
 */
export async function getUser(uid: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

/**
 * Get all users (for matching/explore)
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);

    return usersSnap.docs.map(doc => doc.data() as User);
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

/**
 * Create new user profile
 */
export async function createUser(userData: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userData.uid!);

    const data = {
      ...userData,
      createdAt: Timestamp.fromDate(userData.createdAt || new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };

    await setDoc(userRef, data);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUser(uid: string, updates: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);

    const data: any = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    };

    // Convert Date to Timestamp if needed
    if (updates.updatedAt instanceof Date) {
      data.updatedAt = Timestamp.fromDate(updates.updatedAt);
    }

    await updateDoc(userRef, data);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Upload profile image to Firebase Storage
 */
export async function uploadProfileImage(uid: string, file: File): Promise<string> {
  try {
    // Compress the image first
    const compressedFile = await compressImage(file);

    // Create storage reference
    const storageRef = ref(storage, `profile-images/${uid}/${Date.now()}_${file.name}`);

    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

    // Upload to Firebase Storage
    const snapshot = await uploadString(storageRef, base64, 'data_url');

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
}

/**
 * Delete old profile image from Firebase Storage
 */
export async function deleteProfileImage(imageUrl: string): Promise<void> {
  try {
    // Extract the path from the URL
    const urlParts = imageUrl.split('/');
    const path = urlParts.slice(urlParts.indexOf('o') + 1).join('/');

    const storageRef = ref(storage, decodeURIComponent(path));
    await deleteObject(storageRef);
  } catch (error) {
    // Log but don't throw - deletion is not critical
    console.warn('Could not delete old profile image:', error);
  }
}

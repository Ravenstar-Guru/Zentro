import { signInWithPopup, signOut, updateProfile, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, provider, db } from './firebase';
import { User } from '../types';

/**
 * Sign in with Google popup
 */
export async function signInWithGoogle(): Promise<void> {
  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.error('Google sign-in failed:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign out failed:', error);
    throw error;
  }
}

/**
 * Create or update user profile in Firestore
 */
export async function createOrUpdateUserProfile(
  firebaseUser: FirebaseUser,
  additionalData?: Partial<User>
): Promise<void> {
  const userRef = doc(db, 'users', firebaseUser.uid);

  const userData: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous',
    photoURL: firebaseUser.photoURL || '',
    college: additionalData?.college || '',
    area: additionalData?.area || '',
    city: additionalData?.city || '',
    phoneNumber: additionalData?.phoneNumber || '',
    skillsHave: additionalData?.skillsHave || [],
    skillsWant: additionalData?.skillsWant || [],
    skillLevel: additionalData?.skillLevel || 'beginner',
    availability: additionalData?.availability || 'flexible',
    bio: additionalData?.bio || '',
    createdAt: additionalData?.createdAt || new Date(),
    updatedAt: new Date()
  };

  try {
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      // Create new user
      await setDoc(userRef, userData);
    } else {
      // Update existing user (preserve createdAt)
      await setDoc(userRef, {
        ...userData,
        createdAt: docSnap.data().createdAt || userData.createdAt,
        updatedAt: new Date()
      });
    }
  } catch (error: any) {
    console.error('Failed to create/update user profile:', error);
    throw error;
  }
}

/**
 * Update Firebase profile (displayName, photoURL)
 */
export async function updateFirebaseProfile(
  displayName?: string,
  photoURL?: string
): Promise<void> {
  try {
    if (!auth.currentUser) {
      throw new Error('No user signed in');
    }

    await updateProfile(auth.currentUser, {
      displayName,
      photoURL
    });
  } catch (error: any) {
    console.error('Profile update failed:', error);
    throw error;
  }
}

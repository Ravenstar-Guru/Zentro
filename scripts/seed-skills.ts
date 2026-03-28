/**
 * Seed script to populate the skills collection in Firestore
 *
 * Run: npx tsx scripts/seed-skills.ts
 *
 * This is OPTIONAL - the app loads skills from constants.ts directly.
 * Use this script only if you want skills in Firestore for admin UI.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, setDoc, doc } from 'firebase/firestore';
import { SKILLS_CATEGORIES } from '../src/utils/constants';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

async function seedSkills() {
  console.log('Seeding skills collection...');

  const skillsCollection = collection(db, 'skills');
  let count = 0;

  for (const [category, skillNames] of Object.entries(SKILLS_CATEGORIES)) {
    for (const name of skillNames) {
      const skillId = name.toLowerCase().replace(/\s+/g, '-');
      const skillDoc = {
        id: skillId,
        name,
        category
      };

      await setDoc(doc(skillsCollection, skillId), skillDoc);
      count++;
      console.log(`  ✓ ${name} (${category})`);
    }
  }

  console.log(`\n✅ Seeded ${count} skills successfully!`);
}

// Check config
if (!firebaseConfig.apiKey) {
  console.error('❌ Firebase config not found. Please set environment variables.');
  process.exit(1);
}

seedSkills()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error seeding skills:', error);
    process.exit(1);
  });

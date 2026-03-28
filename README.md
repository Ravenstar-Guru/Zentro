# Zentro - Smart Skill Exchange Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Learn smarter. Teach better.

Zentro is a modern web application that connects people based on meaningful skill exchanges. Unlike traditional swiping apps, Zentro uses an intelligent matching algorithm to create high-quality connections between users who have complementary skills to exchange.

## 🌟 Features

- **Smart Matching Algorithm**: Bidirectional skill matching with location-based scoring
  - +60 points for same college
  - +40 points for same area
  - +30 points for same city
  - +20 points per matching skill pair

- **Google Authentication**: Secure, seamless login with Firebase Auth

- **Rich User Profiles**:
  - College, area, city information
  - Skills to teach and skills to learn
  - Skill level and availability
  - Bio section
  - Profile photo with automatic compression

- **Smart Feed**:
  - 🏆 Best Matches (60%+ match)
  - 🏫 Same College (40%+ match)
  - 📍 Nearby (30%+ match)
  - 🌍 Explore More (25%+ match)

- **Connect System**:
  - Send connection requests with purpose selection
  - Personalized message support
  - Real-time notifications
  - Accept/Reject functionality

- **WhatsApp Integration**: Share contact info only after mutual connection

- **Explore Page**:
  - Filter by skills, college, area, city
  - Real-time search across all users
  - Clean, responsive grid layout

- **Beautiful UI**:
  - Mobile-first responsive design
  - Dark mode support
  - Smooth animations with Framer Motion
  - Tailwind CSS styling
  - Card-based layout

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (free tier works great)

### Setup Instructions

#### 1. Clone and Install

```bash
cd zentro
npm install
```

#### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable the following services:
   - **Authentication** → Sign-in method → Google
   - **Firestore Database** → Create database (start in test mode, then add rules)
   - **Storage** → Create bucket

4. Get your Firebase config:
   - Project Settings → General → Your Apps
   - Add a web app to get your config object

#### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

> **Important**: Never commit `.env.local` with real credentials. It's in `.gitignore`.

#### 4. Firebase Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /requests/{requestId} {
      allow read: if request.auth != null &&
        (resource.data.fromUserId == request.auth.uid ||
         resource.data.toUserId == request.auth.uid);
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (resource.data.toUserId == request.auth.uid);
      allow delete: if request.auth != null &&
        (resource.data.fromUserId == request.auth.uid ||
         resource.data.toUserId == request.auth.uid);
    }

    match /connections/{connectionId} {
      allow read: if request.auth != null &&
        (resource.data.userId1 == request.auth.uid ||
         resource.data.userId2 == request.auth.uid);
      allow write: if false;
    }

    match /profile-images/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-images/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Create Collections:**
- Skills collection is pre-loaded from constants, no need to create manually.

#### 5. Run the App

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 📁 Project Structure

```
zentro/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI (Button, Card, Modal, Input)
│   │   ├── auth/            # Auth components (ProtectedRoute)
│   │   ├── feed/            # Feed components (UserCard, MatchSection)
│   │   ├── requests/        # Request components (RequestPopup)
│   │   └── layout/          # Layout (Header, Navigation, Logo)
│   ├── pages/
│   │   ├── Home.tsx         # Smart feed with match sections
│   │   ├── Explore.tsx      # Explore page with filters
│   │   ├── Profile.tsx      # User profile view/edit
│   │   ├── Connections.tsx  # Manage connections
│   │   ├── Requests.tsx     # Incoming/outgoing requests
│   │   └── Onboarding.tsx   # Initial profile setup
│   ├── context/
│   │   ├── AuthContext.tsx  # Authentication state
│   │   ├── DataContext.tsx  # Data operations
│   │   └── ThemeContext.tsx # Dark/light mode
│   ├── services/
│   │   ├── firebase.ts      # Firebase initialization
│   │   ├── auth.ts          # Auth operations
│   │   ├── users.ts         # User CRUD + image upload
│   │   ├── matching.ts      # Matching algorithm
│   │   └── requests.ts      # Requests & connections
│   ├── utils/
│   │   ├── constants.ts     # Skills catalog, options
│   │   └── compressImage.ts # Image compression utility
│   └── types/
│       └── index.ts         # TypeScript interfaces
├── public/
├── index.html
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 🎨 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (with dark mode)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Routing**: React Router v6
- **Image Processing**: browser-image-compression

## 🔧 Key Services

### Matching Algorithm (`matching.ts`)

The matching algorithm calculates a percentage score based on:

1. **Geographic factors** (130 max points):
   - Same college: +60
   - Same area: +40
   - Same city: +30

2. **Skill factors** (variable, up to 2× skill matches):
   - Each matching skill pair: +20

The score is normalized to 100% based on theoretical maximum.

### Image Compression

All profile images are automatically compressed before upload:
- Max size: 1MB
- Max dimension: 1024px
- Preserves quality while reducing storage costs

### Sections

The home feed automatically sections users into:
- **Best Matches**: Overall score ≥60%
- **Same College**: Same college with ≥40% match
- **Nearby**: Same area with ≥30% match
- **Explore More**: All other matches ≥25%

## 🧪 Testing

### Manual Testing Flow

1. **Create two test users** with complementary skills:
   - User A: Teaches "React", Wants "Python"
   - User B: Teaches "Python", Wants "React"

2. **Verify matching**:
   - Both users should see each other in their feed
   - Match % should be at least 40% (2 skill matches × 20 = 40 + possible location bonuses)

3. **Test connection flow**:
   - User A clicks "Connect" on User B
   - Select purpose and optionally add message
   - Send request
   - User B receives notification in Requests tab
   - User B accepts → connection created
   - WhatsApp share button becomes available

4. **Test Explore filters**:
   - Search for "React"
   - Filter by skills, college, area, city
   - Verify results update correctly

5. **Test profile editing**:
   - Update bio, skills, location
   - Changes should reflect immediately in feed

### Firebase Rules Testing

Use the Firebase Emulator Suite for local testing:

```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

## 🚢 Deployment

### Build

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Deploy to Firebase Hosting

```bash
firebase login
firebase init hosting
# Set public directory to "dist"
firebase deploy
```

## 📝 Configuration

### Tailwind Customization

Colors are defined in `tailwind.config.js`:
- `primary`: Blue gradient for primary actions
- `accent`: Pink/purple gradient for secondary actions

### Skill Catalog

Skills are defined in `src/utils/constants.ts`. Add, remove, or categorize skills as needed.

### Match Thresholds

Adjust minimum match percentages in `constants.ts`:
- `MIN_MATCH_PERCENTAGE` (default: 25)
- `BEST_MATCH_THRESHOLD` (default: 60)
- `COLLEGE_MATCH_THRESHOLD` (default: 40)
- `AREA_MATCH_THRESHOLD` (default: 30)

## 🐛 Known Limitations

- Phone number validation uses simple format; adjust regex in Onboarding.tsx for specific regions
- User photos currently not displayed (use placeholder initials)
- No real-time updates across devices (requires Firestore listeners)
- No push notifications (would need Firebase Cloud Messaging)
- Skill search is exact word match only (no fuzzy search)
- Only Google authentication is supported

## 🎯 Future Improvements

- Real-time updates using Firestore listeners
- Push notifications for new requests
- Multiple authentication providers (email, phone)
- Chat system within connections
- Skill rating and review system
- Advanced skill recommendation engine
- Admin dashboard
- Email notifications
- Multi-language support
- PWA support for mobile app experience

## 📄 License

MIT - see LICENSE file for details.

## 🙏 Acknowledgments

Built with modern web technologies to create meaningful connections through skill sharing.

---

**Made with ❤️ for the learning community**

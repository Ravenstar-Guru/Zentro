// User types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  college: string;
  area: string;
  city: string;
  phoneNumber: string;
  skillsHave: string[];    // Skill IDs
  skillsWant: string[];   // Skill IDs
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  availability: 'part-time' | 'full-time' | 'weekends' | 'flexible';
  bio: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  icon?: string;
}

export type SkillCategory =
  | 'programming'
  | 'design'
  | 'business'
  | 'languages'
  | 'music'
  | 'art'
  | 'writing'
  | 'marketing'
  | 'teaching'
  | 'other';

// Request types
export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export type ConnectionPurpose = 'learn_basics' | 'long_term' | 'quick_help';

export interface Request {
  id: string;
  fromUserId: string;
  toUserId: string;
  purpose: ConnectionPurpose;
  message: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Connection {
  id: string;
  userId1: string;
  userId2: string;
  requestId: string;
  whatsappShared: boolean;
  createdAt: Date;
}

// Filter types
export interface UserFilters {
  skills?: string[];
  college?: string;
  area?: string;
  city?: string;
}

// Form types
export interface OnboardingData {
  displayName: string;
  college: string;
  area: string;
  city: string;
  phoneNumber: string;
  skillsHave: string[];
  skillsWant: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  availability: 'part-time' | 'full-time' | 'weekends' | 'flexible';
  bio: string;
  photoURL: string;
}

// Match types
export interface MatchResult extends User {
  matchPercentage: number;
}

export interface SectionedMatches {
  bestMatches: MatchResult[];
  sameCollege: MatchResult[];
  nearby: MatchResult[];
  exploreMore: MatchResult[];
}

// Context types
export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (user: Partial<User>) => Promise<void>;
}

export interface DataContextType {
  getUser: (uid: string) => Promise<User | null>;
  getAllUsers: () => Promise<User[]>;
  getUserSkills: () => Promise<Skill[]>;
  getMatches: (user: User) => Promise<SectionedMatches>;
  sendRequest: (toUserId: string, purpose: ConnectionPurpose, message: string) => Promise<string>;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
  getRequests: (userId: string) => Promise<Request[]>;
  getConnections: (userId: string) => Promise<Connection[]>;
  shareWhatsApp: (connectionId: string) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
}

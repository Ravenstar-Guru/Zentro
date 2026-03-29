import React, { createContext, useContext, useCallback } from 'react';
import { User, Skill, MatchResult, SectionedMatches, UserFilters, Request, Connection, ConnectionPurpose } from '../types';
import {
  getUser as fetchUser,
  getAllUsers as fetchAllUsers,
  getUserSkills as fetchUserSkills,
  uploadProfileImage
} from '../services/users';
import {
  sendRequest as sendRequestService,
  acceptRequest as acceptRequestService,
  rejectRequest,
  getIncomingRequests,
  getConnections,
  shareWhatsApp,
  getUserRequests
} from '../services/requests';
import { findMatches as findMatchesService, getSectionsForUser } from '../services/matching';

interface DataContextType {
  // User operations
  getUser: (uid: string) => Promise<User | null>;
  getAllUsers: () => Promise<User[]>;
  getUserSkills: () => Promise<Skill[]>;
  uploadProfileImage: (uid: string, file: File) => Promise<string>;

  // Matching operations
  getMatches: (user: User) => Promise<SectionedMatches>;
  findMatches: (user: User, limit?: number) => Promise<MatchResult[]>;

  // Request operations
  sendRequest: (fromUserId: string, toUserId: string, purpose: ConnectionPurpose, message: string) => Promise<string>;
  acceptRequest: (requestId: string, acceptorId: string) => Promise<void>;
  rejectRequest: (requestId: string, userId: string) => Promise<void>;
  getRequests: (userId: string) => Promise<Request[]>;
  getIncomingRequests: (userId: string) => Promise<Request[]>;

  // Connection operations
  getConnections: (userId: string) => Promise<Connection[]>;
  shareWhatsApp: (connectionId: string) => Promise<void>;

  // Explore operations
  filteredUsers: (filters: UserFilters, users: User[]) => User[];
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // User operations
  const getUser = useCallback(async (uid: string): Promise<User | null> => {
    return fetchUser(uid);
  }, []);

  const getAllUsers = useCallback(async (): Promise<User[]> => {
    return fetchAllUsers();
  }, []);

  const getUserSkills = useCallback(async (): Promise<Skill[]> => {
    return fetchUserSkills();
  }, []);

  const uploadProfileImage = useCallback(async (uid: string, file: File): Promise<string> => {
    return uploadProfileImage(uid, file);
  }, []);

  // Matching operations
  const getMatches = useCallback(async (user: User): Promise<SectionedMatches> => {
    const allUsers = await fetchAllUsers();
    return getSectionsForUser(user, allUsers);
  }, []);

  const findMatches = useCallback(async (user: User, limit: number = 50): Promise<MatchResult[]> => {
    const allUsers = await fetchAllUsers();
    return findMatchesService(user, allUsers, limit);
  }, []);

  // Request operations
  const sendRequestOperation = useCallback(async (
    fromUserId: string,
    toUserId: string,
    purpose: ConnectionPurpose,
    message: string
  ): Promise<string> => {
    return sendRequestService(fromUserId, toUserId, purpose, message);
  }, []);

  const acceptRequestOperation = useCallback(async (
    requestId: string,
    acceptorId: string
  ): Promise<void> => {
    await acceptRequestService(requestId, acceptorId);
  }, []);

  const rejectRequestOperation = useCallback(async (requestId: string, userId: string): Promise<void> => {
    await rejectRequest(requestId, userId);
  }, []);

  const getRequests = useCallback(async (userId: string): Promise<Request[]> => {
    return getUserRequests(userId);
  }, []);

  const getIncomingRequestsOperation = useCallback(async (userId: string): Promise<Request[]> => {
    return getIncomingRequests(userId);
  }, []);

  // Connection operations
  const getConnectionsOperation = useCallback(async (userId: string): Promise<Connection[]> => {
    return getConnections(userId);
  }, []);

  const shareWhatsAppOperation = useCallback(async (connectionId: string): Promise<void> => {
    await shareWhatsApp(connectionId);
  }, []);

  // Filter users
  const filteredUsers = useCallback((filters: UserFilters, users: User[]): User[] => {
    return users.filter(user => {
      if (filters.skills && filters.skills.length > 0) {
        const hasMatchingSkill = filters.skills.some(skill =>
          user.skillsHave.includes(skill) || user.skillsWant.includes(skill)
        );
        if (!hasMatchingSkill) return false;
      }

      if (filters.college && user.college !== filters.college) return false;
      if (filters.area && user.area !== filters.area) return false;
      if (filters.city && user.city !== filters.city) return false;

      return true;
    });
  }, []);

  const value: DataContextType = {
    getUser,
    getAllUsers,
    getUserSkills,
    uploadProfileImage,
    getMatches,
    findMatches,
    sendRequest: sendRequestOperation,
    acceptRequest: acceptRequestOperation,
    rejectRequest: rejectRequestOperation,
    getRequests,
    getIncomingRequests: getIncomingRequestsOperation,
    getConnections: getConnectionsOperation,
    shareWhatsApp: shareWhatsAppOperation,
    filteredUsers
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

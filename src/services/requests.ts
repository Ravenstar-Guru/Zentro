import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Request, Connection, ConnectionPurpose } from '../types';

const REQUESTS_COLLECTION = 'requests';
const CONNECTIONS_COLLECTION = 'connections';

/**
 * Send a connection request
 */
export async function sendRequest(
  fromUserId: string,
  toUserId: string,
  purpose: ConnectionPurpose,
  message: string
): Promise<string> {
  try {
    // Validate user IDs
    if (!fromUserId || !toUserId) {
      throw new Error('Invalid user IDs: both fromUserId and toUserId are required');
    }

    // Check if request already exists
    const existingRequest = await checkExistingRequest(fromUserId, toUserId);
    if (existingRequest) {
      throw new Error('A request already exists between these users');
    }

    const requestData = {
      fromUserId,
      toUserId,
      purpose,
      message: message.trim(),
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, REQUESTS_COLLECTION), requestData);
    return docRef.id;
  } catch (error) {
    console.error('Error sending request:', error);
    throw error;
  }
}

/**
 * Check if a request already exists between two users
 */
export async function checkExistingRequest(
  fromUserId: string,
  toUserId: string
): Promise<Request | null> {
  try {
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as Request;
    }

    // Check reverse direction
    const q2 = query(
      collection(db, REQUESTS_COLLECTION),
      where('fromUserId', '==', toUserId),
      where('toUserId', '==', fromUserId)
    );

    const snapshot2 = await getDocs(q2);
    if (!snapshot2.empty) {
      return snapshot2.docs[0].data() as Request;
    }

    return null;
  } catch (error) {
    console.error('Error checking existing request:', error);
    throw error;
  }
}

/**
 * Get all requests for a user (both sent and received)
 */
export async function getUserRequests(userId: string): Promise<Request[]> {
  try {
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where('toUserId', '==', userId)
    );

    const q2 = query(
      collection(db, REQUESTS_COLLECTION),
      where('fromUserId', '==', userId)
    );

    const [snapshot1, snapshot2] = await Promise.all([getDocs(q), getDocs(q2)]);

    const allRequests: Request[] = [
      ...snapshot1.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
        } as Request;
      }),
      ...snapshot2.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
        } as Request;
      })
    ];

    return allRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error getting user requests:', error);
    throw error;
  }
}

/**
 * Get pending requests sent TO a user (incoming)
 */
export async function getIncomingRequests(userId: string): Promise<Request[]> {
  try {
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
      } as Request;
    });
  } catch (error) {
    console.error('Error getting incoming requests:', error);
    throw error;
  }
}

/**
 * Accept a connection request
 */
export async function acceptRequest(requestId: string, acceptorId: string): Promise<Connection> {
  try {
    // Validate acceptorId
    if (!acceptorId) {
      throw new Error('Acceptor ID is required');
    }

    // Get the request first to verify permissions
    const requestRef = doc(db, REQUESTS_COLLECTION, requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      throw new Error('Request not found');
    }

    const request = requestSnap.data() as Request;

    // Verify that the acceptor is the intended recipient (toUserId)
    if (request.toUserId !== acceptorId) {
      throw new Error('You are not authorized to accept this request');
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      throw new Error(`This request has already been ${request.status}`);
    }

    // Update request status
    await updateDoc(requestRef, {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });

    // Create connection
    const connectionData = {
      userId1: request.fromUserId,
      userId2: request.toUserId,
      requestId,
      whatsappShared: false,
      createdAt: serverTimestamp()
    };

    const connRef = await addDoc(collection(db, CONNECTIONS_COLLECTION), connectionData);

    return {
      id: connRef.id,
      ...connectionData,
      createdAt: new Date()
    } as Connection;
  } catch (error) {
    console.error('Error accepting request:', error);
    throw error;
  }
}

/**
 * Reject a connection request
 */
export async function rejectRequest(requestId: string, userId: string): Promise<void> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const requestRef = doc(db, REQUESTS_COLLECTION, requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      throw new Error('Request not found');
    }

    const request = requestSnap.data() as Request;

    // Verify that the user is the intended recipient (toUserId)
    if (request.toUserId !== userId) {
      throw new Error('You are not authorized to reject this request');
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      throw new Error(`This request has already been ${request.status}`);
    }

    await updateDoc(requestRef, {
      status: 'rejected',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    throw error;
  }
}

/**
 * Get active connections for a user
 */
export async function getConnections(userId: string): Promise<Connection[]> {
  try {
    const q1 = query(
      collection(db, CONNECTIONS_COLLECTION),
      where('userId1', '==', userId)
    );

    const q2 = query(
      collection(db, CONNECTIONS_COLLECTION),
      where('userId2', '==', userId)
    );

    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    return [
      ...snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() } as Connection)),
      ...snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as Connection))
    ];
  } catch (error) {
    console.error('Error getting connections:', error);
    throw error;
  }
}

/**
 * Share WhatsApp contact (mark connection as shared)
 */
export async function shareWhatsApp(connectionId: string): Promise<void> {
  try {
    const connRef = doc(db, CONNECTIONS_COLLECTION, connectionId);
    await updateDoc(connRef, {
      whatsappShared: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error sharing WhatsApp:', error);
    throw error;
  }
}

/**
 * Check if a connection exists between two users
 */
export async function getConnectionBetweenUsers(userId1: string, userId2: string): Promise<Connection | null> {
  try {
    // Query for connections where userId1 is either user and userId2 is the other
    const q1 = query(
      collection(db, CONNECTIONS_COLLECTION),
      where('userId1', '==', userId1),
      where('userId2', '==', userId2)
    );

    const q2 = query(
      collection(db, CONNECTIONS_COLLECTION),
      where('userId1', '==', userId2),
      where('userId2', '==', userId1)
    );

    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    // Check first direction
    if (!snapshot1.empty) {
      const docSnap = snapshot1.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Connection;
    }

    // Check reverse direction
    if (!snapshot2.empty) {
      const docSnap = snapshot2.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Connection;
    }

    return null;
  } catch (error) {
    console.error('Error checking connection:', error);
    throw error;
  }
}

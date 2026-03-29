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
    console.log('sendRequest called with:', { fromUserId, toUserId, purpose, message: message.trim() });

    // Validate user IDs
    if (!fromUserId || !toUserId) {
      throw new Error('Invalid user IDs: both fromUserId and toUserId are required');
    }

    // Prevent sending request to self
    if (fromUserId === toUserId) {
      throw new Error('Cannot send request to yourself');
    }

    // Check if request already exists
    console.log('Checking for existing request...');
    const existingRequest = await checkExistingRequest(fromUserId, toUserId);
    if (existingRequest) {
      console.log('Existing request found:', existingRequest);
      throw new Error('A request already exists between these users');
    }

    console.log('No existing request, creating new request...');
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
    console.log('Request created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error sending request:', error);
    throw error;
  }
}

/**
 * Check if a PENDING request already exists between two users
 * Only pending requests block new requests; rejected/accepted requests don't
 */
export async function checkExistingRequest(
  fromUserId: string,
  toUserId: string
): Promise<Request | null> {
  try {
    console.log('checkExistingRequest:', { fromUserId, toUserId });

    // Check forward direction with pending status
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId),
      where('status', '==', 'pending')
    );

    console.log('Executing query 1 (forward, pending only)...');
    const snapshot = await getDocs(q);
    console.log('Query 1 results:', snapshot.size);

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data() as Request;
      console.log('Found pending request from', fromUserId, 'to', toUserId);
      return data;
    }

    // Check reverse direction with pending status
    const q2 = query(
      collection(db, REQUESTS_COLLECTION),
      where('fromUserId', '==', toUserId),
      where('toUserId', '==', fromUserId),
      where('status', '==', 'pending')
    );

    console.log('Executing query 2 (reverse, pending only)...');
    const snapshot2 = await getDocs(q2);
    console.log('Query 2 results:', snapshot2.size);

    if (!snapshot2.empty) {
      const data = snapshot2.docs[0].data() as Request;
      console.log('Found pending request from', toUserId, 'to', fromUserId);
      return data;
    }

    console.log('No existing pending request found');
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
    console.log('getUserRequests for userId:', userId);

    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where('toUserId', '==', userId)
    );

    const q2 = query(
      collection(db, REQUESTS_COLLECTION),
      where('fromUserId', '==', userId)
    );

    console.log('Executing parallel queries...');
    const [snapshot1, snapshot2] = await Promise.all([getDocs(q), getDocs(q2)]);

    console.log('Query 1 (toUserId):', snapshot1.size, 'documents');
    console.log('Query 2 (fromUserId):', snapshot2.size, 'documents');

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

    const sorted = allRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    console.log('Total requests found:', sorted.length);
    console.log('Requests:', sorted);
    return sorted;
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
    console.log('getIncomingRequests for userId:', userId);
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );

    console.log('Executing incoming requests query...');
    const snapshot = await getDocs(q);
    console.log('Incoming requests found:', snapshot.size);

    const requests = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
      } as Request;
    });

    console.log('Parsed incoming requests:', requests);
    return requests;
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
    console.log('acceptRequest called with:', { requestId, acceptorId });

    // Validate acceptorId
    if (!acceptorId) {
      throw new Error('Acceptor ID is required');
    }

    // Get the request first to verify permissions
    const requestRef = doc(db, REQUESTS_COLLECTION, requestId);
    console.log('Fetching request document...');
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      console.log('Request document does not exist');
      throw new Error('Request not found');
    }

    const request = requestSnap.data() as Request;
    console.log('Request data:', request);

    // Verify that the acceptor is the intended recipient (toUserId)
    if (request.toUserId !== acceptorId) {
      console.log('Authorization failed:', { requestToUserId: request.toUserId, acceptorId });
      throw new Error('You are not authorized to accept this request');
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      console.log('Request status is not pending:', request.status);
      throw new Error(`This request has already been ${request.status}`);
    }

    // Update request status
    console.log('Updating request status to accepted...');
    await updateDoc(requestRef, {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });
    console.log('Request updated');

    // Create connection
    const connectionData = {
      userId1: request.fromUserId,
      userId2: request.toUserId,
      requestId,
      whatsappShared: false,
      createdAt: serverTimestamp()
    };

    console.log('Creating connection...');
    const connRef = await addDoc(collection(db, CONNECTIONS_COLLECTION), connectionData);
    console.log('Connection created with ID:', connRef.id);

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

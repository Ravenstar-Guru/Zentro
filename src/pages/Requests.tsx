import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Request, User } from '../types';
import { Check, X, Clock, ArrowRight } from 'lucide-react';

export const Requests: React.FC = () => {
  const { currentUser } = useAuth();
  const { getRequests, acceptRequest, rejectRequest, getUser } = useData();

  const [requests, setRequests] = useState<Request[]>([]);
  const [userCache, setUserCache] = useState<Map<string, User>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRequests();
  }, [currentUser]);

  const loadRequests = async () => {
    if (!currentUser) return;
    try {
      const allRequests = await getRequests(currentUser.uid);
      setRequests(allRequests);

      // Fetch user data for all involved users
      const userIds = new Set<string>();
      allRequests.forEach(req => {
        userIds.add(req.fromUserId);
        userIds.add(req.toUserId);
      });

      const userMap = new Map<string, User>();
      await Promise.all(
        Array.from(userIds).map(async (uid) => {
          try {
            const user = await getUser(uid);
            if (user) {
              userMap.set(uid, user);
            }
          } catch (error) {
            console.error(`Failed to fetch user ${uid}:`, error);
          }
        })
      );
      setUserCache(userMap);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplay = (userId: string) => {
    return userCache.get(userId);
  };

  const incomingRequests = useMemo(() =>
    requests.filter(r => r.toUserId === currentUser?.uid && r.status === 'pending'),
    [requests, currentUser]
  );

  const outgoingRequests = useMemo(() =>
    requests.filter(r => r.fromUserId === currentUser?.uid),
    [requests, currentUser]
  );

  const handleAccept = async (requestId: string) => {
    if (!currentUser) return;
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      await acceptRequest(requestId, currentUser.uid);
      await loadRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleReject = async (requestId: string) => {
    if (!currentUser) return;
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      await rejectRequest(requestId, currentUser.uid);
      await loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const getPurposeIcon = (purpose: string) => {
    switch (purpose) {
      case 'learn_basics':
        return '📚';
      case 'long_term':
        return '🤝';
      case 'quick_help':
        return '⚡';
      default:
        return '#'; // Using Hash from lucide-react differently
    }
  };

  const getPurposeLabel = (purpose: string): string => {
    return purpose.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const tabs = [
    { id: 'incoming' as const, label: 'Incoming', count: incomingRequests.length },
    { id: 'outgoing' as const, label: 'Outgoing', count: outgoingRequests.length }
  ];

  const currentList = activeTab === 'incoming' ? incomingRequests : outgoingRequests;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} hover={false}>
            <div className="animate-pulse flex items-center gap-4">
              <div className="w-14 h-14 bg-space-800/50 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-space-800/50 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-space-800/50 rounded w-1/4"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-space-100">Requests</h1>
          <p className="text-space-400 mt-1">
            Manage your connections
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 bg-space-900/50 p-1 rounded-xl backdrop-blur-sm">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-glow-cyan/20 to-glow-purple/20 text-space-100 border border-glow-cyan/30 shadow-glow-cyan/20'
                : 'text-space-400 hover:text-space-200'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-glow-cyan/20 text-glow-cyan rounded-full text-xs border border-glow-cyan/30">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {currentList.length === 0 ? (
        <Card hover={false} className="text-center py-12">
          <div className="w-16 h-16 bg-space-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-space-500" />
          </div>
          <h3 className="text-lg font-semibold text-space-200 mb-2">
            No {activeTab} requests
          </h3>
          <p className="text-space-400">
            {activeTab === 'incoming'
              ? 'When someone wants to connect, their request will appear here.'
              : "You haven't sent any connection requests yet."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentList.map((request, index) => {
            const otherUserId = activeTab === 'incoming' ? request.fromUserId : request.toUserId;
            const otherUser = getUserDisplay(otherUserId);

            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="relative">
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <div className="avatar-ring w-14 h-14 rounded-full flex-shrink-0 overflow-hidden border-2 border-glow-cyan/50 shadow-glow-cyan/30">
                      {otherUser?.photoURL ? (
                        <img
                          src={otherUser.photoURL}
                          alt={otherUser.displayName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-space-100 font-bold text-lg bg-gradient-to-br from-glow-cyan/30 to-glow-purple/30">
                          {otherUser?.displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-space-200 truncate">
                          {otherUser?.displayName || 'Unknown User'}
                        </h4>
                        <span className="text-xs px-2 py-0.5 bg-glow-purple/20 text-glow-purple border border-glow-purple/30 rounded-full">
                          {getPurposeLabel(request.purpose)}
                        </span>
                        {request.status === 'accepted' && (
                          <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full">
                            Accepted
                          </span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">
                            Rejected
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-space-400 line-clamp-2 mb-3">
                        {request.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-space-500">
                          {request.createdAt instanceof Date
                            ? request.createdAt.toLocaleDateString()
                            : new Date(request.createdAt as any).toLocaleDateString()}
                        </span>

                        {/* Actions */}
                        {activeTab === 'incoming' && request.status === 'pending' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleReject(request.id)}
                              loading={processingIds.has(request.id)}
                              icon={<X className="w-4 h-4" />}
                              className="border-space-700/50"
                            >
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              variant="glow"
                              onClick={() => handleAccept(request.id)}
                              loading={processingIds.has(request.id)}
                              icon={<Check className="w-4 h-4" />}
                            >
                              Accept
                            </Button>
                          </div>
                        ) : activeTab === 'outgoing' && request.status === 'pending' ? (
                          <div className="flex items-center gap-2 text-sm text-space-400">
                            <Clock className="w-4 h-4" />
                            <span>Pending</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            as="link"
                            to={`/profile?uid=${otherUserId}`}
                            icon={<ArrowRight className="w-4 h-4" />}
                          >
                            View Profile
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Request } from '../types';
import { Check, X, Clock, ArrowRight, Hash } from 'lucide-react';

export const Requests: React.FC = () => {
  const { currentUser } = useAuth();
  const { getRequests, acceptRequest, rejectRequest } = useData();

  const [requests, setRequests] = useState<Request[]>([]);
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
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
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
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      await rejectRequest(requestId);
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
        return <Hash className="w-4 h-4" />;
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
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your connections
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {currentList.length === 0 ? (
        <Card hover={false} className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No {activeTab} requests
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {activeTab === 'incoming'
              ? 'When someone wants to connect, their request will appear here.'
              : "You haven't sent any connection requests yet."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentList.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover className="relative">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex-shrink-0 overflow-hidden">
                    {/* Would show user photo here */}
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                      {activeTab === 'incoming' ? 'T' : 'U'}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {activeTab === 'incoming' ? 'Teacher User' : request.toUserId?.slice(0, 8)}
                      </h4>
                      <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                        {getPurposeLabel(request.purpose)}
                      </span>
                      {request.status === 'accepted' && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                          Accepted
                        </span>
                      )}
                      {request.status === 'rejected' && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
                          Rejected
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {request.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
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
                          >
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAccept(request.id)}
                            loading={processingIds.has(request.id)}
                            icon={<Check className="w-4 h-4" />}
                          >
                            Accept
                          </Button>
                        </div>
                      ) : activeTab === 'outgoing' && request.status === 'pending' ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>Pending</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          as="a"
                          href={`/profile?id=${activeTab === 'incoming' ? request.fromUserId : request.toUserId}`}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;

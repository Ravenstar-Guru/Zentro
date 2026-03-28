import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Connection } from '../types';
import { Users, Phone, MessageCircle, AlertCircle, Check } from 'lucide-react';

export const Connections: React.FC = () => {
  const { currentUser } = useAuth();
  const { getConnections, shareWhatsApp } = useData();
  const navigate = useNavigate();

  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharingIds, setSharingIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConnections();
  }, [currentUser]);

  const loadConnections = async () => {
    if (!currentUser) return;
    try {
      const conns = await getConnections(currentUser.uid);
      setConnections(conns);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareWhatsApp = async (connection: Connection) => {
    if (!currentUser) return;

    // Determine which user ID is NOT the current user
    const otherUserId = connection.userId1 === currentUser.uid ? connection.userId2 : connection.userId1;

    setSharingIds(prev => new Set(prev).add(connection.id));
    try {
      await shareWhatsApp(connection.id);
      setMessage({ type: 'success', text: 'WhatsApp contact shared successfully!' });

      // Would typically open WhatsApp here with phone number
      // For now, we just mark it as shared
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error sharing WhatsApp:', error);
      setMessage({ type: 'error', text: 'Failed to share contact. Please try again.' });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } finally {
      setSharingIds(prev => {
        const next = new Set(prev);
        next.delete(connection.id);
        return next;
      });
    }
  };

  // Placeholder for getting user details - in real app, we'd fetch user data
  // For now, we'll show connection data only
  const placeholderNames = connections.map((_, i) => `Connection ${i + 1}`);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Connections
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          People you've connected with through Zentro
        </p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        </motion.div>
      )}

      {connections.length === 0 ? (
        <Card hover={false} className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No connections yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Accept connection requests and build your network.
          </p>
          <Button onClick={() => navigate('/requests')}>
            View Requests
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {connections.map((connection, index) => (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover className="relative">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-xl">
                    {placeholderNames[index]?.charAt(0) || 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {placeholderNames[index]}
                      </h4>
                      <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                        Connected
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Connected on{' '}
                      {connection.createdAt instanceof Date
                        ? connection.createdAt.toLocaleDateString()
                        : new Date(connection.createdAt as any).toLocaleDateString()}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleShareWhatsApp(connection)}
                        loading={sharingIds.has(connection.id)}
                        disabled={connection.whatsappShared}
                        icon={<Phone className="w-4 h-4" />}
                      >
                        {connection.whatsappShared ? 'Shared' : 'Share WhatsApp'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<MessageCircle className="w-4 h-4" />}
                        onClick={() => navigate('/profile')}
                      >
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Note */}
      <Card hover={false} className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">How connections work</p>
            <ul className="space-y-1 list-disc list-inside text-blue-700 dark:text-blue-300">
              <li>Accept a request to create a connection</li>
              <li>Once connected, you can share contact information</li>
              <li>WhatsApp sharing enables direct messaging</li>
              <li>All connections are mutual and verified</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

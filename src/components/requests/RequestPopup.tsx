import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { sendRequest } from '../../services/requests';
import { CONNECTION_PURPOSE_OPTIONS } from '../../utils/constants';
import { ConnectionPurpose } from '../../types';
import { MessageSquare, Send } from 'lucide-react';

interface RequestPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  toUserId: string;
  toUserName: string;
}

export const RequestPopup: React.FC<RequestPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  toUserId,
  toUserName
}) => {
  const { currentUser } = useAuth();
  const [purpose, setPurpose] = useState<ConnectionPurpose>('learn_basics');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getPurposeLabel = (value: ConnectionPurpose): string => {
    const option = CONNECTION_PURPOSE_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
  };

  const getPurposeDescription = (value: ConnectionPurpose): string => {
    const option = CONNECTION_PURPOSE_OPTIONS.find(opt => opt.value === value);
    return option?.description || '';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      await sendRequest(
        currentUser.uid,
        toUserId,
        purpose,
        message.trim() || `Hi! I'd like to connect with you about your skills.`
      );

      setSuccess(true);
      setTimeout(() => {
        onClose();
        onSubmit();
        // Reset form after close animation
        setTimeout(() => {
          setSuccess(false);
          setPurpose('learn_basics');
          setMessage('');
        }, 300);
      }, 1500);
    } catch (err: any) {
      console.error('Failed to send request:', err);
      if (err.message.includes('already exists')) {
        setError('You have already sent a request to this user');
      } else {
        setError('Failed to send request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form
      setTimeout(() => {
        setPurpose('learn_basics');
        setMessage('');
        setError(null);
        setSuccess(false);
      }, 300);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Connect Request" size="md">
      <form onSubmit={handleSubmit}>
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Request Sent!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your connection request has been sent to {toUserName}
            </p>
          </motion.div>
        ) : (
          <>
            {/* Recipient */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Connecting with:
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {toUserName}
              </p>
            </div>

            {/* Purpose Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Why do you want to connect?
              </label>
              <div className="space-y-2">
                {CONNECTION_PURPOSE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPurpose(option.value as ConnectionPurpose)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      purpose === option.value
                        ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {purpose === option.value && (
                        <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message (optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Add a personal note to your request..."
                  rows={4}
                  className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                A friendly message increases the chance of acceptance
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1 gap-2"
              >
                <Send className="w-4 h-4" />
                Send Request
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};

export default RequestPopup;

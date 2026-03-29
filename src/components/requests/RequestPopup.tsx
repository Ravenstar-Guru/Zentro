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
    if (!currentUser) {
      setError('You must be logged in to send a request');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Sending request:', {
        fromUserId: currentUser.uid,
        toUserId,
        purpose,
        message: message.trim() || 'Hi! I\'d like to connect with you about your skills.'
      });

      await sendRequest(
        currentUser.uid,
        toUserId,
        purpose,
        message.trim() || `Hi! I'd like to connect with you about your skills.`
      );

      console.log('Request sent successfully');
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
      } else if (err.message.includes('permission') || err.message.includes('not authorized')) {
        setError('Permission denied. Please ensure you are logged in.');
      } else {
        setError(`Failed to send request: ${err.message}`);
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
            <div className="w-16 h-16 bg-glow-green/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-glow-green/30">
              <svg className="w-8 h-8 text-glow-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-space-100 mb-2">
              Request Sent!
            </h3>
            <p className="text-space-400">
              Your connection request has been sent to {toUserName}
            </p>
          </motion.div>
        ) : (
          <>
            {/* Recipient */}
            <div className="mb-4 p-4 bg-space-900/50 rounded-xl border border-space-800/50">
              <p className="text-sm text-space-400 mb-1">
                Connecting with:
              </p>
              <p className="font-semibold text-space-200">
                {toUserName}
              </p>
            </div>

            {/* Purpose Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-space-300 mb-2">
                Why do you want to connect?
              </label>
              <div className="space-y-2">
                {CONNECTION_PURPOSE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPurpose(option.value as ConnectionPurpose)}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-center ${
                      purpose === option.value
                        ? 'bg-glow-cyan/20 text-glow-cyan border-2 border-glow-cyan/30'
                        : 'bg-space-800/50 text-space-300 hover:bg-space-700/50 border-2 border-transparent'
                    }`}
                  >
                    {purpose === option.value && (
                      <div className="w-4 h-4 rounded-full bg-glow-cyan flex items-center justify-center flex-shrink-0 mr-2">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {option.label}
                      </p>
                      <p className="text-sm text-space-400">
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-space-300 mb-2">
                Message (optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-space-500" />
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Add a personal note to your request..."
                  rows={3}
                  className="input-field pl-10 resize-none"
                />
              </div>
              <p className="text-xs text-space-500 mt-1">
                A friendly message increases the chance of acceptance
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 border-space-700/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1 gap-2 bg-gradient-to-r from-glow-cyan to-glow-purple hover:from-glow-blue hover:to-glow-purple shadow-glow-cyan/30"
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

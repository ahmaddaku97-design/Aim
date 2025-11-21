import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Circle } from 'lucide-react';
import { Friend } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, friends }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-3/4 max-w-xs bg-zinc-950 border-r border-zinc-800 z-50 p-5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Friends</h2>
              <button onClick={onClose} className="text-zinc-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {friends.length === 0 ? (
                <div className="text-center text-zinc-500 mt-10">
                  <p>No friends yet.</p>
                  <p className="text-xs mt-1">Search users to add them!</p>
                </div>
              ) : (
                friends.map((friend) => (
                  <div key={friend.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 transition-colors">
                    <div className="relative">
                      <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full bg-zinc-800" />
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-950 ${friend.status === 'online' ? 'bg-green-500' : 'bg-zinc-500'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-white">{friend.name}</h3>
                      <p className="text-xs text-zinc-500">{friend.status}</p>
                    </div>
                    <button className="text-zinc-400 hover:text-white">
                      <MessageSquare size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-zinc-900 text-center text-xs text-zinc-600">
              Aim Messenger v1.0
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
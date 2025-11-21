
import React, { useState } from 'react';
import { Search, Sidebar, UserPlus, Coins } from 'lucide-react';
import { UserData, Friend } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface HeaderProps {
  user: UserData;
  onToggleSidebar: () => void;
  onAddFriend: (friend: Friend) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onToggleSidebar, onAddFriend }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const qStr = e.target.value;
    setSearchQuery(qStr);
    
    if (qStr.length > 1) {
      setIsSearching(true);
      
      // Simple search by name match
      // Note: Firestore doesn't support native full-text search on client SDK easily
      // We will use a simple startAt/endAt strategy or just filter by exact/prefix for now
      const usersRef = collection(db, 'users');
      const q = query(
          usersRef, 
          where('name', '>=', qStr), 
          where('name', '<=', qStr + '\uf8ff'),
          limit(5)
      );

      try {
        const querySnapshot = await getDocs(q);
        const results: Friend[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.email !== user.email) { // Don't show self
                results.push({
                    id: doc.id,
                    name: data.name,
                    avatar: data.avatar,
                    status: 'online' // Simplified
                });
            }
        });
        setSearchResults(results);
      } catch (error) {
        console.error("Search error", error);
      }
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleAddUser = (friend: Friend) => {
    onAddFriend(friend);
    setSearchQuery('');
    setIsSearching(false);
  };

  return (
    <header className="px-5 pt-6 pb-2 flex items-center gap-3 bg-black sticky top-0 z-40">
      <button 
        onClick={onToggleSidebar}
        className="text-zinc-400 hover:text-white transition-colors relative"
      >
        <Sidebar size={20} />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
      
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
        <input 
            type="text" 
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search users..." 
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 focus:bg-zinc-900 transition-all"
        />
        
        <AnimatePresence>
          {isSearching && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50"
            >
              {searchResults.length > 0 ? (
                searchResults.map(result => (
                  <div key={result.id} className="flex items-center justify-between p-3 hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={result.avatar} alt={result.name} className="w-8 h-8 rounded-full bg-zinc-800" />
                      <span className="text-sm font-medium text-zinc-200">{result.name}</span>
                    </div>
                    <button 
                      onClick={() => handleAddUser(result)}
                      className="p-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                      <UserPlus size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-zinc-500 text-sm">No users found</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5">
        <Coins size={14} className="text-yellow-500" fill="currentColor" />
        <span className="text-xs font-bold text-white">{user.coins?.toLocaleString() || 0}</span>
      </div>
      
      <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
          <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
      </div>
    </header>
  );
};

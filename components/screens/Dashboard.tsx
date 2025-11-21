
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Crown } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../ui/Button';
import { UserData } from '../../types';

interface DashboardProps {
  user: UserData;
  onUpdateUser: (updates: Partial<UserData>) => void;
}

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  streak: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onUpdateUser }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  useEffect(() => {
    // Fetch Leaderboard from Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('streak', 'desc'), limit(10));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: LeaderboardUser[] = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        data.push({ 
            id: doc.id, 
            name: userData.name, 
            avatar: userData.avatar, 
            streak: userData.streak || 0 
        });
      });
      setLeaderboard(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Check if checked in today
    if (user.lastCheckIn) {
      const lastDate = new Date(user.lastCheckIn).toDateString();
      const today = new Date().toDateString();
      setIsCheckedIn(lastDate === today);
    } else {
        setIsCheckedIn(false);
    }
  }, [user]);

  const handleCheckIn = () => {
    const newStreak = (user.streak || 0) + 1;
    onUpdateUser({
      streak: newStreak,
      lastCheckIn: new Date().toISOString()
    });
    setIsCheckedIn(true);
  };

  return (
    <div className="p-5 space-y-8 pb-28">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, {user.name.split(' ')[0]}!</h1>
        <p className="text-zinc-400">Here's a look at your progress and the community.</p>
      </motion.div>

      {/* Streak Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 space-y-6"
      >
        <div className="flex items-start gap-4">
            <div className="p-2.5 bg-zinc-900 rounded-xl text-white border border-zinc-800/50">
                <Flame size={20} fill="currentColor" className="text-orange-500" />
            </div>
            <div>
                <h3 className="font-semibold text-white text-lg">Daily Streak</h3>
                <p className="text-sm text-zinc-500">Check in every day to build your streak.</p>
            </div>
        </div>
        
        <div className="text-center py-2">
            <div className="text-6xl font-bold text-white tracking-tighter mb-1">{user.streak}</div>
            <div className="text-sm font-medium text-zinc-500 uppercase tracking-wider">days</div>
        </div>

        <Button 
          variant="primary" 
          className={`w-full font-semibold ${isCheckedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleCheckIn}
          disabled={isCheckedIn}
        >
          {isCheckedIn ? 'Checked In Today' : 'Daily Check-in'}
        </Button>
      </motion.div>

      {/* Leaderboard Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 space-y-4"
      >
         <div className="space-y-1">
            <h3 className="font-semibold text-white text-lg">Leaderboard</h3>
            <p className="text-sm text-zinc-500">See who is leading the charge.</p>
         </div>

         <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div 
                key={entry.id} 
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  entry.name === user.name 
                    ? 'bg-zinc-800/50 border-zinc-700' 
                    : 'bg-zinc-900/20 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 text-center font-bold text-zinc-500">
                    {index === 0 ? <Crown size={20} className="text-yellow-500 inline" fill="currentColor"/> : index + 1}
                  </div>
                  <img src={entry.avatar} alt={entry.name} className="w-8 h-8 rounded-full bg-zinc-800" />
                  <span className={`text-sm font-medium ${entry.name === user.name ? 'text-white' : 'text-zinc-300'}`}>
                    {entry.name} {entry.name === user.name && '(You)'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-orange-500">
                   <Flame size={14} fill="currentColor" />
                   <span className="font-bold text-sm">{entry.streak}</span>
                </div>
              </div>
            ))}
         </div>
      </motion.div>
    </div>
  );
}

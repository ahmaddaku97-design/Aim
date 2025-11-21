
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, CheckSquare, Square, Target, Gift } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { SocialButtons } from './SocialButtons';
import { AuthView } from '../../types';

interface SignupFormProps {
  onNavigate: (view: AuthView) => void;
  onSignupSuccess: (email: string, referralCode?: string) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onNavigate, onSignupSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isValidLength, setIsValidLength] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReferralCode = () => {
    return 'AIM-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Check Referral Code and apply bonus
      let initialCoins = 0;
      if (referralCode.trim()) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("referralCode", "==", referralCode.trim()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          initialCoins = 500; // Bonus for new user
          // Bonus for referrer
          const referrerDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'users', referrerDoc.id), {
             coins: increment(1000)
          });
        }
      }

      // 3. Create Firestore Document
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(' ', '')}`,
        streak: 0,
        coins: initialCoins,
        referralCode: generateReferralCode(),
        createdAt: new Date().toISOString(),
        friendsList: []
      });

      onSignupSuccess(email, referralCode);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md space-y-8"
    >
      <div className="space-y-2 text-center sm:text-left">
        <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: 0.1 }}
           className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 mb-4 border border-zinc-800"
        >
          <Target className="w-6 h-6 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Join the movement
        </h1>
        <p className="text-zinc-400">
          Chat, get fit, and earn rewards with Aim.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input 
            placeholder="Enter your name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User size={20} />}
            required
          />
          <Input 
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={20} />}
            required
          />
          <Input 
            placeholder="••••••••"
            isPassword
            value={password}
            onChange={(e) => {
                setPassword(e.target.value);
                setIsValidLength(e.target.value.length >= 8);
            }}
            icon={<Lock size={20} />}
            required
          />
          <Input 
            placeholder="Referral Code (Optional)"
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            icon={<Gift size={20} />}
          />
        </div>

        {error && (
            <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
            </div>
        )}

        <div className="flex items-center gap-2 text-sm text-zinc-400">
           {isValidLength ? (
              <CheckSquare size={18} className="text-white" />
            ) : (
              <Square size={18} />
            )}
            <span>Must be at least 8 characters</span>
        </div>

        <Button isLoading={isLoading}>Sign Up</Button>
        
        <SocialButtons action="Sign up" />

        <div className="text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={() => onNavigate(AuthView.LOGIN)}
            className="text-white font-semibold hover:text-zinc-300 transition-colors"
          >
            Log in
          </button>
        </div>
      </form>
    </motion.div>
  );
};

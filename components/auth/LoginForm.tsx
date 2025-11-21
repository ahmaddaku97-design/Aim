
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, CheckSquare, Square, Target } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { SocialButtons } from './SocialButtons';
import { AuthView } from '../../types';

interface LoginFormProps {
  onNavigate: (view: AuthView) => void;
  onLogin: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin(); // App state handles the redirect
    } catch (err: any) {
      setError('Invalid email or password');
      console.error(err);
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
          Log in to Aim
        </h1>
        <p className="text-zinc-400">
          Welcome back! Track your fitness and earnings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
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
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={20} />}
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <button 
            type="button"
            onClick={() => setRemember(!remember)}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {remember ? (
              <CheckSquare size={18} className="text-white" />
            ) : (
              <Square size={18} />
            )}
            Remember for 30 days
          </button>
          <button type="button" className="text-zinc-400 hover:text-white font-medium transition-colors">
            Forgot password
          </button>
        </div>

        <Button isLoading={isLoading}>Log In</Button>
        
        <SocialButtons action="Log in" />

        <div className="text-center text-sm text-zinc-500">
          Don't have an account?{' '}
          <button 
            type="button"
            onClick={() => onNavigate(AuthView.SIGNUP)}
            className="text-white font-semibold hover:text-zinc-300 transition-colors"
          >
            Sign up
          </button>
        </div>
      </form>
    </motion.div>
  );
};

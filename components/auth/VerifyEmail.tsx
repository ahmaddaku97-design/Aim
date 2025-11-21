import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Target } from 'lucide-react';
import { Button } from '../ui/Button';
import { AuthView } from '../../types';

interface VerifyEmailProps {
  email: string;
  onNavigate: (view: AuthView) => void;
  onLogin: () => void;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ email, onNavigate, onLogin }) => {
  const [code, setCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1);
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md space-y-8 text-center"
    >
      <div className="space-y-2">
         <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: 0.1 }}
           className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 mb-4 border border-zinc-800"
        >
          <Target className="w-6 h-6 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Check your email
        </h1>
        <p className="text-zinc-400">
          We sent a verification link to <span className="text-zinc-200 font-medium">{email || 'sara@cruz.com'}</span>
        </p>
      </div>

      <div className="flex justify-center gap-3 my-8">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputs.current[index] = el; }}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-14 h-14 text-center text-2xl font-bold bg-zinc-900 border border-zinc-800 rounded-xl focus:border-white focus:ring-1 focus:ring-white outline-none transition-all text-white"
          />
        ))}
      </div>

      <div className="space-y-6">
        <Button onClick={handleVerify} isLoading={isLoading}>
          Verify email
        </Button>

        <div className="space-y-4 text-sm">
          <p className="text-zinc-500">
            Didn't receive the email? <button className="text-white font-semibold hover:text-zinc-300 transition-colors">Click to resend</button>
          </p>

          <button 
            onClick={() => onNavigate(AuthView.LOGIN)}
            className="flex items-center justify-center w-full gap-2 text-zinc-400 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft size={16} />
            Back to log in
          </button>
        </div>
      </div>
    </motion.div>
  );
};
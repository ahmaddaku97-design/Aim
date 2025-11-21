import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, MonitorPlay } from 'lucide-react';
import { Button } from '../ui/Button';

export const Earn: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState('easypaisa');

  return (
    <div className="p-5 space-y-6 pb-28">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-bold text-white">Earn & Withdraw</h1>
        <p className="text-zinc-400 text-sm">Earn rewards by watching video ads and manage your earnings.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-6"
      >
        <div className="space-y-1">
            <h3 className="font-semibold text-white text-lg">Your Earnings</h3>
            <p className="text-sm text-zinc-500">Watch video ads to increase your balance.</p>
        </div>
        
        <div className="text-center py-4">
            <div className="text-5xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
                <span className="text-zinc-500 text-3xl font-normal">$</span>
                3.4500
            </div>
            <div className="text-xs font-medium text-zinc-500 mt-2">Available Balance (USD)</div>
        </div>

        <Button variant="primary" icon={<MonitorPlay size={18} />}>
            Watch a Video Ad
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-6"
      >
        <div className="space-y-1">
            <h3 className="font-semibold text-white text-lg">Withdraw Funds</h3>
            <p className="text-xs text-zinc-500">Minimum withdrawal is $10.00. Requests are processed within 3-5 business days.</p>
        </div>

        <div className="space-y-3">
            <label className="text-xs font-medium text-white">Available Methods:</label>
            <div className="flex gap-3">
                {['Easypaisa', 'JazzCash'].map((method) => (
                    <button
                        key={method}
                        onClick={() => setSelectedMethod(method.toLowerCase())}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                            selectedMethod === method.toLowerCase()
                            ? 'bg-zinc-800 border-zinc-600 text-white'
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                    >
                        {method}
                    </button>
                ))}
            </div>
        </div>

        <button className="w-full py-3.5 px-4 rounded-xl font-medium text-zinc-400 bg-zinc-800/50 border border-zinc-800 cursor-not-allowed text-sm md:text-base mt-2">
            Withdraw Now
        </button>
      </motion.div>
    </div>
  );
};
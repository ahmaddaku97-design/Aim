import React from 'react';
import { motion } from 'framer-motion';
import { Box } from 'lucide-react';

export const PlanLibrary: React.FC = () => {
  const categories = ['All', 'Workout', 'Skincare', 'Haircare', 'Diet'];

  return (
    <div className="p-5 space-y-6 pb-28">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-bold text-white">Plan Library</h1>
        <p className="text-zinc-400 text-sm">Discover plans created by the Aimm community.</p>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
        {categories.map((cat, i) => (
          <button 
            key={cat}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              i === 0 
                ? 'bg-zinc-800 text-white' 
                : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="border border-dashed border-zinc-800 rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-4 bg-zinc-900/10 min-h-[300px]"
      >
        <Box size={48} className="text-zinc-600" />
        <div className="space-y-1">
            <p className="text-zinc-300 font-medium">No plans found.</p>
            <p className="text-sm text-zinc-500">Create a new plan to get started!</p>
        </div>
      </motion.div>
    </div>
  );
};
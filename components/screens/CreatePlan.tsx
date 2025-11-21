import React from 'react';
import { motion } from 'framer-motion';
import { Wand2, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const CreatePlan: React.FC = () => {
  return (
    <div className="p-5 space-y-6 pb-28">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-bold text-white">Create a New Plan</h1>
        <p className="text-zinc-400 text-sm">Bring your ideas to life. Describe your plan and let AI help build it.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 space-y-5"
      >
        <h2 className="text-lg font-semibold text-white">Create Your Plan</h2>
        <p className="text-xs text-zinc-500 -mt-4">Fill in the details and let AI assist you.</p>

        <div className="space-y-4">
          <Input 
             label="Plan Title"
             placeholder="e.g., Morning Workout"
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 ml-1">Category</label>
            <div className="relative">
              <select className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-100 rounded-xl py-3.5 pl-4 pr-10 appearance-none focus:outline-none focus:border-white/50 focus:bg-zinc-900 transition-all cursor-pointer">
                <option>Select a category</option>
                <option>Workout</option>
                <option>Diet</option>
                <option>Skincare</option>
                <option>Haircare</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 ml-1">Plan Description</label>
            <textarea 
              rows={4}
              className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-100 rounded-xl p-4 placeholder:text-zinc-600 focus:outline-none focus:border-white/50 focus:bg-zinc-900 transition-all resize-none"
              placeholder="Describe your plan in natural language. For example: 'A 3-day workout plan for beginners focusing on full-body strength.'"
            />
          </div>

          <Button icon={<Wand2 size={18} />}>
            Generate Steps with AI
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
         <h2 className="text-lg font-semibold text-white">Generated Steps</h2>
         <p className="text-xs text-zinc-500 -mt-3">Your AI-generated plan steps will appear here.</p>

         <div className="border border-dashed border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-center gap-4 bg-zinc-900/20">
            <Wand2 size={40} className="text-zinc-700" />
            <div className="space-y-1">
                <p className="text-zinc-400 font-medium">Your steps are waiting to be created.</p>
                <p className="text-xs text-zinc-600">Fill out the form and click generate.</p>
            </div>
         </div>
      </motion.div>
    </div>
  );
};
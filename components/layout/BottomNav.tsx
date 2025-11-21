import React from 'react';
import { Home, Compass, Plus, MessageCircle, User } from 'lucide-react';
import { MainTab } from '../../types';

interface BottomNavProps {
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'plans', icon: Compass, label: 'Plans' },
    { id: 'add', icon: Plus, label: 'Create', isSpecial: true },
    { id: 'social', icon: MessageCircle, label: 'Social' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-900 z-50 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-between px-6 py-2">
        {navItems.map((item) => {
          if (item.isSpecial) {
            return (
              <div key={item.id} className="relative -top-5">
                <button
                  onClick={() => onTabChange('add')} 
                  className="bg-white text-black rounded-full p-3.5 shadow-lg shadow-white/20 hover:scale-105 transition-transform active:scale-95"
                >
                  <item.icon size={24} strokeWidth={2.5} />
                </button>
              </div>
            );
          }
          
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as MainTab)}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                isActive ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
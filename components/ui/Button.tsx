import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'social' | 'ghost';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon,
  className = '',
  ...props 
}) => {
  const baseStyles = "w-full py-3.5 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-white text-black shadow-lg shadow-white/10 hover:bg-zinc-200 border border-transparent",
    social: "bg-zinc-900 text-zinc-200 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {!isLoading && icon}
      {children}
    </button>
  );
};
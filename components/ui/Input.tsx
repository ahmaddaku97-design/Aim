import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  icon, 
  isPassword, 
  className = '', 
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type;

  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-xs font-medium text-zinc-400 ml-1">{label}</label>}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">
          {icon}
        </div>
        <input
          type={inputType}
          className={`w-full bg-zinc-900/50 border border-zinc-800 text-zinc-100 rounded-xl py-3.5 pl-11 pr-4 placeholder:text-zinc-600 focus:outline-none focus:border-white/50 focus:bg-zinc-900 transition-all duration-200 ${isPassword ? 'pr-12' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};
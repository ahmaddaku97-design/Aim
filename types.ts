
export enum AuthView {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  VERIFY = 'VERIFY'
}

export type MainTab = 'dashboard' | 'plans' | 'add' | 'social' | 'profile';

export interface UserData {
  name: string;
  email: string;
  avatar: string;
  streak: number;
  lastCheckIn?: string; // ISO date string
  coins: number;
  referralCode: string;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  createdBy: string;
  messages: Message[];
}

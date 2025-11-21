
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, HelpCircle, Music, Github, LogOut, Sun, Coins, Share2, Wallet, ArrowLeft, Copy, Check, Banknote, ArrowRightLeft } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../../lib/firebase';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { UserData } from '../../types';

interface ProfileProps {
  user: UserData;
  onUpdateUser: (updates: Partial<UserData>) => void;
  onLogout: () => void;
}

type ProfileView = 'menu' | 'referral' | 'exchange';

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onLogout }) => {
  const [currentView, setCurrentView] = useState<ProfileView>('menu');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email
  });
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Exchange State
  const [selectedMethod, setSelectedMethod] = useState<'easypaisa' | 'jazzcash'>('easypaisa');
  const [withdrawDetails, setWithdrawDetails] = useState({
    accountName: '',
    accountNumber: ''
  });
  const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdateUser(formData);
    setIsEditing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
          // Create a storage reference
          const storageRef = ref(storage, `avatars/${user.email}_${Date.now()}`);
          // Upload the file
          await uploadBytes(storageRef, file);
          // Get the download URL
          const downloadURL = await getDownloadURL(storageRef);
          // Update user profile
          onUpdateUser({ avatar: downloadURL });
      } catch (error) {
          console.error("Error uploading image:", error);
          alert("Failed to upload image");
      } finally {
          setUploading(false);
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((user.coins || 0) < 100000) return;

    setWithdrawStatus('loading');
    
    try {
      // 1. Deduct coins immediately
      const withdrawalAmount = 2800; // Rs
      const coinsToDeduct = 100000;
      
      onUpdateUser({ coins: (user.coins || 0) - coinsToDeduct });

      // 2. Create Withdrawal Request in Firestore
      await addDoc(collection(db, 'withdrawals'), {
        userId: user.email, // Using email as ID for admin to easily find
        userName: user.name,
        amount: withdrawalAmount,
        coinsDeducted: coinsToDeduct,
        method: selectedMethod,
        accountTitle: withdrawDetails.accountName,
        accountNumber: withdrawDetails.accountNumber,
        status: 'pending',
        timestamp: serverTimestamp(),
        userAvatar: user.avatar
      });

      setWithdrawStatus('success');
      setWithdrawDetails({ accountName: '', accountNumber: '' });
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      // Optional: Rollback coins if needed, though simple error alert is fine for this scope
      alert("Failed to process request. Please try again.");
      setWithdrawStatus('idle');
    }
  };

  const renderMenu = () => (
    <div className="p-5 space-y-6 pb-28">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-zinc-400 text-sm">Manage your account settings and preferences.</p>
      </motion.div>

      {/* Earning & Wallet Section */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setCurrentView('referral')}
          className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-zinc-900/50 transition-colors"
        >
          <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-500">
            <Share2 size={24} />
          </div>
          <span className="font-semibold text-white text-sm">Refer & Earn</span>
          <span className="text-[10px] text-zinc-400">Get 1000 Coins</span>
        </button>

        <button 
          onClick={() => setCurrentView('exchange')}
          className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-zinc-900/50 transition-colors"
        >
          <div className="p-3 bg-green-500/10 rounded-full text-green-500">
            <Wallet size={24} />
          </div>
          <span className="font-semibold text-white text-sm">Exchange</span>
          <span className="text-[10px] text-zinc-400">Coins to PKR</span>
        </button>
      </div>

      {/* Profile Editor */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 space-y-6"
      >
         <div className="space-y-1">
            <h3 className="font-semibold text-white text-lg">Profile Editor</h3>
            <p className="text-sm text-zinc-500">Update your public profile information.</p>
         </div>

         <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-800 relative">
                 <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                 {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-xs">...</div>}
            </div>
            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                  <Camera size={16} />
                  {uploading ? 'Uploading...' : 'Change Photo'}
              </button>
            </div>
         </div>

         <div className="space-y-4">
            <Input 
              label="Nickname" 
              value={formData.name} 
              onChange={(e) => {
                setFormData({...formData, name: e.target.value});
                setIsEditing(true);
              }}
            />
            <Input 
              label="Email" 
              value={formData.email}
              disabled
              className="opacity-50 cursor-not-allowed"
            />
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-2 w-32"
              >
                  <Button 
                    variant="primary" 
                    className="!py-2.5 !text-sm"
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
              </motion.div>
            )}
         </div>
      </motion.div>

      {/* Settings & Others */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 space-y-4">
         <h3 className="font-semibold text-white text-lg">Settings</h3>
         <div className="flex items-center justify-between p-3 hover:bg-zinc-900/50 rounded-xl transition-colors cursor-pointer">
            <span className="text-zinc-200 text-sm font-medium">Theme</span>
            <Sun size={18} className="text-zinc-400" />
         </div>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 space-y-4">
         <h3 className="font-semibold text-white text-lg">Support & Socials</h3>
         <div className="space-y-1">
            {[
                { icon: HelpCircle, label: 'Help & Support' },
                { icon: Music, label: 'Follow on TikTok' },
                { icon: Github, label: 'Star on GitHub' }
            ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-zinc-900/50 rounded-xl transition-colors cursor-pointer text-zinc-200">
                    <item.icon size={18} />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                </div>
            ))}
         </div>
      </div>

      <button 
        onClick={onLogout}
        className="w-full py-3 px-4 rounded-lg bg-red-900/20 text-red-400 border border-red-900/30 hover:bg-red-900/30 transition-colors font-medium text-sm flex items-center justify-center gap-2"
      >
        <LogOut size={16} />
        Log Out
      </button>
    </div>
  );

  const renderReferral = () => (
    <div className="p-5 space-y-6 pb-28 h-full flex flex-col">
      <div className="flex items-center gap-3">
         <button 
           onClick={() => setCurrentView('menu')}
           className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"
         >
            <ArrowLeft size={20} />
         </button>
         <h1 className="text-2xl font-bold text-white">Refer & Earn</h1>
      </div>

      <div className="flex-1 flex flex-col items-center text-center space-y-8 pt-6">
         <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/20">
             <Coins size={56} className="text-white" />
         </div>

         <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Invite Friends, Get Coins</h2>
            <p className="text-zinc-400 max-w-xs mx-auto">
               Share your referral link. You get <span className="text-yellow-500 font-bold">1,000 coins</span> and your friend gets <span className="text-yellow-500 font-bold">500 coins</span> upon signup.
            </p>
         </div>

         <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Your Referral Code</label>
            <div className="flex items-center gap-3">
               <div className="flex-1 bg-black/50 border border-zinc-800 rounded-xl py-3 px-4 font-mono text-lg font-bold tracking-wider text-center text-white">
                  {user.referralCode}
               </div>
               <button 
                 onClick={handleCopyCode}
                 className="p-3.5 bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors"
               >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
               </button>
            </div>
         </div>

         <div className="w-full pt-4">
             <Button icon={<Share2 size={18} />} onClick={() => alert('Sharing functionality would open native share sheet.')}>
                Share Link
             </Button>
         </div>
      </div>
    </div>
  );

  const renderExchange = () => {
    const coins = user.coins || 0;
    const canWithdraw = coins >= 100000;
    const progressPercent = Math.min((coins / 100000) * 100, 100);
    const pkrValue = (coins / 100000) * 2800;

    return (
      <div className="p-5 space-y-6 pb-28">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentView('menu')}
            className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
              <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white">Exchange</h1>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6">
           <div className="flex items-center justify-between">
               <div>
                  <p className="text-zinc-400 text-sm font-medium">Current Balance</p>
                  <div className="text-4xl font-bold text-white mt-1 flex items-center gap-2">
                     {coins.toLocaleString()} <Coins size={24} className="text-yellow-500" fill="currentColor" />
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-zinc-400 text-sm font-medium">Est. Value</p>
                  <div className="text-2xl font-bold text-green-500 mt-1">
                     Rs. {pkrValue.toFixed(0)}
                  </div>
               </div>
           </div>

           <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                 <span className={canWithdraw ? 'text-green-500' : 'text-zinc-500'}>Progress to Withdraw</span>
                 <span className="text-zinc-400">{progressPercent.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                 <div 
                   className={`h-full rounded-full transition-all duration-500 ${canWithdraw ? 'bg-green-500' : 'bg-yellow-500'}`}
                   style={{ width: `${progressPercent}%` }}
                 />
              </div>
              {!canWithdraw && (
                 <p className="text-xs text-red-400">
                    Need {(100000 - coins).toLocaleString()} more coins to withdraw.
                 </p>
              )}
           </div>

           <div className="p-3 bg-zinc-800/30 rounded-xl border border-zinc-800/50 flex items-center gap-3 text-xs text-zinc-400">
               <Banknote size={16} className="text-zinc-300" />
               <span>10,000 Coins = 280 Rs  |  100,000 Coins = 2,800 Rs</span>
           </div>
        </div>

        {/* Withdrawal Form */}
        {canWithdraw ? (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 space-y-5"
           >
              {withdrawStatus === 'success' ? (
                <div className="text-center py-10 space-y-4">
                   <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                      <Check size={32} />
                   </div>
                   <h3 className="text-xl font-bold text-white">Request Sent!</h3>
                   <p className="text-zinc-400 text-sm">
                     Your withdrawal request of Rs. 2,800 has been sent to the admin. It will be processed within 24-48 hours.
                   </p>
                   <Button onClick={() => setWithdrawStatus('idle')}>Back to Wallet</Button>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-white text-lg">Withdraw Details</h3>
                  <form onSubmit={handleWithdraw} className="space-y-4">
                      <div className="space-y-3">
                        <label className="text-xs font-medium text-zinc-400">Select Method</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedMethod('easypaisa')}
                                className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                                    selectedMethod === 'easypaisa'
                                    ? 'bg-green-900/20 border-green-500 text-green-500'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                            >
                                Easypaisa
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedMethod('jazzcash')}
                                className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                                    selectedMethod === 'jazzcash'
                                    ? 'bg-red-900/20 border-red-500 text-red-500'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                            >
                                JazzCash
                            </button>
                        </div>
                      </div>

                      <Input 
                        label="Account Title"
                        placeholder="Enter account holder name"
                        value={withdrawDetails.accountName}
                        onChange={(e) => setWithdrawDetails({...withdrawDetails, accountName: e.target.value})}
                        required
                      />
                      
                      <Input 
                        label="Account Number"
                        placeholder={`Enter ${selectedMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} number`}
                        type="number"
                        value={withdrawDetails.accountNumber}
                        onChange={(e) => setWithdrawDetails({...withdrawDetails, accountNumber: e.target.value})}
                        required
                      />

                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          isLoading={withdrawStatus === 'loading'}
                          icon={<ArrowRightLeft size={18} />}
                        >
                          Withdraw Rs. 2,800
                        </Button>
                        <p className="text-[10px] text-center text-zinc-500 mt-3">
                           100,000 coins will be deducted from your balance.
                        </p>
                      </div>
                  </form>
                </>
              )}
           </motion.div>
        ) : (
           <div className="border border-dashed border-zinc-800 rounded-2xl p-8 text-center space-y-2">
              <p className="text-zinc-300 font-medium">Withdrawal Locked</p>
              <p className="text-sm text-zinc-500">Reach 100,000 coins to unlock withdrawals.</p>
           </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {currentView === 'menu' && renderMenu()}
        {currentView === 'referral' && renderReferral()}
        {currentView === 'exchange' && renderExchange()}
      </motion.div>
    </AnimatePresence>
  );
};

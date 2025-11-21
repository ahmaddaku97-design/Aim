
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { VerifyEmail } from './components/auth/VerifyEmail';
import { BottomNav } from './components/layout/BottomNav';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/screens/Dashboard';
import { CreatePlan } from './components/screens/CreatePlan';
import { PlanLibrary } from './components/screens/PlanLibrary';
import { Social } from './components/screens/Social';
import { Profile } from './components/screens/Profile';
import { AuthView, MainTab, UserData, Friend } from './types';

const DEFAULT_USER: UserData = {
  name: 'New User',
  email: '',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=New',
  streak: 0,
  coins: 0,
  referralCode: '',
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AuthView>(AuthView.LOGIN);
  const [currentTab, setCurrentTab] = useState<MainTab>('dashboard');
  const [user, setUser] = useState<UserData>(DEFAULT_USER);
  const [userDocId, setUserDocId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUserDocId(firebaseUser.uid);
        setIsAuthenticated(true);
        // Real-time listener for User Data
        const unsubUser = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnapshot) => {
          if (docSnapshot.exists()) {
            setUser({ ...DEFAULT_USER, ...docSnapshot.data() as UserData });
          }
        });
        return () => unsubUser();
      } else {
        setIsAuthenticated(false);
        setUser(DEFAULT_USER);
        setUserDocId(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Friends Listener (Subcollection)
  useEffect(() => {
    if (!userDocId) return;
    
    const unsubFriends = onSnapshot(doc(db, 'users', userDocId), (docSnapshot) => {
        // In a real implementation, friends might be a subcollection. 
        // For simplicity, we are reading from a 'friends' array field if it exists, 
        // otherwise we would use onSnapshot(collection(db, 'users', userDocId, 'friends')...
        // Here assuming friends is managed separately or inside user object.
        // Let's implement a simple friends array in local state if not in DB,
        // Or fetch from a specific friends collection.
        // For this example, we will rely on the Header to add friends to a local list
        // synced with Firestore if we added a 'friends' field to UserData.
        // Implementing "Friends" as a field in UserData is easiest for this scope.
        if (docSnapshot.exists()) {
           const data = docSnapshot.data();
           if (data.friendsList) {
             setFriends(data.friendsList);
           }
        }
    });
    return () => unsubFriends();
  }, [userDocId]);


  const updateUser = async (updates: Partial<UserData>) => {
    if (!userDocId) return;
    try {
      await setDoc(doc(db, 'users', userDocId), updates, { merge: true });
    } catch (e) {
      console.error("Error updating user: ", e);
    }
  };

  const addFriend = async (friend: Friend) => {
    if (!userDocId) return;
    const newFriends = [...friends, friend];
    // Remove duplicates based on ID
    const uniqueFriends = newFriends.filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i);
    
    setFriends(uniqueFriends);
    updateUser({ friendsList: uniqueFriends } as any);
    setIsSidebarOpen(true);
  };

  const handleSignupSuccess = () => {
    // Firebase handles the auth state change automatically
    // We just need to show the main app
    setIsAuthenticated(true);
  };

  const handleLogin = () => {
    // Handled by onAuthStateChanged
  };

  const handleLogout = async () => {
    await auth.signOut();
    setCurrentView(AuthView.LOGIN);
    setCurrentTab('dashboard');
  };

  if (isLoading) {
     return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex justify-center">
        <div className="w-full max-w-md bg-black min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
           <Header 
             user={user} 
             onToggleSidebar={() => setIsSidebarOpen(true)} 
             onAddFriend={addFriend}
           />
           
           <Sidebar 
             isOpen={isSidebarOpen} 
             onClose={() => setIsSidebarOpen(false)} 
             friends={friends}
           />

           <main className="flex-1 overflow-y-auto scrollbar-hide">
             {currentTab === 'dashboard' && (
               <Dashboard user={user} onUpdateUser={updateUser} />
             )}
             {currentTab === 'plans' && <PlanLibrary />}
             {currentTab === 'add' && <CreatePlan />}
             {currentTab === 'social' && <Social user={user} />}
             {currentTab === 'profile' && (
               <Profile user={user} onUpdateUser={updateUser} onLogout={handleLogout} />
             )}
           </main>
           <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background ambient glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-800/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-800/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      
      {/* Main Content Card */}
      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {currentView === AuthView.LOGIN && (
            <LoginForm 
              key="login" 
              onNavigate={setCurrentView} 
              onLogin={handleLogin}
            />
          )}
          
          {currentView === AuthView.SIGNUP && (
            <SignupForm 
              key="signup" 
              onNavigate={setCurrentView}
              onSignupSuccess={handleSignupSuccess}
            />
          )}

          {currentView === AuthView.VERIFY && (
            <VerifyEmail 
              key="verify" 
              email={user.email} // Placeholder
              onNavigate={setCurrentView}
              onLogin={handleLogin}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;

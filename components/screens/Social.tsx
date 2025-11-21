
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Plus, Users, Hash, Send, LogIn } from 'lucide-react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, doc, setDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserData, Message, Room } from '../../types';

interface SocialProps {
  user: UserData;
}

export const Social: React.FC<SocialProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'world' | 'rooms'>('world');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Listen to World Messages
  useEffect(() => {
    if (activeTab === 'world' && !activeRoom) {
        // Limit to last 50 messages to be mobile friendly
        const q = query(collection(db, 'messages_world'), orderBy('timestamp', 'asc'), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs: Message[] = [];
        snapshot.forEach((doc) => {
            msgs.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(msgs);
        });
        return () => unsubscribe();
    }
  }, [activeTab, activeRoom]);

  // 2. Listen to Active Room Messages
  useEffect(() => {
    if (activeRoom) {
        const q = query(collection(db, 'rooms', activeRoom.id, 'messages'), orderBy('timestamp', 'asc'), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: Message[] = [];
            snapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() } as Message);
            });
            setMessages(msgs);
        });
        return () => unsubscribe();
    }
  }, [activeRoom]);

  // 3. Load Joined Rooms (Static list for now, could be improved with subcollection)
  useEffect(() => {
      // Ideally stored in user profile or subcollection. Using local storage for joined room IDs to map to Firestore query
      // For this demo, we will fetch ALL rooms (not scalable, but works for demo)
      const q = query(collection(db, 'rooms'), limit(20));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const r: Room[] = [];
          snapshot.forEach((doc) => {
              r.push({ id: doc.id, ...doc.data() } as Room);
          });
          setJoinedRooms(r);
      });
      return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (roomId?: string) => {
    if (!inputText.trim()) return;

    const newMessage = {
      senderId: user.email,
      senderName: user.name,
      senderAvatar: user.avatar,
      text: inputText,
      timestamp: Date.now()
    };

    try {
        if (roomId) {
             await addDoc(collection(db, 'rooms', roomId, 'messages'), newMessage);
        } else {
             await addDoc(collection(db, 'messages_world'), newMessage);
        }
        setInputText('');
    } catch (error) {
        console.error("Error sending message:", error);
    }
  };

  const handleCreateRoom = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoomData = {
      name: `${user.name}'s Room`,
      code: code,
      createdBy: user.email,
      createdAt: Date.now()
    };
    
    try {
        const docRef = await addDoc(collection(db, 'rooms'), newRoomData);
        const newRoom = { id: docRef.id, ...newRoomData, messages: [] };
        setActiveRoom(newRoom);
    } catch (error) {
        console.error("Error creating room:", error);
    }
  };

  const handleJoinRoom = async () => {
    const q = query(collection(db, 'rooms'), where("code", "==", joinCode.toUpperCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        const roomDoc = querySnapshot.docs[0];
        const room = { id: roomDoc.id, ...roomDoc.data() } as Room;
        setActiveRoom(room);
        setJoinCode('');
    } else {
        alert('Room not found');
    }
  };

  const renderChat = (msgs: Message[], isRoom: boolean = false) => (
    <div className="flex flex-col h-full">
       {isRoom && activeRoom && (
         <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
            <div>
              <h3 className="font-bold text-white">{activeRoom.name}</h3>
              <p className="text-xs text-zinc-500">Code: <span className="text-zinc-300 font-mono select-all">{activeRoom.code}</span></p>
            </div>
            <button onClick={() => setActiveRoom(null)} className="text-zinc-400 hover:text-white text-sm">
              Exit
            </button>
         </div>
       )}
       
       <div className="flex-1 overflow-y-auto p-4 space-y-4">
         {msgs.length === 0 && (
           <div className="text-center text-zinc-600 mt-10 text-sm">
             Start the conversation...
           </div>
         )}
         {msgs.map((msg) => {
           const isMe = msg.senderId === user.email;
           return (
             <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
               <img src={msg.senderAvatar} className="w-6 h-6 rounded-full bg-zinc-800 flex-shrink-0 mb-1" />
               <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                 isMe ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-200'
               }`}>
                 {!isMe && <p className="text-[10px] text-zinc-400 mb-0.5">{msg.senderName}</p>}
                 {msg.text}
               </div>
             </div>
           );
         })}
         <div ref={messagesEndRef} />
       </div>

       <div className="p-3 border-t border-zinc-800 bg-black">
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(isRoom ? activeRoom?.id : undefined)}
              placeholder={`Message ${isRoom ? 'room' : 'everyone'}...`}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 pl-4 pr-12 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
            />
            <button 
              onClick={() => handleSendMessage(isRoom ? activeRoom?.id : undefined)}
              className="absolute right-2 bg-white text-black p-2 rounded-full hover:scale-105 transition-transform"
            >
              <Send size={16} />
            </button>
          </div>
       </div>
    </div>
  );

  if (activeRoom) {
    return <div className="h-full pb-24">{renderChat(messages, true)}</div>;
  }

  return (
    <div className="h-full flex flex-col pb-24">
      {/* Tabs */}
      <div className="px-5 pt-2">
        <div className="flex p-1 bg-zinc-900 rounded-xl mb-4">
          <button 
            onClick={() => setActiveTab('world')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'world' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            World Chat
          </button>
          <button 
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'rooms' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Private Rooms
          </button>
        </div>
      </div>

      {activeTab === 'world' ? (
        <div className="flex-1 overflow-hidden">
           {renderChat(messages)}
        </div>
      ) : (
        <div className="px-5 flex-1 overflow-y-auto space-y-6">
           {/* Join Section */}
           <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 space-y-3">
             <h3 className="font-semibold text-white text-sm">Join a Room</h3>
             <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter room code"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-white/50 uppercase font-mono"
                  />
                </div>
                <button 
                  onClick={handleJoinRoom}
                  className="bg-white text-black px-4 rounded-xl font-medium text-sm hover:bg-zinc-200 transition-colors"
                >
                  Join
                </button>
             </div>
           </div>

           {/* Create Section */}
           <button 
             onClick={handleCreateRoom}
             className="w-full py-3 px-4 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center gap-2 text-white hover:bg-zinc-700 transition-colors"
           >
             <Plus size={18} />
             <span className="font-medium text-sm">Create New Room</span>
           </button>

           {/* Rooms List */}
           <div className="space-y-3">
              <h3 className="font-semibold text-zinc-400 text-sm px-1">Active Rooms</h3>
              {joinedRooms.length === 0 ? (
                <div className="text-center py-8 text-zinc-600 text-sm border border-dashed border-zinc-800 rounded-xl">
                  No rooms available. Create one!
                </div>
              ) : (
                joinedRooms.map(room => (
                  <div 
                    key={room.id}
                    onClick={() => setActiveRoom(room)}
                    className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-colors cursor-pointer flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                          <Users size={18} className="text-zinc-400" />
                       </div>
                       <div>
                         <h4 className="font-medium text-white text-sm">{room.name}</h4>
                         <p className="text-xs text-zinc-500">Created by {room.createdBy === user.email ? 'You' : 'User'}</p>
                       </div>
                    </div>
                    <LogIn size={18} className="text-zinc-500" />
                  </div>
                ))
              )}
           </div>
        </div>
      )}
    </div>
  );
};

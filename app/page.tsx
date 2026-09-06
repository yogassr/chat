// app/chat/page.tsx
'use client';

import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import { BotMessageSquare, Users, SendHorizonal, Terminal, Wifi, WifiOff } from 'lucide-react';

// Define the structure of a message
interface Message {
  id: string; // Add IDs for better list rendering
  user: string;
  text: string;
  time: string;
  isSystem?: boolean; // To style join/leave messages differently
}

// Connect to the backend defined in .env.local or default to 5000
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'https://chat-backend-xrvl.onrender.com';
let socket: Socket;

export default function SciFiChatPage() {
  const [username, setUsername] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Socket Logic ---
  useEffect(() => {
    // Only connect after user joins
    if (!isJoined) return;

    // Initialize socket connection
    socket = io(SOCKET_URL);

    socket.on('connect', () => {
      setIsConnected(true);
      // Optional: Send a "has joined" message automatically
      // socket.emit('send_message', { user: 'SYSTEM', text: `${username} has entered the grid.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isSystem: true });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for incoming messages
    socket.on('receive_message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    // Cleanup on unmount or when leaving chat
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('receive_message');
        socket.disconnect();
      }
    };
  }, [isJoined, username]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on join
  useEffect(() => {
    if (isJoined) {
      inputRef.current?.focus();
    }
  }, [isJoined]);

  const handleJoin = () => {
    if (username.trim()) {
      setIsJoined(true);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage(e);
    }
  };

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    const messageData: Message = {
      id: Date.now().toString() + Math.random(),
      user: username,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    socket.emit('send_message', messageData);
    setMessage('');
  };

  // --- Render Join Screen ---
  if (!isJoined) {
    return (
      <main className="min-h-screen bg-[#050505] text-[#e0e0e0] p-4 md:p-8 font-mono flex flex-col items-center justify-center relative overflow-hidden">
        {/* Sci-fi Background Grid Effect */}
        <div className="absolute inset-0 opacity-[0.02]" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
        </div>
        
        <div className="bg-[#0a0a0a] p-8 md:p-12 rounded-xl border border-[#1a1a1a] w-full max-w-md relative z-10 shadow-[0_0_60px_-15px_rgba(66,153,225,0.15)]">
          <div className="flex items-center gap-4 mb-8 border-b border-[#1a1a1a] pb-6">
            <div className="p-3 bg-[#080808] border border-[#2a2a2a] rounded-2xl text-blue-400">
              <BotMessageSquare size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#f0f0f0] tracking-wider">Messenger</h1>
              <p className="text-sm text-slate-500">Secure Comms Terminal V.9</p>
            </div>
          </div>

          <label htmlFor="username" className="block text-sm text-slate-400 mb-2 tracking-wide">
            ENTER Your name
          </label>
          <input
            id="username"
            type="text"
            placeholder="e.g., N3MESIS_PR1ME"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter') handleJoin(); }}
            maxLength={20}
            className="w-full p-4 bg-[#050505] border border-[#2a2a2a] rounded-lg mb-6 text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-slate-600 text-lg"
          />
          
          <button
            onClick={handleJoin}
            disabled={!username.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-bold transition-all flex items-center justify-center gap-3 disabled:bg-slate-800 disabled:text-slate-500 text-lg tracking-widest shadow-lg shadow-blue-900/30"
          >
            Connect to chat room
            <Terminal size={20} />
          </button>
          
          <p className="text-center text-xs text-slate-700 mt-8">
            Authorization required. Secure channel active.
          </p>
        </div>
      </main>
    );
  }

  // --- Render Chat Interface ---
  return (
    // Using flex-col h-screen keeps the footer input at the bottom on all devices
    <main className="flex flex-col h-screen bg-[#050505] text-[#e0e0e0] font-mono overflow-hidden">
      
      {/* Header - Graphic Based */}
      <header className="flex-none bg-[#0a0a0a] border-b border-[#1a1a1a] p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#050505] border border-[#2a2a2a] rounded-lg text-blue-400">
            <BotMessageSquare size={20} />
          </div>
          <h1 className="font-bold text-lg tracking-widest text-[#f0f0f0]">Messenger <span className='text-xs text-blue-600 font-normal'>// CHAT GRID</span></h1>
        </div>
        
        <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-[#050505] border border-[#2a2a2a] text-sm">
          {isConnected ? (
            <>
              <Wifi size={16} className="text-emerald-400" />
              <span className="text-emerald-400 tracking-wider">LIVE</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-red-500" />
              <span className="text-red-500 tracking-wider">ChatingG</span>
            </>
          )}
          <span className="w-px h-4 bg-[#2a2a2a]" />
          <div className="flex items-center gap-2 text-slate-300">
            <Users size={16} />
            <span className='tracking-wider'>{username}</span>
          </div>
        </div>
      </header>

      {/* Messages Container - Realistic Height Scaling */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 space-y-6 bg-[#050505] relative">
        
        {/* Cool background graphic element */}
        <div className="absolute inset-0 opacity-[0.01] pointer-events-none"
             style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/diagmonds-light.png)' }}>
        </div>

        {/* Welcome Message/Instructions */}
        <div className="flex justify-center my-4">
          <div className="text-center bg-[#0a0a0a] border border-[#1a1a1a] px-6 py-3 rounded-full text-slate-500 text-xs max-w-lg shadow-inner">
            <Terminal size={14} className="inline mr-2 -mt-1" />
            Channel established between Operator nodes. All transmissions are logged.
          </div>
        </div>

        {/* Map Messages */}
        {messages.map((msg) => {
          const isOwnMessage = msg.user === username;
          const isSystem = msg.user === 'SYSTEM' || msg.isSystem;

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-6 text-center">
                <div className="bg-blue-950/30 border border-blue-900 text-blue-300 px-6 py-1.5 rounded-full text-xs tracking-wider max-w-md">
                  {msg.text} <span className='text-blue-700 ml-2'>{msg.time}</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex items-center gap-3 mb-1.5 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Identicon/Avatar placeholder - Graphic feel */}
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-black shrink-0 shadow-lg
                  ${isOwnMessage 
                    ? 'bg-blue-900 border-blue-700 text-blue-200' 
                    : 'bg-[#1a1a1a] border-[#2a2a2a] text-slate-400'}`}>
                  {msg.user.substring(0, 2).toUpperCase()}
                </div>
                <div className={`flex items-baseline gap-3 px-4 py-2 rounded-3xl max-w-[85%] md:max-w-[70%] lg:max-w-[60%] shadow-xl
                  ${isOwnMessage
                    ? 'bg-blue-600 text-white rounded-br-none border border-blue-500'
                    : 'bg-[#0a0a0a] text-slate-100 rounded-bl-none border border-[#1a1a1a]'}`}>
                  
                  <span className={`font-bold text-xs tracking-wide ${isOwnMessage ? 'text-blue-100' : 'text-blue-500'}`}>
                    {isOwnMessage ? 'YOU' : msg.user}
                  </span>
                  
                  {/* Message Body - Textarea like rendering for realistic data feel */}
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap select-text">
                    {msg.text}
                  </p>
                </div>
              </div>
              
              {/* Timestamp */}
              <div className={`text-[10px] text-slate-600 tracking-wider ${isOwnMessage ? 'mr-12' : 'ml-12'}`}>
                DATASTREAM_ID_{msg.id.substring(0,6)} // {msg.time}
              </div>
            </div>
          );
        })}
        
        {/* Dummy div for auto-scroll */}
        <div ref={bottomRef} />
      </div>

      {/* Input Area - Fixed to Bottom */}
      <footer className="flex-none bg-[#0a0a0a] border-t border-[#1a1a1a] p-4 md:p-5 sticky bottom-0">
        <form onSubmit={sendMessage} className="flex items-center gap-3 relative">
          
          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Messagess AS ${username}...`}
            className="flex-1 p-4 pr-16 bg-[#050505] border border-[#2a2a2a] rounded-xl text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-slate-700 text-sm tracking-wider"
            maxLength={500} // Good practice
          />
          
          {/* Send Button - Graphic shape */}
          <button
            type="submit"
            disabled={!message.trim()}
            className="absolute right-1 top-1 bottom-1 px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white rounded-lg transition-all group flex items-center justify-center aspect-square md:aspect-auto md:px-6"
            aria-label="Send message"
          >
            <SendHorizonal size={20} className="group-hover:translate-x-0.5 transition-transform group-disabled:translate-x-0" />
            <span className='hidden md:block ml-2 font-bold tracking-widest text-sm'>SEND</span>
          </button>
        </form>
        <p className='text-center text-[9px] text-slate-800 mt-2 tracking-widest'>SECURE CHANNEL ACTIVE // E2E ENCRYPTION // QUANTUM-RESISTANT PROTOCOLS</p>
      </footer>
    </main>
  );
}

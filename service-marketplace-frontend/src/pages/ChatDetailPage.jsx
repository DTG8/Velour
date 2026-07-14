import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, MoreHorizontal, Image as ImageIcon, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { socketService } from '../lib/socket';

export default function ChatDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useApp();
  
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const scrollRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both history and partner profile in parallel
      const [history, partnerProfile] = await Promise.all([
        api.getChatHistory(userId),
        api.getProfile(userId).catch(() => ({ display_name: 'User', user_id: userId }))
      ]);
      setMessages(history);
      setPartner(partnerProfile);
      
      // Mark as read immediately on open
      socketService.markRead(userId);
    } catch (err) {
      setError(err.message || 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleNewMessage = (payload) => {
      // Only add to state if message belongs to this conversation
      if (
        (payload.sender_id.toString() === userId && payload.receiver_id.toString() === currentUser.id.toString()) ||
        (payload.sender_id.toString() === currentUser.id.toString() && payload.receiver_id.toString() === userId)
      ) {
        setMessages(prev => [...prev, payload]);
        
        // If we are the receiver, mark as read
        if (payload.receiver_id.toString() === currentUser.id.toString()) {
          socketService.markRead(userId);
        }
      }
    };

    socketService.onNewMessage(handleNewMessage);
    return () => socketService.offNewMessage(handleNewMessage);
  }, [userId, currentUser.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Emit via socket
    socketService.sendMessage(userId, inputText.trim());
    setInputText('');
  };

  if (loading) {
    return (
      <div className="h-screen bg-void flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="text-gold animate-spin" />
        <p className="text-ash text-xs uppercase tracking-widest">Loading Conversation…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-void flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-display text-ivory">Connection Error</h2>
        <p className="text-ash mt-2 mb-6">{error}</p>
        <button onClick={() => navigate('/chats')} className="btn-gold px-6">Back to Messages</button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-void overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 bg-charcoal/80 backdrop-blur-md border-b border-border z-10">
        <button onClick={() => navigate('/chats')} className="p-1 hover:bg-void rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex-1 flex items-center gap-3" onClick={() => navigate(`/provider/${userId}`)}>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-void border border-border flex items-center justify-center">
            {partner.avatar_url ? (
              <img src={partner.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gold/30 font-display text-lg">{partner.display_name?.charAt(0)}</span>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-ivory text-sm">{partner.display_name}</h2>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${partner.is_online ? 'bg-emerald-400 animate-pulse' : 'bg-ash'}`} />
              <span className="text-[10px] text-ash">{partner.is_online ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>

        <button className="p-2 text-ash hover:text-gold transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth no-scrollbar"
      >
        <div className="flex flex-col items-center py-8 text-center space-y-2 opacity-50">
          <div className="w-12 h-12 rounded-full bg-charcoal flex items-center justify-center text-gold">
            <ImageIcon size={20} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-ash">
            Secure connection established
          </p>
        </div>

        {messages.map((msg, i) => {
          const isMe = msg.sender_id.toString() === currentUser.id.toString();
          return (
            <motion.div
              key={msg.id || i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                  isMe 
                    ? 'bg-gold text-void rounded-tr-none font-medium' 
                    : 'bg-charcoal border border-border text-silver rounded-tl-none'
                }`}
              >
                {msg.message_text}
                <div className={`text-[9px] mt-1 flex justify-end gap-1 ${isMe ? 'text-void/60' : 'text-ash'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && <span>{msg.is_read ? '••' : '•'}</span>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 bg-void border-t border-border safe-area-inset-bottom">
        <form 
          onSubmit={handleSend}
          className="max-w-lg mx-auto flex items-center gap-2 bg-charcoal border border-border rounded-2xl p-1.5 focus-within:border-gold/50 transition-all shadow-xl"
        >
          <button type="button" className="p-2 text-ash hover:text-gold transition-colors">
            <ImageIcon size={20} />
          </button>
          <input
            type="text"
            placeholder="Write a message…"
            className="flex-1 bg-transparent border-none text-sm focus:ring-0 text-ivory px-2"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-xl bg-gold text-void flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-gold/20"
          >
            <Send size={18} className="fill-void ml-0.5" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}

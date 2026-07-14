import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { socketService } from '../lib/socket';

export default function ChatsPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    
    const handleNewMessage = (payload) => {
      setConversations(prev => {
        const otherId = payload.sender_id === payload.receiver_id ? payload.receiver_id : (payload.sender_id === payload.receiver_id ? payload.sender_id : (payload.sender_id === payload.receiver_id ? payload.sender_id : payload.sender_id));
        // Wait, logic to update conversation list on new message
        const partnerId = payload.sender_id === payload.receiver_id ? payload.sender_id : (payload.sender_id === payload.receiver_id ? payload.sender_id : payload.sender_id);
        
        // This is tricky without knowing who the "other" is exactly from the payload alone if it's the same user
        // But usually sender_id or receiver_id is NOT the current user.
        // Let's just refetch for now to keep it simple and accurate, or update local state if we want "production feel"
        fetchConversations(); 
        return prev;
      });
    };

    socketService.onNewMessage(handleNewMessage);
    return () => socketService.offNewMessage(handleNewMessage);
  }, []);

  const filteredConversations = conversations.filter(c => 
    c.other_display_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.other_username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-32 px-4 pt-6 max-w-lg mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-display text-ivory tracking-tight">Messages</h1>
        <div className="w-10 h-10 rounded-full bg-charcoal border border-border flex items-center justify-center">
          <MessageCircle size={20} className="text-gold" />
        </div>
      </header>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
        <input
          type="text"
          placeholder="Search conversations…"
          className="input-dark pl-9 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" className="space-y-2">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-20 rounded-2xl bg-charcoal animate-pulse border border-border" />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center space-y-4"
            >
              <AlertCircle size={32} className="text-red-500 mx-auto" />
              <p className="text-ash text-sm">{error}</p>
              <button onClick={fetchConversations} className="btn-ghost text-gold flex items-center gap-2 mx-auto">
                <RefreshCw size={14} /> Retry
              </button>
            </motion.div>
          ) : filteredConversations.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center space-y-2"
            >
              <p className="text-ash italic">No conversations found.</p>
              {search && (
                <button onClick={() => setSearch('')} className="text-gold text-sm font-medium">
                  Clear search
                </button>
              )}
            </motion.div>
          ) : (
            filteredConversations.map((chat, i) => (
              <motion.div
                key={chat.other_user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/chat/${chat.other_user_id}`)}
                className="flex items-center gap-4 p-3 rounded-2xl bg-charcoal border border-border hover:border-gold/30 cursor-pointer transition-all active:scale-[0.98]"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-void border border-border flex items-center justify-center">
                    {chat.other_avatar_url ? (
                      <img src={chat.other_avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gold/30 font-display text-xl">{chat.other_display_name?.charAt(0)}</span>
                    )}
                  </div>
                  {chat.other_is_online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-charcoal" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-ivory truncate">{chat.other_display_name}</h3>
                    <span className="text-[10px] text-ash">
                      {new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${chat.unread_count > 0 ? 'text-silver font-medium' : 'text-ash'}`}>
                    {chat.last_message_sender_id === chat.other_user_id ? '' : 'You: '}
                    {chat.last_message_text}
                  </p>
                </div>

                {/* Unread badge */}
                {chat.unread_count > 0 && (
                  <div className="w-5 h-5 rounded-full bg-gold text-void text-[10px] font-bold flex items-center justify-center shrink-0">
                    {chat.unread_count}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

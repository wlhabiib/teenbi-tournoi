import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseAvailable } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/authSupabase';

interface Message {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

export default function Supporters() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const stickers = ['🔥', '⚽', '🏆', '👏', '🙌', '💪', '🇸🇳', '⚡', '🎉', '❤️'];

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    if (!isSupabaseAvailable()) return;
    try {
      const { data, error } = await supabase!
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    if (!isSupabaseAvailable()) {
      alert('Supabase not configured');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase!.from('messages').insert([
        {
          author: user.username,
          content: newMessage,
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;
      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSticker = (sticker: string) => {
    setNewMessage(prev => prev + sticker);
  };

  return (
    <div className="section-container">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">🎊 Supporters</h1>
        <p className="text-gray-400">Ambiance du quartier - Chat en direct</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6 hover-glow">
          <div className="h-96 bg-secondary/5 rounded-lg mb-4 p-4 overflow-y-auto border border-secondary/20">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun message pour le moment...</p>
                  <p className="text-sm text-gray-600 mt-2">Soyez le premier à écrire!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-gradient-to-r from-secondary/10 to-secondary/5 p-3 rounded-lg border-l-2 border-gold hover:from-secondary/20 hover:to-secondary/10 transition-all"
                  >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gold text-sm">{msg.author}</span>
                    <span className="text-[10px] text-gray-500">{new Date(msg.created_at).toLocaleTimeString('fr-FR')}</span>
                  </div>
                  <p className="text-gray-300 text-sm break-words">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="card p-6 hover-glow h-fit">
          <h2 className="text-xl font-bold text-gold mb-4">📝 Envoyer un message</h2>
          {!user && (
            <p className="text-red-400 text-sm mb-4 italic">Veuillez vous connecter pour envoyer un message.</p>
          )}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">En tant que</label>
              <div className="w-full bg-secondary/20 border border-secondary/30 rounded-lg p-2 text-gold font-semibold">
                {user?.username || 'Utilisateur anonyme'}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Message</label>
              <textarea
                placeholder="Votre message (max 500 caractères)"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value.slice(0, 500))}
                maxLength={500}
                className="w-full bg-secondary/10 border border-secondary/30 rounded-lg p-2 text-white placeholder-gray-500 h-24 focus:border-gold focus:outline-none transition-colors resize-none"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {newMessage.length}/500
              </p>
            </div>
            
            <div>
              <label className="text-xs text-gray-400 block mb-2">Ajouter un sticker</label>
              <div className="flex flex-wrap gap-2">
                {stickers.map(sticker => (
                  <button
                    key={sticker}
                    onClick={() => addSticker(sticker)}
                    className="text-xl hover:scale-125 transition-transform p-1 bg-secondary/10 rounded border border-white/5 hover:border-gold/30"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSendMessage}
              disabled={loading || !user || !newMessage.trim()}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseAvailable } from '@/lib/supabase';

interface Message {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

export default function Supporters() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
    if (!author.trim() || !newMessage.trim()) {
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
          author,
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
                    <p className="font-semibold text-gold text-sm">{msg.author}</p>
                    <p className="text-gray-300 text-sm mt-1 break-words">{msg.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(msg.created_at).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="card p-6 hover-glow h-fit">
          <h2 className="text-xl font-bold text-gold mb-4">📝 Envoyer un message</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Votre nom</label>
              <input
                type="text"
                placeholder="Votre surnom"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-secondary/10 border border-secondary/30 rounded-lg p-2 text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
              />
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
            <button
              onClick={handleSendMessage}
              disabled={loading || !author.trim() || !newMessage.trim()}
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

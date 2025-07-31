import React, { useEffect, useRef, useState } from 'react';
import { Loader2, SendHorizonal, X } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hey! I’m your bus assistant. Ask me anything related to your bus route, timings, or live location.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMsg = { type: 'user', text: trimmedInput };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.text }),
      });

      const data = await res.json();

      if (!res.ok || !data.text) {
        throw new Error(data.error || 'Something went wrong');
      }

      setMessages((prev) => [...prev, { type: 'bot', text: data.text }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all text-2xl"
        >
          🤖
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] h-[500px] bg-white border border-gray-300 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white font-semibold">
            <span>Bus Assistant</span>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-xs px-4 py-3 rounded-xl ${
                  msg.type === 'user'
                    ? 'bg-blue-600 text-white self-end ml-auto'
                    : 'bg-white text-black self-start'
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 flex items-center gap-2 bg-white">
            <textarea
              rows={1}
              placeholder="Ask me anything..."
              className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <SendHorizonal className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Error */}
          {error && <div className="p-2 text-sm text-red-500 text-center">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default Chatbot;

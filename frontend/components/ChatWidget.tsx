'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! I am Benish\'s Assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat`;

      console.log('[ChatWidget] Sending message to API:', API_URL);
      console.log('[ChatWidget] Request payload:', { message: userMessage });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      console.log('[ChatWidget] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ChatWidget] API error response:', errorText);
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[ChatWidget] Response data:', data);

      // Validate response structure
      if (!data || typeof data.message !== 'string') {
        console.error('[ChatWidget] Invalid response structure:', data);
        throw new Error('Invalid response format from API');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('[ChatWidget] Error occurred:', error);

      let errorMessage = 'Sorry, something went wrong. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = '🔌 Unable to connect to the chatbot service. Please check your internet connection.';
        } else if (error.message.includes('API returned')) {
          errorMessage = `⚠️ Chatbot service error: ${error.message}. The service might be temporarily unavailable.`;
        } else if (error.message.includes('Invalid response')) {
          errorMessage = '⚠️ Received an unexpected response from the chatbot. Please try again.';
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white/90 backdrop-blur-md border border-rose-200 rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col transition-all duration-300 transform origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Benish's Assistant</h3>
                <p className="text-xs text-rose-100 opacity-90">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 18 18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 bg-rose-50/50 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 text-sm rounded-2xl shadow-sm ${msg.role === 'user'
                    ? 'bg-rose-600 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-rose-100 rounded-tl-none'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-rose-100 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-rose-100">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:hover:bg-rose-600 transition-colors shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-rose-200 ${isOpen
          ? 'bg-rose-500 rotate-90 text-white'
          : 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white animate-float'
          }`}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 18 18" />
          </svg>
        ) : (
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-400 rounded-full border-2 border-white animate-pulse"></span>
          </div>
        )}
      </button>
    </div>
  );
}

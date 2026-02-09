'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function ChatbotPage() {
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
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsLoading(true);

        try {
            const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat`;
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
        } catch (error) {
            setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process that.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-rose-50/20 flex flex-col">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-rose-100 py-4 px-6 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white font-bold">B</div>
                        <span className="font-bold text-gray-900">Benish AI</span>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-rose-600">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        Agent Online
                    </div>
                </div>
            </header>

            {/* Main Chat Area */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-6 pb-4 scroll-smooth pr-2">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                                    ? 'bg-rose-600 text-white rounded-tr-none'
                                    : 'bg-white border border-rose-100 text-gray-800 rounded-tl-none'
                                }`}>
                                <p className="leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-rose-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="pt-4 border-t border-rose-100 bg-transparent">
                    <form onSubmit={handleSubmit} className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Ask Benish anything..."
                            className="w-full resize-none bg-white border border-rose-200 rounded-2xl py-4 pl-4 pr-16 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                            rows={1}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-3 bottom-3 p-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all shadow-lg hover:shadow-rose-300 disabled:opacity-50 disabled:hover:bg-rose-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-400 mt-3">Benish AI can make mistakes. Check important info.</p>
                </div>
            </main>
        </div>
    );
}

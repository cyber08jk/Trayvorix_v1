import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I am your Trayvorix AI assistant. How can I help you manage your inventory today?',
            timestamp: new Date(),
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (content: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setIsLoading(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `I'm a demo AI. I received your message: "${content}". In the future, I will be connected to a real AI backend to assist you with inventory tasks, analytics, and more.`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiResponse]);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            <div
                className={`bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 sm:w-96 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${isOpen
                        ? 'opacity-100 scale-100 mb-4 h-[500px]'
                        : 'opacity-0 scale-95 h-0 mb-0 pointer-events-none'
                    }`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 shrink-0 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <MessageSquare size={18} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Trayvorix Assistant</h3>
                            <p className="text-[10px] text-indigo-100 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                Online
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Minimize2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4 min-h-0">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'bg-gray-800 rotate-90' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
            >
                <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
                    {/* Ping animation ring */}
                    <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-ping" />
                </div>

                {isOpen ? (
                    <X size={24} className="text-white relative z-10" />
                ) : (
                    <MessageSquare size={24} className="text-white relative z-10" />
                )}
            </button>
        </div>
    );
};

export default AIAssistant;

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, ChevronLeft } from 'lucide-react';
import botImg from '../../../asserts/bot_img.png';
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
            content: 'Hi! How can I help you today?',
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
                content: `I am a demo. You said: "${content}"`,
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
                className={`bg-[#1c1c1e] rounded-[32px] shadow-2xl border border-gray-800 w-80 sm:w-96 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${isOpen
                        ? 'opacity-100 scale-100 mb-4 h-[600px]'
                        : 'opacity-0 scale-95 h-0 mb-0 pointer-events-none'
                    }`}
            >
                {/* Header */}
                <div className="bg-[#1c1c1e] p-4 shrink-0 flex items-center justify-between text-white border-b border-gray-800">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-10 h-10 rounded-full bg-[#2c2c2e] flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h3 className="font-semibold text-lg">Ask Question</h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-[#1c1c1e] space-y-6 min-h-0 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Action Tabs (Visual only for now based on image) */}
                <div className="px-4 py-2 bg-[#1c1c1e] flex items-center gap-2 overflow-x-auto">
                    <button className="px-4 py-2 rounded-xl bg-[#2b9381] text-white text-xs font-medium whitespace-nowrap">
                        Mathematical QnA
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-[#2c2c2e] text-gray-400 text-xs font-medium whitespace-nowrap hover:bg-gray-700 hover:text-white transition-colors">
                        History
                    </button>
                </div>

                {/* Input Area */}
                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl shadow-black/50 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden ${isOpen ? 'bg-[#2c2c2e] rotate-90' : 'bg-[#1c1c1e]'
                    }`}
            >
                <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
                    {/* Ping animation ring */}
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#2b9381] opacity-20 animate-ping" />
                    <span className="absolute inline-flex h-full w-full rounded-full border border-[#2b9381]/50" />
                </div>

                {isOpen ? (
                    <X size={28} className="text-white relative z-10" />
                ) : (
                    <img
                        src={botImg}
                        alt="AI Assistant"
                        className="w-full h-full object-cover relative z-10"
                    />
                )}
            </button>
        </div>
    );
};

export default AIAssistant;

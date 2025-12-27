import React from 'react';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
    message: {
        id: string;
        role: 'user' | 'assistant';
        content: string;
        timestamp: Date;
    };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                    className={`p-3 rounded-2xl text-sm ${isUser
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                        }`}
                >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <span className={`text-[10px] mt-1 block opacity-70 ${isUser ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;

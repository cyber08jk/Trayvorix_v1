import React from 'react';
import { Bot } from 'lucide-react';

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
            <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                {!isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 text-gray-300">
                        <Bot size={16} />
                    </div>
                )}

                <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${isUser
                        ? 'bg-[#2b9381] text-white rounded-br-sm'
                        : 'bg-[#3a3a3c] text-gray-200 rounded-bl-sm border border-gray-700/50'
                        }`}

                >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <span className={`text-[10px] mt-2 block ${isUser ? 'text-white/70' : 'text-gray-500'} text-right`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;

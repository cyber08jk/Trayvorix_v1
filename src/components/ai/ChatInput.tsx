import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading = false }) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (message.trim() && !isLoading) {
            onSendMessage(message);
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    return (
        <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-end gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-indigo-300 focus-within:ring-1 focus-within:ring-indigo-100 transition-all">
                    <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
                        title="Attach file"
                    >
                        <Paperclip size={18} />
                    </button>

                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything..."
                        className="flex-1 max-h-[120px] bg-transparent border-none focus:ring-0 p-2 text-sm text-gray-800 placeholder:text-gray-400 resize-none overflow-y-auto"
                        rows={1}
                        disabled={isLoading}
                    />

                    <button
                        type="submit"
                        disabled={!message.trim() || isLoading}
                        className={`p-2 rounded-lg transition-all duration-200 ${message.trim() && !isLoading
                                ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:scale-105 active:scale-95'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <Send size={18} />
                    </button>
                </div>
                {isLoading && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full backdrop-blur-sm border border-gray-100">
                        AI is thinking...
                    </div>
                )}
            </form>
        </div>
    );
};

export default ChatInput;

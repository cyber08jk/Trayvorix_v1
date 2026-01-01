import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';

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
        <div className="p-4 bg-[#1c1c1e] border-t border-gray-800 rounded-b-2xl">
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-end gap-2 bg-[#2c2c2e] p-2 rounded-full border border-gray-700/50 focus-within:border-[#2b9381] transition-all">
                    <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                        title="Attach file"
                    >
                        <Paperclip size={18} />
                    </button>

                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Write a Question..."
                        className="flex-1 max-h-[120px] bg-transparent border-none focus:ring-0 p-2 text-sm text-white placeholder:text-gray-500 resize-none overflow-y-auto"
                        rows={1}
                        disabled={isLoading}
                    />

                    <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                        title="Voice input"
                    >
                        <Mic size={18} />
                    </button>
                    <button
                        type="submit"
                        disabled={!message.trim() || isLoading}
                        className={`p-2 rounded-full transition-all duration-200 ${message.trim() && !isLoading
                            ? 'bg-[#2b9381] text-white shadow-md hover:bg-[#248070] hover:scale-105 active:scale-95'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatInput;

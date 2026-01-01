import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';
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
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hi! I\'m your Trayvorix AI assistant. I can help you with inventory management, invoices, products, and more. What would you like to know?',
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

    // Get current page context
    const getPageContext = () => {
        const path = location.pathname;
        if (path.includes('invoice')) return 'invoices';
        if (path.includes('product')) return 'products';
        if (path.includes('receipt')) return 'receipts';
        if (path.includes('deliver')) return 'deliveries';
        if (path.includes('warehouse')) return 'warehouses';
        if (path.includes('adjustment')) return 'adjustments';
        if (path.includes('movement')) return 'movements';
        if (path.includes('inventory')) return 'inventory';
        if (path.includes('dashboard')) return 'dashboard';
        if (path.includes('analytics')) return 'analytics';
        return 'general';
    };

    // Generate context-aware AI responses
    const generateAIResponse = (userMessage: string, context: string): string => {
        const lowerMessage = userMessage.toLowerCase();

        // Invoice-related queries
        if (context === 'invoices' || lowerMessage.includes('invoice')) {
            if (lowerMessage.includes('create') || lowerMessage.includes('new') || lowerMessage.includes('add')) {
                return "To create a new invoice:\n1. Click the 'New Invoice' button\n2. Select invoice type (Purchase or Sales)\n3. Enter party information (supplier/customer)\n4. Add line items with products and quantities\n5. The system will auto-calculate taxes and totals\n6. Save as draft or finalize\n\nYou can also generate invoices automatically from receipts or deliveries!";
            }
            if (lowerMessage.includes('payment') || lowerMessage.includes('paid') || lowerMessage.includes('pay')) {
                return "To track payments:\n• Use the 'Mark as Paid' button in the actions column\n• Payment status automatically updates: Unpaid → Partial → Paid\n• Overdue invoices are highlighted in red\n• View outstanding amounts in the summary cards\n\nThe system tracks: Total Amount, Paid Amount, and Outstanding Amount.";
            }
            if (lowerMessage.includes('filter') || lowerMessage.includes('search') || lowerMessage.includes('find')) {
                return "You can filter invoices by:\n• Invoice Type (Purchase/Sales)\n• Payment Status (Paid/Partial/Unpaid/Overdue)\n• Status (Draft/Sent/Viewed/Paid/Cancelled)\n• Search by invoice number or party name\n\nAll filters work together for precise results!";
            }
            if (lowerMessage.includes('purchase') || lowerMessage.includes('supplier')) {
                return "Purchase Invoices are for goods received from suppliers. They:\n• Track what you owe to vendors\n• Can be auto-generated from receipts\n• Help manage accounts payable\n• Support tax calculations (default 18% GST)\n\nLink them to receipts for better tracking!";
            }
            if (lowerMessage.includes('sales') || lowerMessage.includes('customer')) {
                return "Sales Invoices are for goods delivered to customers. They:\n• Track what customers owe you\n• Can be auto-generated from deliveries\n• Help manage accounts receivable\n• Include customer contact details\n\nLink them to deliveries for complete order tracking!";
            }
            return "I can help you with:\n• Creating and managing invoices\n• Tracking payments and outstanding amounts\n• Filtering and searching invoices\n• Understanding purchase vs sales invoices\n• Auto-generating invoices from receipts/deliveries\n\nWhat specific aspect would you like to know more about?";
        }

        // Product-related queries
        if (context === 'products' || lowerMessage.includes('product')) {
            if (lowerMessage.includes('add') || lowerMessage.includes('create') || lowerMessage.includes('new')) {
                return "To add a new product:\n1. Click 'Add Product' button\n2. Enter SKU (unique identifier)\n3. Provide product name and description\n4. Select category\n5. Set unit of measurement\n6. Define reorder point for low stock alerts\n\nProducts are the foundation of your inventory system!";
            }
            if (lowerMessage.includes('stock') || lowerMessage.includes('inventory') || lowerMessage.includes('quantity')) {
                return "Product stock levels are tracked automatically:\n• Total Inventory: All units across warehouses\n• Available Inventory: Units not reserved\n• Reorder Point: Triggers low stock alerts\n• Real-time updates from receipts and deliveries\n\nCheck the Inventory page for detailed stock by location!";
            }
            return "I can help you with:\n• Adding and managing products\n• Tracking stock levels\n• Setting up categories\n• Managing SKUs and barcodes\n• Understanding reorder points\n\nWhat would you like to know?";
        }

        // Receipt-related queries
        if (context === 'receipts' || lowerMessage.includes('receipt')) {
            if (lowerMessage.includes('create') || lowerMessage.includes('new') || lowerMessage.includes('add')) {
                return "To create a receipt (incoming stock):\n1. Click 'New Receipt'\n2. Enter supplier information\n3. Add expected products and quantities\n4. When goods arrive, record received quantities\n5. Validate to update inventory\n\nReceipts automatically increase your stock levels!";
            }
            if (lowerMessage.includes('status')) {
                return "Receipt statuses:\n• Draft: Being prepared\n• Waiting: Awaiting delivery\n• Ready: Goods arrived, ready to process\n• Done: Validated and inventory updated\n• Cancelled: Receipt cancelled\n\nOnly 'Done' receipts update inventory!";
            }
            return "Receipts track incoming stock from suppliers. I can help with:\n• Creating new receipts\n• Understanding receipt statuses\n• Validating received goods\n• Generating purchase invoices from receipts\n\nWhat do you need help with?";
        }

        // Delivery-related queries
        if (context === 'deliveries' || lowerMessage.includes('deliver')) {
            if (lowerMessage.includes('create') || lowerMessage.includes('new') || lowerMessage.includes('add')) {
                return "To create a delivery (outgoing stock):\n1. Click 'New Delivery'\n2. Enter customer information and address\n3. Add products to deliver\n4. Track picking → packing → shipping\n5. Mark as delivered when complete\n\nDeliveries automatically decrease your stock!";
            }
            if (lowerMessage.includes('status')) {
                return "Delivery statuses:\n• Draft: Being prepared\n• Picking: Items being collected\n• Packing: Items being packed\n• Ready: Ready to ship\n• Shipped: On the way\n• Delivered: Completed\n• Cancelled: Delivery cancelled";
            }
            return "Deliveries track outgoing stock to customers. I can help with:\n• Creating deliveries\n• Understanding delivery workflow\n• Tracking shipment status\n• Generating sales invoices from deliveries\n\nWhat would you like to know?";
        }

        // Warehouse-related queries
        if (context === 'warehouses' || lowerMessage.includes('warehouse') || lowerMessage.includes('location')) {
            return "Warehouses and locations help organize your inventory:\n• Create multiple warehouses\n• Define storage locations within each\n• Track stock by specific location\n• Monitor warehouse capacity\n• View temperature and humidity (if applicable)\n\nProper organization improves efficiency!";
        }

        // Dashboard queries
        if (context === 'dashboard' || lowerMessage.includes('dashboard') || lowerMessage.includes('overview')) {
            return "The Dashboard shows:\n• Total Products count\n• Total Inventory Value\n• Low Stock Items (below reorder point)\n• Pending Transfers\n• Recent Activity Timeline\n• Stock Trends and Charts\n\nIt's your command center for inventory management!";
        }

        // Analytics queries
        if (context === 'analytics' || lowerMessage.includes('report') || lowerMessage.includes('analytic')) {
            return "Analytics provides insights:\n• Stock movement trends\n• Category distribution\n• Warehouse utilization\n• Top products by movement\n• Monthly comparisons\n• Custom date ranges\n\nUse data to make informed decisions!";
        }

        // General help
        if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
            return `I'm here to help with Trayvorix! Currently viewing: ${context}\n\nI can assist with:\n📦 Products - Add, manage, track inventory\n📥 Receipts - Incoming stock from suppliers\n📤 Deliveries - Outgoing stock to customers\n💰 Invoices - Purchase and sales invoicing\n🏢 Warehouses - Storage locations\n📊 Analytics - Reports and insights\n⚙️ Adjustments - Stock corrections\n\nJust ask me anything!`;
        }

        // Tax and calculation queries
        if (lowerMessage.includes('tax') || lowerMessage.includes('gst') || lowerMessage.includes('calculate')) {
            return "Tax calculations in Trayvorix:\n• Default tax rate: 18% (GST)\n• Configurable per invoice/item\n• Auto-calculated on invoices\n• Subtotal + Tax - Discount = Total\n\nAll calculations are automatic and accurate!";
        }

        // Default contextual response
        const contextMessages: Record<string, string> = {
            invoices: "I'm here to help with invoice management! You can ask me about creating invoices, tracking payments, filtering data, or understanding purchase vs sales invoices.",
            products: "I can help you manage products! Ask me about adding products, tracking stock, categories, or inventory levels.",
            receipts: "I can assist with receipts (incoming stock). Ask about creating receipts, supplier management, or inventory updates.",
            deliveries: "I can help with deliveries (outgoing stock). Ask about creating deliveries, customer orders, or shipment tracking.",
            warehouses: "I can help with warehouse management. Ask about locations, capacity, or organizing your inventory.",
            dashboard: "I can explain the dashboard metrics and help you understand your inventory overview.",
            analytics: "I can help you understand reports and analytics. Ask about trends, insights, or data visualization.",
            general: "I'm your Trayvorix AI assistant! I can help with products, invoices, receipts, deliveries, warehouses, and more. What would you like to know?"
        };

        return contextMessages[context] || `You said: "${userMessage}"\n\nI'm still learning! Try asking about:\n• Creating invoices\n• Managing products\n• Tracking inventory\n• Understanding receipts and deliveries\n• Warehouse organization`;
    };

    const handleSendMessage = async (content: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setIsLoading(true);

        // Get current page context
        const context = getPageContext();

        // Simulate AI response with context awareness
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: generateAIResponse(content, context),
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiResponse]);
            setIsLoading(false);
        }, 800);
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
                        <div>
                            <h3 className="font-semibold text-lg">Trayvorix AI</h3>
                            <p className="text-xs text-gray-400">Context-aware assistant</p>
                        </div>
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
                    {isLoading && (
                        <div className="flex items-center gap-2 text-gray-400">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Action Tabs */}
                <div className="px-4 py-2 bg-[#1c1c1e] flex items-center gap-2 overflow-x-auto">
                    <button className="px-4 py-2 rounded-xl bg-[#2b9381] text-white text-xs font-medium whitespace-nowrap">
                        Context-Aware
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-[#2c2c2e] text-gray-400 text-xs font-medium whitespace-nowrap hover:bg-gray-700 hover:text-white transition-colors">
                        Page: {getPageContext()}
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

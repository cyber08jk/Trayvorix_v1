import { useState } from 'react';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';

interface WarehouseStats {
    id: string;
    name: string;
    location: string;
    capacity: number;
    usedCapacity: number;
    manager: string;
    status: 'active' | 'maintenance' | 'inactive';
    temperature?: number; // For cold storage
    humidity?: number;
}

const MOCK_WAREHOUSES: WarehouseStats[] = [
    {
        id: '1',
        name: 'Mumbai Central Hub',
        location: 'Andheri East, Mumbai, MH',
        capacity: 50000,
        usedCapacity: 38500,
        manager: 'Rajesh Kumar',
        status: 'active',
        temperature: 24,
        humidity: 45,
    },
    {
        id: '2',
        name: 'Delhi Distribution Center',
        location: 'Okhla Phase III, New Delhi, DL',
        capacity: 75000,
        usedCapacity: 62000,
        manager: 'Amit Singh',
        status: 'active',
        temperature: 22,
        humidity: 40,
    },
    {
        id: '3',
        name: 'Bangalore Cold Chain',
        location: 'Electronic City, Bangalore, KA',
        capacity: 25000,
        usedCapacity: 12000,
        manager: 'Priya Sharma',
        status: 'active',
        temperature: -4,
        humidity: 30,
    },
    {
        id: '4',
        name: 'Chennai Port Warehouse',
        location: 'Chennai Port, Chennai, TN',
        capacity: 100000,
        usedCapacity: 95000,
        manager: 'Suresh Reddy',
        status: 'maintenance',
        temperature: 26,
        humidity: 60,
    },
];

export function Warehouses() {
    const [searchTerm, setSearchTerm] = useState('');
    const [warehouses] = useState<WarehouseStats[]>(MOCK_WAREHOUSES);

    const filteredWarehouses = warehouses.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Warehouses
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Manage your storage locations and capacity across India.
                    </p>
                </div>
                <Button variant="primary">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Warehouse
                </Button>
            </div>

            {/* Search and Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Input
                        type="text"
                        placeholder="Search warehouses by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 flex items-center justify-between border border-indigo-100 dark:border-indigo-800">
                    <div>
                        <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300">Total Capacity</p>
                        <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                            {(warehouses.reduce((acc, w) => acc + w.capacity, 0) / 1000).toFixed(0)}k Units
                        </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Warehouses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredWarehouses.map((warehouse) => {
                    const usagePercent = Math.round((warehouse.usedCapacity / warehouse.capacity) * 100);

                    return (
                        <div key={warehouse.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-300 group">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {warehouse.name}
                                        </h3>
                                        <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {warehouse.location}
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(warehouse.status)}`}>
                                        {warehouse.status}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600 dark:text-gray-400">Capacity Usage</span>
                                            <span className={`font-medium ${usagePercent > 90 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                                {usagePercent}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${usagePercent > 90 ? 'bg-red-500' :
                                                    usagePercent > 75 ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${usagePercent}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>{warehouse.usedCapacity.toLocaleString()} used</span>
                                            <span>{warehouse.capacity.toLocaleString()} total</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Manager</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{warehouse.manager}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Conditions</p>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                                    <svg className="w-3 h-3 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                    </svg>
                                                    {warehouse.temperature}°C
                                                </span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                                    <svg className="w-3 h-3 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                                    </svg>
                                                    {warehouse.humidity}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 flex justify-between items-center">
                                <button className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center">
                                    View Inventory
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

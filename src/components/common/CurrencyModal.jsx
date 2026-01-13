import React, { useState, useMemo } from 'react';

export default function CurrencyModal({ isOpen, onClose, currentCurrency, onSelect }) {
    if (!isOpen) return null;

    const [searchQuery, setSearchQuery] = useState("");

    const currencies = [
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
        { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
        { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
        { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
        { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
        { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
        { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
        { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
        { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
        { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
        { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
        { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
        { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
        { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
        { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
        { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
        { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
        { code: 'THB', symbol: '฿', name: 'Thai Baht' },
        { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
        { code: 'AED', symbol: 'د.إ', name: 'United Arab Emirates Dirham' },
        { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
        { code: 'NPR', symbol: 'रु', name: 'Nepalese Rupee' },

    ];

    const filteredCurrencies = useMemo(() => {
        if (!searchQuery) return currencies;
        return currencies.filter(curr =>
            curr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            curr.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            curr.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <div className="fixed inset-0 z-[80] flex justify-center items-end md:items-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="bg-white dark:bg-gray-800 w-full md:w-[450px] rounded-t-3xl md:rounded-2xl shadow-2xl relative z-10 transform transition-transform duration-300 ease-out animate-slide-up md:animate-scale-in overflow-hidden h-[85vh] md:h-auto md:max-h-[85vh] flex flex-col">

                {/* Header */}
                <div className="p-6 pb-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Select Currency</h3>
                        <button
                            onClick={onClose}
                            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search country, currency or code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 transition"
                            autoFocus
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-2">
                    {filteredCurrencies.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                            <p>No currencies found matching "{searchQuery}"</p>
                        </div>
                    ) : (
                        filteredCurrencies.map((curr) => {
                            const isSelected = currentCurrency === curr.symbol;
                            return (
                                <button
                                    key={curr.code}
                                    onClick={() => {
                                        onSelect(curr.symbol);
                                        onClose();
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all active:scale-98 relative overflow-hidden group ${isSelected
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-110 ${isSelected
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-none'
                                                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-600'
                                            }`}>
                                            {curr.symbol}
                                        </div>
                                        <div className="text-left">
                                            <div className="flex items-center gap-2">
                                                <p className={`font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-white'}`}>
                                                    {curr.code}
                                                </p>
                                                {curr.code === 'INR' && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">Popular</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                {curr.name}
                                            </p>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="text-blue-600 dark:text-blue-400 relative z-10">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                        Don't see your currency? Contact support.
                    </p>
                </div>
            </div>
        </div>
    );
}

import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
    const [currency, setCurrency] = useState(() => {
        try {
            const stored = localStorage.getItem('settings_currency');
            return stored || '₹';
        } catch (e) {
            return '₹';
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('settings_currency', currency);
        } catch (e) {
            console.warn("Failed to save currency setting");
        }
    }, [currency]);

    const value = {
        currency,
        setCurrency
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}

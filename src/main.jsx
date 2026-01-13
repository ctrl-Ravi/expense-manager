import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider>
            <ToastProvider>
                <App />
            </ToastProvider>
        </ThemeProvider>
    </React.StrictMode>,
)

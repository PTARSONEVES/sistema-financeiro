import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className="fixed top-20 right-4 z-50 p-3 rounded-lg 
                       bg-gray-200 dark:bg-gray-700 
                       hover:bg-gray-300 dark:hover:bg-gray-600 
                       transition-colors shadow-lg"
            aria-label="Alternar tema"
        >
            {darkMode ? '☀️' : '🌙'}
        </button>
    );
}
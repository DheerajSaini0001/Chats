import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-300 border border-slate-200 dark:border-slate-700"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun size={20} className="text-yellow-400" />
            ) : (
                <Moon size={20} className="text-slate-600" />
            )}
        </button>
    );
};

export default ThemeToggle;

import React, { createContext, useContext, useEffect, useState } from "react";

// Creating the types and interfaces
type Theme = "light" | "dark";

interface ThemeProviderProps{
    children? : React.ReactNode;
}

interface ThemeContextState{
    theme : Theme;
    setTheme : (theme: Theme) => void;
    toggleTheme : () => void;
}

// we need a container that will hold the theme data.
const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

export function ThemeProvider ({children}: ThemeProviderProps) {
    // Add a theme state.
    const [theme, setTheme] = useState<Theme>(
        // Adding local storage logic
        () => { 
            const saved = localStorage.getItem('dailysync-theme');
            if (saved === 'light' || saved === 'dark') return saved;
            return window.matchMedia('(prefers-color-scheme: dark)').matches? 'dark' : 'light';
        }
    );

    // Adding useEffect to sync HTML class
    useEffect(()=>{
        const root = window.document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(theme);    
        localStorage.setTheme("dailysync-theme", theme);
    }, [theme]);

    // now we need a function to flip between the themes.
    const toggleTheme = () => {
        setTheme(prev => prev === "light"? "dark" : "light") ;
    };

 
    return (
        <ThemeContext.Provider value={{theme, setTheme, toggleTheme}}>
        {children}
        </ThemeContext.Provider>
    );
}

/* eslint-disable react-refresh/only-export-components */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    // Handling errors
    if (context == undefined){
        throw new Error ("useTheme must be used within ThemeProvider") ;
    }
    return context;
}
import { createContext } from "react";

// Creating the types and interfaces
type Theme = "light" | "dark";

interface ThemeContextState{
    theme : Theme;
    setTheme : (theme: Theme) => void;
    toggleTheme : () => void;
}

// we need a container that will hold the theme data.
export const ThemeContext = createContext<ThemeContextState | undefined>(undefined);
'use client';

import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Helper function to safely access localStorage
const getStoredTheme = (key: string, defaultTheme: Theme): Theme => {
  if (typeof window === 'undefined') return defaultTheme;
  
  try {
    const stored = window.localStorage.getItem(key);
    return stored === 'dark' || stored === 'light' ? stored : defaultTheme;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return defaultTheme;
  }
};

// Helper function to safely set theme in localStorage
const setStoredTheme = (key: string, theme: Theme) => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, theme);
    }
  } catch (error) {
    console.error('Error setting theme in localStorage:', error);
  }
};

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'theme-preference',
  ...props
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  
  // Initialize theme state with a safe default that works on the server
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // Only access localStorage after mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    
    // Check for system preference if no theme is set
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = getStoredTheme(storageKey, prefersDark ? 'dark' : 'light');
    
    setThemeState(initialTheme);
    
    // Add class to body to prevent flash of unstyled content
    document.documentElement.classList.add(initialTheme);
    document.body.classList.add('theme-loaded');
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const newTheme = mediaQuery.matches ? 'dark' : 'light';
      setThemeState(newTheme);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      document.body.classList.remove('theme-loaded');
    };
  }, [storageKey]);

  // Update the DOM when the theme changes
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Update data-theme attribute for other libraries that might use it
    root.setAttribute('data-theme', theme);
    
    // Store the theme preference
    setStoredTheme(storageKey, theme);
  }, [theme, mounted, storageKey]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Don't render anything until we're on the client side
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};

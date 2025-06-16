'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './theme-provider';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Only run on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Don't render anything until we're on the client side
  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="w-10 h-10" 
        aria-hidden="true"
        disabled
      >
        <Sun className="h-5 w-5 opacity-0" />
      </Button>
    );
  }

  const isDark = theme === 'dark';
  const label = isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-10 h-10 text-foreground/70 hover:text-foreground transition-colors"
      aria-label={label}
      title={label}
      suppressHydrationWarning
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">{label}</span>
    </Button>
  );
}

declare module '@/components/theme/theme-provider' {
  import { ReactNode } from 'react';
  
  type Theme = 'light' | 'dark' | 'system';
  
  interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
  }
  
  interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
  }
  
  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
  export function useTheme(): ThemeContextType;
}

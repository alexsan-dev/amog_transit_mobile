import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { View, Appearance } from 'react-native';
import { storageGet, storageSet } from '@/src/lib/storage';
import { colors } from './colors';

export type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedScheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeMode;
  colorScheme: ResolvedScheme;
  setTheme: (t: ThemeMode) => void;
  c: typeof colors.light;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  colorScheme: 'light',
  setTheme: () => {},
  c: colors.light,
});

const STORAGE_KEY = 'amog-theme-preference';

function getSystemScheme(): ResolvedScheme {
  return Appearance.getColorScheme() ?? 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<ResolvedScheme>(getSystemScheme());

  useEffect(() => {
    storageGet(STORAGE_KEY).then((val) => {
      if (val) setThemeState(val as ThemeMode);
    });
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme ?? 'light');
    });
    return () => sub.remove();
  }, []);

  const setTheme = useCallback(async (t: ThemeMode) => {
    setThemeState(t);
    await storageSet(STORAGE_KEY, t);
  }, []);

  const colorScheme: ResolvedScheme = theme === 'system' ? systemScheme : theme;

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, setTheme, c: colors[colorScheme] }}>
      <View className={colorScheme === 'dark' ? 'flex-1 dark' : 'flex-1'}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

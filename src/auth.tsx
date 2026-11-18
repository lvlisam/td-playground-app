import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  passwordRecovery: boolean;
  clearPasswordRecovery: () => void;
  authFlowVisible: boolean;
  setAuthFlowVisible: (visible: boolean) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [authFlowVisible, setAuthFlowVisible] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const handleAuthUrl = async (url: string) => {
      try {
        const callbackUrl = new URL(url);
        const code = callbackUrl.searchParams.get('code');
        if (!code) return;

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && callbackUrl.searchParams.get('type') === 'recovery') {
          setPasswordRecovery(true);
        }
      } catch {
        // Invalid or expired callback links leave the user on the app sign-in flow.
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleAuthUrl(url);
    });
    void Linking.getInitialURL().then((url) => {
      if (url) return handleAuthUrl(url);
      return undefined;
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => subscription.remove();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    loading,
    passwordRecovery,
    clearPasswordRecovery: () => setPasswordRecovery(false),
    authFlowVisible,
    setAuthFlowVisible,
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setPasswordRecovery(false);
    },
  }), [session, loading, passwordRecovery, authFlowVisible]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

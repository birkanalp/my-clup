import { useEffect } from 'react';
import { supabase } from './supabase';

export function useDevAutoSignIn() {
  useEffect(() => {
    async function ensureSession() {
      if (!__DEV__ || !supabase) {
        return;
      }

      if (process.env.EXPO_PUBLIC_DEV_AUTO_SIGN_IN !== 'true') {
        return;
      }

      const email = process.env.EXPO_PUBLIC_DEV_USER_EMAIL;
      const password = process.env.EXPO_PUBLIC_DEV_USER_PASSWORD;

      if (!email || !password) {
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.warn('[mobile-user] dev auto sign-in failed:', error.message);
      }
    }

    void ensureSession();
  }, []);
}

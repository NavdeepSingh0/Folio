import { create } from 'zustand';
import { supabase } from '../supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initialized: false,
  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user || null, initialized: true });
    
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user || null });
    });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '../i18n/translations';

interface Member {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio_fr?: string;
  bio_en?: string;
  cruises_done: string[];
  is_active: boolean;
  created_at: string;
}

interface AppState {
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Member/User
  currentMember: Member | null;
  setCurrentMember: (member: Member | null) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Language
      language: 'fr',
      setLanguage: (lang) => set({ language: lang }),
      
      // Member
      currentMember: null,
      setCurrentMember: (member) => set({ currentMember: member }),
      
      // Loading
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'sognudimare-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
        currentMember: state.currentMember,
      }),
    }
  )
);

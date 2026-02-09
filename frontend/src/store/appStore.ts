import { create } from 'zustand';
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

export const useAppStore = create<AppState>()((set) => ({
  // Language
  language: 'fr',
  setLanguage: (lang) => set({ language: lang }),
  
  // Member
  currentMember: null,
  setCurrentMember: (member) => set({ currentMember: member }),
  
  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

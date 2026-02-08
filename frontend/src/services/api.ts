import axios from 'axios';

// Use relative URL for API calls - works on all platforms
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cruise types
export interface CruiseDate {
  date: string;
  status: 'available' | 'limited' | 'full';
  remaining_places?: number;
}

export interface CruisePricing {
  cabin_price: number | null;
  private_price: number | null;
  currency: string;
}

export interface Cruise {
  id: string;
  name_fr: string;
  name_en: string;
  subtitle_fr: string;
  subtitle_en: string;
  description_fr: string;
  description_en: string;
  image_url: string;
  destination: string;
  cruise_type: 'cabin' | 'private' | 'both';
  duration: string;
  departure_port: string;
  pricing: CruisePricing;
  highlights_fr: string[];
  highlights_en: string[];
  available_dates: CruiseDate[];
  program_fr: string[];
  program_en: string[];
  is_active: boolean;
  order: number;
}

// Member types
export interface Member {
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

// Post types
export interface PostComment {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  title: string;
  content: string;
  image_url?: string;
  category: 'general' | 'trip_report' | 'tips' | 'meetup';
  likes: string[];
  comments: PostComment[];
  created_at: string;
  updated_at: string;
}

// API functions
export const cruiseApi = {
  getAll: async (): Promise<Cruise[]> => {
    const response = await api.get('/cruises');
    return response.data;
  },
  
  getById: async (id: string): Promise<Cruise> => {
    const response = await api.get(`/cruises/${id}`);
    return response.data;
  },
};

export const memberApi = {
  getAll: async (): Promise<Member[]> => {
    const response = await api.get('/members');
    return response.data;
  },
  
  getById: async (id: string): Promise<Member> => {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },
  
  getByEmail: async (email: string): Promise<Member> => {
    const response = await api.get(`/members/email/${email}`);
    return response.data;
  },
  
  create: async (data: { username: string; email: string; bio_fr?: string; bio_en?: string }): Promise<Member> => {
    const response = await api.post('/members', data);
    return response.data;
  },
};

export const postApi = {
  getAll: async (category?: string): Promise<CommunityPost[]> => {
    const params = category ? { category } : {};
    const response = await api.get('/posts', { params });
    return response.data;
  },
  
  getById: async (id: string): Promise<CommunityPost> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },
  
  create: async (data: {
    author_id: string;
    author_name: string;
    author_avatar?: string;
    title: string;
    content: string;
    category: string;
  }): Promise<CommunityPost> => {
    const response = await api.post('/posts', data);
    return response.data;
  },
  
  toggleLike: async (postId: string, memberId: string): Promise<{ likes_count: number; liked: boolean }> => {
    const response = await api.post(`/posts/${postId}/like?member_id=${memberId}`);
    return response.data;
  },
  
  addComment: async (postId: string, data: { author_id: string; author_name: string; content: string }): Promise<CommunityPost> => {
    const response = await api.post(`/posts/${postId}/comments`, data);
    return response.data;
  },
  
  delete: async (postId: string): Promise<void> => {
    await api.delete(`/posts/${postId}`);
  },
};

export const seedDatabase = async (): Promise<void> => {
  await api.post('/seed');
};

export default api;

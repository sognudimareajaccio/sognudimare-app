// Simple API service using fetch for better web compatibility
import Constants from 'expo-constants';

// Use environment variable or fallback to relative path
const getBaseUrl = () => {
  const backendUrl = Constants.expoConfig?.extra?.backendUrl || 
                     process.env.EXPO_PUBLIC_BACKEND_URL ||
                     '';
  return `${backendUrl}/api`;
};

const BASE_URL = getBaseUrl();

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { response: { status: response.status, data: errorData } };
  }
  
  return response.json();
}

// Cruise types
export interface CruiseDate {
  date: string;
  status: 'available' | 'limited' | 'full';
  remaining_places?: number;
}

// NEW: Detailed availability with date range, price, and status
export interface CruiseAvailability {
  date_range: string;  // e.g., "du 23 mai au 6 juin 2026"
  price: number;  // Price per passenger
  status: 'available' | 'limited' | 'full';
  remaining_places?: number;
  status_label?: string;  // e.g., "COMPLET", "Reste 4 places"
}

// NEW: Detailed program day by day
export interface ProgramDay {
  day: number;
  title: string;
  description: string;
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
  // NEW: Detailed availabilities with date range, price, status
  availabilities?: CruiseAvailability[];
  // NEW: Detailed program day by day
  detailed_program_fr?: ProgramDay[];
  detailed_program_en?: ProgramDay[];
  // Legacy fields
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
    return fetchApi<Cruise[]>('/cruises');
  },
  
  getById: async (id: string): Promise<Cruise> => {
    return fetchApi<Cruise>(`/cruises/${id}`);
  },
};

export const memberApi = {
  getAll: async (): Promise<Member[]> => {
    return fetchApi<Member[]>('/members');
  },
  
  getById: async (id: string): Promise<Member> => {
    return fetchApi<Member>(`/members/${id}`);
  },
  
  getByEmail: async (email: string): Promise<Member> => {
    return fetchApi<Member>(`/members/email/${email}`);
  },
  
  create: async (data: { username: string; email: string; bio_fr?: string; bio_en?: string }): Promise<Member> => {
    return fetchApi<Member>('/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const postApi = {
  getAll: async (category?: string): Promise<CommunityPost[]> => {
    const endpoint = category ? `/posts?category=${category}` : '/posts';
    return fetchApi<CommunityPost[]>(endpoint);
  },
  
  getById: async (id: string): Promise<CommunityPost> => {
    return fetchApi<CommunityPost>(`/posts/${id}`);
  },
  
  create: async (data: {
    author_id: string;
    author_name: string;
    author_avatar?: string;
    title: string;
    content: string;
    category: string;
  }): Promise<CommunityPost> => {
    return fetchApi<CommunityPost>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  toggleLike: async (postId: string, memberId: string): Promise<{ likes_count: number; liked: boolean }> => {
    return fetchApi<{ likes_count: number; liked: boolean }>(`/posts/${postId}/like?member_id=${memberId}`, {
      method: 'POST',
    });
  },
  
  addComment: async (postId: string, data: { author_id: string; author_name: string; content: string }): Promise<CommunityPost> => {
    return fetchApi<CommunityPost>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (postId: string): Promise<void> => {
    await fetchApi<void>(`/posts/${postId}`, {
      method: 'DELETE',
    });
  },
};

export const seedDatabase = async (): Promise<{ message: string }> => {
  return fetchApi<{ message: string }>('/seed', {
    method: 'POST',
  });
};

// Direct Messaging types
export interface DirectMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  receiver_name: string;
  content: string;
  is_from_captain: boolean;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  participant_names: string[];
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

export interface CaptainInfo {
  id: string;
  name: string;
  avatar: string;
  is_captain: boolean;
}

// Messaging API
export const messageApi = {
  getConversations: async (userId: string): Promise<Conversation[]> => {
    return fetchApi<Conversation[]>(`/messages/conversations/${userId}`);
  },
  
  getMessages: async (userId: string, otherUserId: string): Promise<DirectMessage[]> => {
    return fetchApi<DirectMessage[]>(`/messages/${userId}/${otherUserId}`);
  },
  
  sendMessage: async (data: {
    sender_id: string;
    sender_name: string;
    receiver_id: string;
    receiver_name: string;
    content: string;
    is_from_captain?: boolean;
  }): Promise<DirectMessage> => {
    return fetchApi<DirectMessage>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  getCaptainInfo: async (): Promise<CaptainInfo> => {
    return fetchApi<CaptainInfo>('/messages/captain');
  },
};

// Admin API
export const adminApi = {
  login: async (username: string, password: string): Promise<{ success: boolean; token: string }> => {
    return fetchApi<{ success: boolean; token: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  
  getPosts: async (): Promise<CommunityPost[]> => {
    return fetchApi<CommunityPost[]>('/admin/posts');
  },
  
  deletePost: async (postId: string): Promise<void> => {
    await fetchApi<void>(`/admin/posts/${postId}`, { method: 'DELETE' });
  },
  
  deleteComment: async (postId: string, commentId: string): Promise<void> => {
    await fetchApi<void>(`/admin/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
  },
  
  getMembers: async (): Promise<Member[]> => {
    return fetchApi<Member[]>('/admin/members');
  },
  
  banMember: async (memberId: string): Promise<void> => {
    await fetchApi<void>(`/admin/members/${memberId}/ban`, { method: 'PUT' });
  },
  
  unbanMember: async (memberId: string): Promise<void> => {
    await fetchApi<void>(`/admin/members/${memberId}/unban`, { method: 'PUT' });
  },
  
  getMessages: async (): Promise<DirectMessage[]> => {
    return fetchApi<DirectMessage[]>('/admin/messages');
  },
  
  deleteMessage: async (messageId: string): Promise<void> => {
    await fetchApi<void>(`/admin/messages/${messageId}`, { method: 'DELETE' });
  },
  
  getCruises: async (): Promise<Cruise[]> => {
    return fetchApi<Cruise[]>('/admin/cruises');
  },
  
  updateCruise: async (cruiseId: string, data: Partial<Cruise>): Promise<Cruise> => {
    return fetchApi<Cruise>(`/admin/cruises/${cruiseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  deleteCruise: async (cruiseId: string): Promise<void> => {
    await fetchApi<void>(`/admin/cruises/${cruiseId}`, { method: 'DELETE' });
  },
};

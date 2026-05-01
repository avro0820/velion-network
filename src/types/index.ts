import { Timestamp } from 'firebase/firestore';

export type UserRole = 'owner' | 'admin' | 'moderator' | 'user';
export type UserStatus = 'pending' | 'approved' | 'suspended';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  approved_platforms?: string[];
  has_global_access?: boolean;
  display_name?: string;
  photo_url?: string;
  cover_photo_url?: string;
  phone_number?: string;
  date_of_birth?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    whatsapp?: string;
    facebook?: string;
    tiktok?: string;
    instagram?: string;
    discord?: string;
  };
  is_suspended?: boolean;
  suspended_until?: string | Timestamp;
  created_at?: string | Timestamp;
  system_message?: string;
  followers?: string[];
  following?: string[];
  post_count?: number;
}

export interface Platform {
  id: string;
  name: string;
  logo_url: string;
  official_link: string;
  sector?: string;
  execution_protocol?: string[];
  created_at: Timestamp | string;
}

export interface Template {
  id: string;
  platform_id: string;
  category: string;
  text: string;
  instructions?: string;
  video_url?: string;
  file_url?: string;
  created_at: Timestamp | string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_email: string;
  sender_name?: string;
  sender_photo?: string;
  text?: string;
  image_url?: string;
  timestamp: Timestamp | string | null;
  is_admin: boolean;
}

export interface Post {
  id: string;
  author_id: string;
  author_name: string;
  author_photo?: string;
  author_username?: string;
  content: string;
  image_url?: string;
  likes: string[];
  comment_count: number;
  created_at: Timestamp | string;
  platform_tags?: string[];
}

export interface PostComment {
  id: string;
  author_id: string;
  author_name: string;
  author_photo?: string;
  text: string;
  created_at: Timestamp | string;
}

export interface DirectConversation {
  id: string;
  participants: string[];
  participant_names: Record<string, string>;
  participant_photos: Record<string, string>;
  last_message?: string;
  last_message_at?: Timestamp | string;
  unread_count?: Record<string, number>;
}

export interface Notification {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'system' | 'approval';
  from_user_id?: string;
  from_user_name?: string;
  message: string;
  read: boolean;
  created_at: Timestamp | string;
  link?: string;
}

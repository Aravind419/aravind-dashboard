
import { ReactNode } from 'react';
import { Instagram, Twitter, Facebook, Linkedin, Youtube, Github } from 'lucide-react';

export type SocialMediaPlatform = 'instagram' | 'twitter' | 'facebook' | 'linkedin' | 'youtube' | 'github';

export interface SocialMediaAccount {
  id: string;
  platform: SocialMediaPlatform;
  username: string;
  url: string;
  subscribers: number;
}

export const platformColors: Record<SocialMediaPlatform, string> = {
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  twitter: 'bg-blue-400',
  facebook: 'bg-blue-600',
  linkedin: 'bg-blue-700',
  youtube: 'bg-red-600',
  github: 'bg-gray-800'
};

// In a TypeScript file, we can't directly assign JSX elements in an object
// We'll use the function from SocialIcons.tsx instead
import { getSocialIcons } from './SocialIcons';
export const socialIcons = getSocialIcons();

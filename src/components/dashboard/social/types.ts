
import { ReactNode } from 'react';

export type SocialMediaPlatform = 'instagram' | 'twitter' | 'facebook' | 'linkedin' | 'youtube' | 'github';

export interface SocialMediaAccount {
  id: string;
  platform: SocialMediaPlatform;
  username: string;
  url: string;
  subscribers: number;
}

export const socialIcons: Record<SocialMediaPlatform, ReactNode> = {};

export const platformColors: Record<SocialMediaPlatform, string> = {
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  twitter: 'bg-blue-400',
  facebook: 'bg-blue-600',
  linkedin: 'bg-blue-700',
  youtube: 'bg-red-600',
  github: 'bg-gray-800'
};

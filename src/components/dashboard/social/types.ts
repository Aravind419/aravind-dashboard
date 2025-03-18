
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

export const socialIcons: Record<SocialMediaPlatform, ReactNode> = {
  instagram: <Instagram className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  github: <Github className="h-5 w-5" />
};

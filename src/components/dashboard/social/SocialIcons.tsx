
import { Instagram, Twitter, Facebook, Linkedin, Youtube, Github } from 'lucide-react';
import { SocialMediaPlatform } from './types';
import { ReactNode } from 'react';

export const getSocialIcons = (): Record<SocialMediaPlatform, ReactNode> => ({
  instagram: <Instagram className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  github: <Github className="h-5 w-5" />
});

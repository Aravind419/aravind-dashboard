
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SocialMediaPlatform } from './types';

interface SocialMediaFormProps {
  isFormVisible: boolean;
  setIsFormVisible: (visible: boolean) => void;
  platform: SocialMediaPlatform;
  setPlatform: (platform: SocialMediaPlatform) => void;
  username: string;
  setUsername: (username: string) => void;
  url: string;
  setUrl: (url: string) => void;
  subscribers: string;
  setSubscribers: (subscribers: string) => void;
  handleAddAccount: () => void;
  resetForm: () => void;
}

const SocialMediaForm = ({
  isFormVisible,
  setIsFormVisible,
  platform,
  setPlatform,
  username,
  setUsername,
  url,
  setUrl,
  subscribers,
  setSubscribers,
  handleAddAccount,
  resetForm
}: SocialMediaFormProps) => {
  if (!isFormVisible) {
    return (
      <Button 
        onClick={() => setIsFormVisible(true)}
        className="gap-2 hover:scale-105 transition-transform"
      >
        <Plus className="h-4 w-4" />
        Add Social Account
      </Button>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-secondary/30 rounded-lg animate-fade-in">
      <div className="flex flex-col md:flex-row gap-3">
        <Select value={platform} onValueChange={(val: SocialMediaPlatform) => setPlatform(val)}>
          <SelectTrigger className="w-full md:w-1/4">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="github">GitHub</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full md:w-1/4"
        />
        
        <Input
          placeholder="Profile URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full md:w-1/4"
        />
        
        <Input
          placeholder="Subscribers/Followers"
          type="number"
          value={subscribers}
          onChange={(e) => setSubscribers(e.target.value)}
          className="w-full md:w-1/4"
        />
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={resetForm}>Cancel</Button>
        <Button 
          onClick={handleAddAccount}
          disabled={!username.trim() || !url.trim()}
          className="hover:scale-105 transition-transform"
        >
          Save Account
        </Button>
      </div>
    </div>
  );
};

export default SocialMediaForm;

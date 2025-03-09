
import { useState } from 'react';
import { Instagram, Twitter, Facebook, Trash2, Plus, Linkedin, Youtube, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import useLocalStorage from '@/hooks/useLocalStorage';

type SocialMediaPlatform = 'instagram' | 'twitter' | 'facebook' | 'linkedin' | 'youtube' | 'github';

interface SocialMediaAccount {
  id: string;
  platform: SocialMediaPlatform;
  username: string;
  url: string;
  subscribers: number;
}

const socialIcons = {
  instagram: <Instagram className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  github: <Github className="h-5 w-5" />
};

const platformColors = {
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  twitter: 'bg-blue-400',
  facebook: 'bg-blue-600',
  linkedin: 'bg-blue-700',
  youtube: 'bg-red-600',
  github: 'bg-gray-800'
};

const SocialMediaManager = () => {
  const [accounts, setAccounts] = useLocalStorage<SocialMediaAccount[]>('social-accounts', []);
  const [platform, setPlatform] = useState<SocialMediaPlatform>('instagram');
  const [username, setUsername] = useState('');
  const [url, setUrl] = useState('');
  const [subscribers, setSubscribers] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  const handleAddAccount = () => {
    if (!username.trim() || !url.trim()) return;
    
    const newAccount: SocialMediaAccount = {
      id: crypto.randomUUID(),
      platform,
      username,
      url: url.startsWith('http') ? url : `https://${url}`,
      subscribers: subscribers ? parseInt(subscribers) : 0
    };
    
    setAccounts([...accounts, newAccount]);
    resetForm();
    toast.success('Social media account added successfully');
  };
  
  const handleDeleteAccount = (id: string) => {
    setAccounts(accounts.filter(account => account.id !== id));
    toast.success('Account removed successfully');
  };
  
  const resetForm = () => {
    setPlatform('instagram');
    setUsername('');
    setUrl('');
    setSubscribers('');
    setIsFormVisible(false);
  };
  
  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  // Format subscriber count for display
  const formatSubscribers = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };
  
  return (
    <div className="dash-card">
      <div className="dash-card-title">
        <Instagram className="h-5 w-5" />
        <span>Social Media Accounts</span>
      </div>
      
      <div className="mb-4">
        {!isFormVisible ? (
          <Button 
            onClick={() => setIsFormVisible(true)}
            className="gap-2 hover:scale-105 transition-transform"
          >
            <Plus className="h-4 w-4" />
            Add Social Account
          </Button>
        ) : (
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
        )}
      </div>
      
      {accounts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Instagram className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>No social media accounts added yet.</p>
          <p className="text-sm">Add your accounts to keep track of them in one place.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {accounts.map(account => (
            <div 
              key={account.id}
              className={`relative flex items-center p-4 rounded-lg text-white hover:scale-[1.02] transition-transform cursor-pointer ${platformColors[account.platform]}`}
              onClick={() => openInNewTab(account.url)}
            >
              <div className="mr-4">{socialIcons[account.platform]}</div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-medium text-white">{account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}</h3>
                <p className="text-sm opacity-90 truncate">@{account.username}</p>
                {account.subscribers > 0 && (
                  <p className="text-xs opacity-75 mt-1">
                    {formatSubscribers(account.subscribers)} subscribers
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 opacity-70 hover:opacity-100 hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAccount(account.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialMediaManager;

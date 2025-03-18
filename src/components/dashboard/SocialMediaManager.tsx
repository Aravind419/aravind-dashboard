
import { useState } from 'react';
import { Instagram } from 'lucide-react';
import { toast } from 'sonner';
import useLocalStorage from '@/hooks/useLocalStorage';
import SocialMediaForm from './social/SocialMediaForm';
import SocialMediaCard from './social/SocialMediaCard';
import { SocialMediaAccount, SocialMediaPlatform } from './social/types';
import { formatSubscribers, openInNewTab } from './social/socialUtils';

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
  
  return (
    <div className="dash-card">
      <div className="dash-card-title">
        <Instagram className="h-5 w-5" />
        <span>Social Media Accounts</span>
      </div>
      
      <div className="mb-4">
        <SocialMediaForm
          isFormVisible={isFormVisible}
          setIsFormVisible={setIsFormVisible}
          platform={platform}
          setPlatform={setPlatform}
          username={username}
          setUsername={setUsername}
          url={url}
          setUrl={setUrl}
          subscribers={subscribers}
          setSubscribers={setSubscribers}
          handleAddAccount={handleAddAccount}
          resetForm={resetForm}
        />
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
            <SocialMediaCard
              key={account.id}
              account={account}
              openInNewTab={openInNewTab}
              handleDeleteAccount={handleDeleteAccount}
              formatSubscribers={formatSubscribers}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialMediaManager;


import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SocialMediaAccount, platformColors, socialIcons } from './types';

interface SocialMediaCardProps {
  account: SocialMediaAccount;
  openInNewTab: (url: string) => void;
  handleDeleteAccount: (id: string) => void;
  formatSubscribers: (count: number) => string;
}

const SocialMediaCard = ({
  account,
  openInNewTab,
  handleDeleteAccount,
  formatSubscribers
}: SocialMediaCardProps) => {
  return (
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
  );
};

export default SocialMediaCard;

import { Home, Compass, Gift, BookOpen, User } from 'lucide-react';

type TabId = 'journey' | 'activities' | 'rewards' | 'passport' | 'profile';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; icon: typeof Home; label: string }[] = [
  { id: 'journey', icon: Home, label: 'Journey' },
  { id: 'activities', icon: Compass, label: 'Activities' },
  { id: 'rewards', icon: Gift, label: 'Rewards' },
  { id: 'passport', icon: BookOpen, label: 'Passport' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-secondary' : ''
                }`}
              >
                <tab.icon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export type { TabId };

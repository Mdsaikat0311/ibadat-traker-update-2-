import React from 'react';
import { Home, BookOpen, Sparkles, BookMarked, LayoutGrid } from 'lucide-react';

export type TabId = 'salah' | 'dua' | 'quran' | 'hadith' | 'more' | 'dhikr' | 'duaNotes' | 'reports' | 'settings';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

interface NavItem {
  id: 'salah' | 'dua' | 'quran' | 'hadith' | 'more';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { id: 'salah', label: 'হোম', icon: Home },
  { id: 'dua', label: 'দোয়া', icon: Sparkles },
  { id: 'quran', label: 'আমল', icon: BookOpen },
  { id: 'hadith', label: 'হাদিস', icon: BookMarked },
  { id: 'more', label: 'আরো', icon: LayoutGrid },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  // Determine if activeTab is one of the secondary tabs belonging to 'more'
  const isMoreActive =
    activeTab === 'more' ||
    activeTab === 'dhikr' ||
    activeTab === 'duaNotes' ||
    activeTab === 'reports' ||
    activeTab === 'settings';

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-[#0d1410] border-t border-[#1e2a21] shadow-2xl z-40">
      <div id="nav-bar" className="flex justify-around items-center h-16 px-1">
        {PRIMARY_NAV_ITEMS.map((item) => {
          let isActive = false;
          if (item.id === 'more') {
            isActive = isMoreActive;
          } else {
            isActive = activeTab === item.id;
          }

          const Icon = item.icon;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.id === 'more') {
                  onTabChange('more');
                } else {
                  onTabChange(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center pt-1 pb-1 cursor-pointer transition duration-150 flex-1 select-none group ${
                isActive ? 'text-[#34d399]' : 'text-[#7e9687] hover:text-[#c7dbce]'
              }`}
            >
              <div
                className={`flex items-center justify-center w-11 h-9 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#183925] text-[#4ade80] shadow-xs scale-105'
                    : 'group-hover:bg-[#142018]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <div
                className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                  isActive ? 'font-bold text-[#4ade80]' : 'font-medium text-[#8da596]'
                }`}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

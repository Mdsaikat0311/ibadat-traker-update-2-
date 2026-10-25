import React, { useMemo } from 'react';
import { Trophy, Crown } from 'lucide-react';
import { ChampionInfo, ChampionUser } from '../types/ibadat';

export interface YesterdayChampionCardProps {
  champion?: ChampionInfo | null;
  onClick?: () => void;
  bnDateStr?: string;
}

export const YesterdayChampionCard: React.FC<YesterdayChampionCardProps> = ({
  champion,
  onClick
}) => {
  const users: ChampionUser[] = useMemo(() => {
    if (!champion) return [];
    if (champion.users && champion.users.length > 0) {
      return champion.users;
    }
    if (champion.name) {
      return [{ name: champion.name, points: champion.points || 0 }];
    }
    return [];
  }, [champion]);

  if (users.length === 0) {
    return null;
  }

  // Case 1: Exactly 1 champion
  if (users.length === 1) {
    const champ = users[0];
    return (
      <div
        id="yesterday-champion-box"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        className="flex flex-col items-end cursor-pointer transition transform hover:scale-105 active:scale-95 select-none shrink-0"
        title="গতকালকের সেরা লিডারবোর্ড দেখুন"
      >
        <div className="text-[10px] font-bold text-amber-700 mb-0.5 flex items-center">
          <Trophy className="w-3 h-3 mr-1 text-amber-600 fill-amber-500/20" />
          <span>গতকালকের সেরা</span>
        </div>
        <div className="flex items-center bg-gradient-to-r from-amber-50 to-amber-100/80 border border-amber-300/80 rounded-xl px-2.5 py-1.5 shadow-xs hover:border-amber-400 transition-colors">
          <div className="mr-2 text-right">
            <div className="text-xs font-bold text-gray-800 leading-tight max-w-[120px] truncate" title={champ.name}>
              {champ.name}
            </div>
            <div className="text-[10px] font-extrabold text-amber-800 leading-tight mt-0.5">
              {champ.points} pts
            </div>
          </div>
          <div className="w-7 h-7 bg-amber-200/90 border border-amber-300 rounded-full flex items-center justify-center shadow-2xs shrink-0">
            <Crown className="w-4 h-4 text-amber-700 fill-amber-500" />
          </div>
        </div>
      </div>
    );
  }

  // Case 2: 2 or more champions tied for 1st place
  return (
    <div
      id="yesterday-champion-box"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="flex flex-col items-end cursor-pointer transition transform hover:scale-[1.02] active:scale-95 select-none max-w-[260px] shrink-0"
      title="গতকালকের সেরা লিডারবোর্ড দেখুন (যৌথভাবে প্রথম স্থান)"
    >
      <div className="text-[10px] font-bold text-amber-700 mb-0.5 flex items-center">
        <Trophy className="w-3 h-3 mr-1 text-amber-600 fill-amber-500/20" />
        <span>গতকালকের সেরা ({users.length} জন যৌথভাবে)</span>
      </div>
      <div className="flex flex-wrap justify-end gap-1.5 bg-gradient-to-r from-amber-50 to-amber-100/90 border border-amber-300/90 rounded-xl p-1.5 shadow-xs hover:border-amber-400 transition-colors">
        {users.map((u, idx) => (
          <div
            key={u.id || idx}
            className="flex items-center bg-white/95 border border-amber-200/90 rounded-lg px-2 py-1 shadow-2xs"
          >
            <div className="text-right mr-1.5">
              <div className="text-[11px] font-bold text-gray-800 leading-tight max-w-[95px] truncate" title={u.name}>
                {u.name}
              </div>
              <div className="text-[9.5px] font-extrabold text-amber-700 leading-none mt-0.5">
                {u.points} pts
              </div>
            </div>
            <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

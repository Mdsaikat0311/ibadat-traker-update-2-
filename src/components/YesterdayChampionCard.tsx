import React, { useMemo } from 'react';
import { Trophy, Crown } from 'lucide-react';
import { ChampionInfo, ChampionUser } from '../types/ibadat';

interface YesterdayChampionCardProps {
  champion: ChampionInfo | null;
  onClick: () => void;
  bnDateStr?: string;
}

export const toBengaliNumber = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
};

export const YesterdayChampionCard: React.FC<YesterdayChampionCardProps> = ({
  champion,
  onClick,
  bnDateStr
}) => {
  const championList = useMemo<ChampionUser[]>(() => {
    if (!champion) return [];
    if (champion.users && champion.users.length > 0) {
      return champion.users;
    }
    if (champion.name && champion.name.includes(',')) {
      return champion.name
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean)
        .map((name, i) => ({
          id: `champ_${i}`,
          name,
          points: champion.points
        }));
    }
    if (champion.name) {
      return [
        {
          id: 'champ_0',
          name: champion.name,
          points: champion.points
        }
      ];
    }
    return [];
  }, [champion]);

  // If 1 person (or no champions, single compact box on the right next to title)
  if (championList.length <= 1) {
    const singleChamp = championList[0];
    return (
      <div className="flex justify-between items-end mb-4 relative">
        <div>
          <h2 className="text-xl font-bold text-gray-800">সালাত ও ইবাদত</h2>
          {bnDateStr && <p className="text-xs text-gray-500">{bnDateStr}</p>}
        </div>

        {singleChamp && (
          <div
            id="yesterday-champion-box"
            onClick={onClick}
            className="flex flex-col items-end cursor-pointer transition transform hover:scale-105 active:scale-95"
            title="গতকালকের সেরা লিডারবোর্ড দেখুন"
          >
            <div className="text-[10px] font-bold text-amber-600 mb-0.5 flex items-center">
              <Trophy className="w-3 h-3 mr-1 text-amber-500 fill-amber-500" /> গতকালের সেরা
            </div>
            <div className="flex items-center bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 shadow-xs hover:bg-amber-100/70 transition">
              <div className="mr-2 text-right">
                <div id="champ-name" className="text-xs font-bold text-gray-800 leading-none max-w-[110px] truncate">
                  {singleChamp.name}
                </div>
                <div id="champ-points" className="text-[10px] font-semibold text-amber-700 leading-none mt-1">
                  {singleChamp.points} pts
                </div>
              </div>
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If multiple people (2, 3, 4+) tie with the same highest points:
  // Render header + elongated list card
  return (
    <div className="mb-4 space-y-2">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-gray-800">সালাত ও ইবাদত</h2>
          {bnDateStr && <p className="text-xs text-gray-500">{bnDateStr}</p>}
        </div>
      </div>

      <div
        id="yesterday-champion-box-multi"
        onClick={onClick}
        className="w-full bg-gradient-to-r from-amber-50 via-amber-50/80 to-yellow-50 border border-amber-200/90 rounded-2xl p-3 shadow-xs hover:border-amber-300 hover:shadow-sm transition cursor-pointer"
        title="গতকালকের সেরা লিডারবোর্ড দেখুন"
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200/70">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            </div>
            <span>গতকালকের সেরা ({toBengaliNumber(championList.length)} জন যৌথভাবে)</span>
          </div>
          <div className="flex items-center gap-1 bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-xs">
            <Crown className="w-3 h-3 fill-white text-white" />
            <span>{championList[0].points} pts</span>
          </div>
        </div>

        <div className="space-y-1.5">
          {championList.map((user, idx) => (
            <div
              key={user.id || `${user.name}_${idx}`}
              className="flex items-center justify-between bg-white/95 border border-amber-100/90 rounded-xl px-2.5 py-1.5 shadow-2xs hover:bg-white transition"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {toBengaliNumber(idx + 1)}
                </span>
                <span className="text-xs font-bold text-slate-800 truncate">
                  {user.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  {user.points} pts
                </span>
                <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

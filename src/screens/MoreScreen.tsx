import React from 'react';
import {
  Zap,
  StickyNote,
  BarChart2,
  Settings,
  ChevronRight,
  Sparkles,
  Trophy
} from 'lucide-react';
import { TabId } from '../components/BottomNav';
import { AppStats } from '../types/ibadat';

interface MoreScreenProps {
  appStats: AppStats;
  notesCount: number;
  userName: string;
  onSelectTab: (tab: TabId) => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({
  appStats,
  notesCount,
  userName,
  onSelectTab
}) => {
  return (
    <div className="space-y-4">
      {/* User profile summary banner */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-950 p-4 text-white shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>আস-সালামু আলাইকুম</span>
          </div>
          <h2 className="text-lg font-bold">
            {userName || 'ব্যবহারকারী'}
          </h2>
          <p className="text-xs text-emerald-200/90">
            লাইফটাইম পয়েন্ট: <span className="font-bold text-yellow-300">{appStats.totalLifetimePoints}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-center bg-black/25 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10">
            <div className="flex items-center justify-center gap-1 text-yellow-300 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>আজ</span>
            </div>
            <div className="text-base font-extrabold text-white mt-0.5">
              {appStats.todayPoints}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            title="সেটিংস ও অ্যাকাউন্ট"
            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-black/25 hover:bg-black/40 backdrop-blur-xs border border-white/10 text-white hover:text-emerald-200 transition-all cursor-pointer group shadow-xs"
          >
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
            <span className="text-[9px] font-semibold mt-0.5 text-emerald-100">সেটিংস</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
          অন্যান্য সেকশন ও সুবিধাসমূহ
        </h3>

        {/* 1. Dhikr Tracker - Hidden because already present in Amalnama */}
        <div
          onClick={() => onSelectTab('dhikr')}
          className="hidden"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-amber-100" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                যিকির ও তাসবীহ ট্র্যাকার
              </h4>
              <p className="text-xs text-gray-500 line-clamp-1">
                সুবহানাল্লাহ, আলহামদুলিল্লাহ ও নিত্যদিনের তাসবীহ
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* 2. Reports & Calendar - Hidden because already present in bottom nav */}
        <div
          onClick={() => onSelectTab('reports')}
          className="hidden"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-105 transition-transform">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                রিপোর্ট, ক্যালেন্ডার ও লিডারবোর্ড
              </h4>
              <p className="text-xs text-gray-500 line-clamp-1">
                মাসিক পয়েন্ট হিটম্যাপ, হিস্ট্রি ও কমিউনিটি র‍্যাংক
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              র‍্যাংক
            </span>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* 3. Islamic Notes & Duas */}
        <div
          onClick={() => onSelectTab('duaNotes')}
          className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-teal-500 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
              <StickyNote className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                ব্যক্তিগত নোট ও অতিরিক্ত দু’আ
              </h4>
              <p className="text-xs text-gray-500 line-clamp-1">
                কাস্টম ইসলামিক নোট লিখুন ও সংরক্ষণ করুন ({notesCount}টি নোট)
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* 4. Settings & Account - Converted to top-corner icon button */}
        <div
          onClick={() => onSelectTab('settings')}
          className="hidden"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                সেটিংস ও ক্লাউড অ্যাকাউন্ট
              </h4>
              <p className="text-xs text-gray-500 line-clamp-1">
                নোটিফিকেশন, ব্যাকআপ, পাসওয়ার্ড ও প্রোফাইল
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Home, BookOpen, Sparkles, Settings } from 'lucide-react';
import { SalahScreen } from './SalahScreen';
import { AmalScreen } from './AmalScreen';
import { DhikrScreen } from './DhikrScreen';
import { AppStats, ChampionInfo, TaskStats, ReminderSetting } from '../types/ibadat';
import { IbadatRepository } from '../data/repository';

export type AmalnamaSubTab = 'salah' | 'amal' | 'dhikr';

interface AmalnamaScreenProps {
  currentSubTab: AmalnamaSubTab;
  onSubTabChange: (tab: AmalnamaSubTab) => void;
  dateDisplayStr?: string;
  onGoToToday?: () => void;
  onOpenSettings?: () => void;

  // Salah props
  appStats: AppStats;
  yesterdayChampion?: ChampionInfo | null;
  salahLog: Record<string, boolean>;
  nawafilLog: Record<string, boolean>;
  reminders: Record<string, ReminderSetting>;
  isViewingToday: boolean;
  onToggleSalah: (key: string) => void;
  onToggleNawafil: (key: string) => void;
  onOpenDetails: (name: string, details: string) => void;
  onOpenReminder: (key: string, name: string) => void;
  onOpenLeaderboard: (metricType: string, title: string) => void;
  getMyRank: (metricType: string) => number;
  getTaskStats: (category: string, taskKey: string) => TaskStats;

  // Amal props
  specialAmalLog: Record<string, boolean>;
  morningLog: Record<string, boolean>;
  nightlyLog: Record<string, boolean>;
  quranLog: Record<string, boolean>;
  onToggleRoutineTask: (category: string, taskKey: string) => void;

  // Dhikr props
  dhikrLog: Record<string, boolean>;
  onToggleDhikr: (key: string) => void;
  onOpenAllahNames?: () => void;
}

export const AmalnamaScreen: React.FC<AmalnamaScreenProps> = ({
  currentSubTab,
  onSubTabChange,
  dateDisplayStr,
  onGoToToday,
  onOpenSettings,
  appStats,
  yesterdayChampion,
  salahLog,
  nawafilLog,
  reminders,
  isViewingToday,
  onToggleSalah,
  onToggleNawafil,
  onOpenDetails,
  onOpenReminder,
  onOpenLeaderboard,
  getMyRank,
  getTaskStats,
  specialAmalLog,
  morningLog,
  nightlyLog,
  quranLog,
  onToggleRoutineTask,
  dhikrLog,
  onToggleDhikr,
  onOpenAllahNames
}) => {
  // 1. Calculate Salah completion
  const fardKeys = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'];
  const fardCompleted = fardKeys.filter((k) => Boolean(salahLog[k])).length;

  // 2. Calculate Amal completion
  const allAmalTasks = [
    ...IbadatRepository.SPECIAL_AMAL_TASKS,
    ...IbadatRepository.MORNING_TASKS,
    ...IbadatRepository.NIGHTLY_TASKS,
    ...IbadatRepository.QURAN_TASKS
  ];
  let amalCompleted = 0;
  IbadatRepository.SPECIAL_AMAL_TASKS.forEach((t) => {
    if (specialAmalLog[t.key]) amalCompleted++;
  });
  IbadatRepository.MORNING_TASKS.forEach((t) => {
    if (morningLog[t.key]) amalCompleted++;
  });
  IbadatRepository.NIGHTLY_TASKS.forEach((t) => {
    if (nightlyLog[t.key]) amalCompleted++;
  });
  IbadatRepository.QURAN_TASKS.forEach((t) => {
    if (quranLog[t.key]) amalCompleted++;
  });

  // 3. Calculate Dhikr completion
  const visibleDhikrTasks = IbadatRepository.DHIKR_CHECKLIST_TASKS.filter((t) => !t.hidden);
  const dhikrCompleted = visibleDhikrTasks.filter((t) => Boolean(dhikrLog[t.key])).length;

  return (
    <div className="space-y-4">
      {/* Past Date Alert Banner (if viewing past date) */}
      {!isViewingToday && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 flex items-center justify-between text-amber-900 text-xs shadow-xs">
          <span className="font-semibold">
            📅 আপনি {dateDisplayStr || 'অতীত তারিখ'} এর আমল দেখছেন
          </span>
          {onGoToToday && (
            <button
              type="button"
              onClick={onGoToToday}
              className="px-2.5 py-1 bg-teal-800 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition cursor-pointer"
            >
              আজকের দিনে ফিরুন
            </button>
          )}
        </div>
      )}

      {/* Top Segmented Sub-Tabs Bar with Corner Settings */}
      <div className="sticky -top-4 z-20 -mx-4 px-4 pt-1 pb-2 bg-gradient-to-b from-slate-50 via-slate-50/95 to-slate-50/80 backdrop-blur-xs">
        <div className="flex items-center gap-1.5">
          <div className="flex-1 bg-white p-1 rounded-2xl shadow-xs border border-gray-200/90 grid grid-cols-3 gap-1">
          {/* SubTab 1: Home / Salah */}
          <button
            type="button"
            onClick={() => onSubTabChange('salah')}
            className={`group flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer select-none ${
              currentSubTab === 'salah'
                ? 'bg-gradient-to-r from-teal-800 to-teal-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-teal-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center mb-1">
              <Home
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  currentSubTab === 'salah' ? 'text-teal-200 stroke-[2.4]' : 'text-gray-400 stroke-[1.8]'
                }`}
              />
            </div>
            <span
              className={`text-xs tracking-tight transition-colors ${
                currentSubTab === 'salah' ? 'font-bold text-white' : 'font-semibold text-gray-700'
              }`}
            >
              সালাত
            </span>
            <span
              className={`text-[10px] mt-0.5 px-1.5 py-0.2 rounded-full font-bold leading-none ${
                currentSubTab === 'salah'
                  ? 'bg-teal-950/60 text-teal-200 border border-teal-500/30'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {fardCompleted}/৫ সালাত
            </span>
          </button>

          {/* SubTab 2: Amal & Quran */}
          <button
            type="button"
            onClick={() => onSubTabChange('amal')}
            className={`group flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer select-none ${
              currentSubTab === 'amal'
                ? 'bg-gradient-to-r from-teal-800 to-teal-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-teal-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center mb-1">
              <BookOpen
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  currentSubTab === 'amal' ? 'text-teal-200 stroke-[2.4]' : 'text-gray-400 stroke-[1.8]'
                }`}
              />
            </div>
            <span
              className={`text-xs tracking-tight transition-colors ${
                currentSubTab === 'amal' ? 'font-bold text-white' : 'font-semibold text-gray-700'
              }`}
            >
              আমল
            </span>
            <span
              className={`text-[10px] mt-0.5 px-1.5 py-0.2 rounded-full font-bold leading-none ${
                currentSubTab === 'amal'
                  ? 'bg-teal-950/60 text-teal-200 border border-teal-500/30'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {amalCompleted}/{allAmalTasks.length} আমল
            </span>
          </button>

          {/* SubTab 3: Dhikr & Tasbih */}
          <button
            type="button"
            onClick={() => onSubTabChange('dhikr')}
            className={`group flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer select-none ${
              currentSubTab === 'dhikr'
                ? 'bg-gradient-to-r from-teal-800 to-teal-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-teal-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center mb-1">
              <Sparkles
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  currentSubTab === 'dhikr' ? 'text-teal-200 stroke-[2.4]' : 'text-gray-400 stroke-[1.8]'
                }`}
              />
            </div>
            <span
              className={`text-xs tracking-tight transition-colors ${
                currentSubTab === 'dhikr' ? 'font-bold text-white' : 'font-semibold text-gray-700'
              }`}
            >
              যিকির
            </span>
            <span
              className={`text-[10px] mt-0.5 px-1.5 py-0.2 rounded-full font-bold leading-none ${
                currentSubTab === 'dhikr'
                  ? 'bg-teal-950/60 text-teal-200 border border-teal-500/30'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {dhikrCompleted}/{visibleDhikrTasks.length} যিকির
            </span>
          </button>
        </div>

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              title="সেটিংস ও প্রোফাইল"
              className="flex flex-col items-center justify-center w-11 h-[52px] bg-white hover:bg-slate-50 text-slate-600 hover:text-teal-800 rounded-2xl shadow-xs border border-gray-200/90 transition-all cursor-pointer group shrink-0"
            >
              <Settings className="w-4 h-4 text-slate-500 group-hover:rotate-45 group-hover:text-teal-700 transition-all duration-300" />
              <span className="text-[9px] font-semibold text-slate-600 mt-1">সেটিংস</span>
            </button>
          )}
        </div>
      </div>

      {/* Screen Content for Active Sub-Tab */}
      <div className="transition-opacity duration-200">
        {currentSubTab === 'salah' && (
          <SalahScreen
            appStats={appStats}
            yesterdayChampion={yesterdayChampion}
            salahLog={salahLog}
            nawafilLog={nawafilLog}
            reminders={reminders}
            isViewingToday={isViewingToday}
            onToggleSalah={onToggleSalah}
            onToggleNawafil={onToggleNawafil}
            onOpenDetails={onOpenDetails}
            onOpenReminder={onOpenReminder}
            onOpenLeaderboard={onOpenLeaderboard}
            getMyRank={getMyRank}
            getTaskStats={getTaskStats}
          />
        )}

        {currentSubTab === 'amal' && (
          <AmalScreen
            appStats={appStats}
            specialAmalLog={specialAmalLog}
            morningLog={morningLog}
            nightlyLog={nightlyLog}
            quranLog={quranLog}
            reminders={reminders}
            onToggleRoutineTask={onToggleRoutineTask}
            onOpenDetails={onOpenDetails}
            onOpenReminder={onOpenReminder}
            getTaskStats={getTaskStats}
          />
        )}

        {currentSubTab === 'dhikr' && (
          <DhikrScreen
            dhikrLog={dhikrLog}
            reminders={reminders}
            onToggleDhikr={onToggleDhikr}
            onOpenDetails={onOpenDetails}
            onOpenReminder={onOpenReminder}
            getTaskStats={getTaskStats}
            onOpenAllahNames={onOpenAllahNames}
          />
        )}
      </div>
    </div>
  );
};

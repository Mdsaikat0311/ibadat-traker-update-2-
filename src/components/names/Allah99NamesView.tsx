import React, { useState, useMemo, useRef } from 'react';
import { ArrowLeft, Search, Pin, PinOff } from 'lucide-react';
import { ALLAH_99_NAMES, AllahNameItem, getPinnedAllahNameIds, togglePinAllahNameId } from '../../data/allahNamesData';
import { AllahNameDetailDialog } from '../dialogs/AllahNameDetailDialog';
import { NotificationService } from '../../services/notificationService';

interface Allah99NamesViewProps {
  onBack: () => void;
  onShowAlert?: (msg: string, isSuccess: boolean) => void;
}

export const Allah99NamesView: React.FC<Allah99NamesViewProps> = ({
  onBack,
  onShowAlert
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedName, setSelectedName] = useState<AllahNameItem | null>(null);
  const [pinnedIds, setPinnedIds] = useState<number[]>(() => getPinnedAllahNameIds());
  const [longPressItem, setLongPressItem] = useState<AllahNameItem | null>(null);

  // Long press timer refs to distinguish click vs long-press
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActiveRef = useRef<boolean>(false);

  // Toggling pin state
  const handleTogglePin = (item: AllahNameItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const { isPinned, updatedIds } = togglePinAllahNameId(item.id);
    setPinnedIds(updatedIds);
    NotificationService.playChime();
    if (onShowAlert) {
      onShowAlert(
        isPinned
          ? `『${item.name}』তালিকার শীর্ষে পিন করা হয়েছে!`
          : `『${item.name}』আনপিন করা হয়েছে।`,
        true
      );
    }
  };

  // Touch and mouse long-press triggers
  const startLongPress = (item: AllahNameItem) => {
    isLongPressActiveRef.current = false;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch {}
      }
      NotificationService.playChime();
      setLongPressItem(item);
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleCardClick = (item: AllahNameItem) => {
    if (isLongPressActiveRef.current) {
      isLongPressActiveRef.current = false;
      return;
    }
    setSelectedName(item);
  };

  // Sort: Pinned items appear at the very top of the list!
  const sortedAndFiltered = useMemo(() => {
    let list = ALLAH_99_NAMES;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = ALLAH_99_NAMES.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.meaning.toLowerCase().includes(q) ||
          item.arabic.includes(q) ||
          item.bnNumber.includes(q) ||
          String(item.id).includes(q) ||
          item.fazilat.toLowerCase().includes(q)
      );
    }

    const pinnedList: AllahNameItem[] = [];
    const unpinnedList: AllahNameItem[] = [];

    const listMap = new Map(list.map((it) => [it.id, it]));

    // Put pinned items first in the order stored in pinnedIds
    for (const pId of pinnedIds) {
      const found = listMap.get(pId);
      if (found) {
        pinnedList.push(found);
      }
    }

    // Followed by unpinned items
    for (const it of list) {
      if (!pinnedIds.includes(it.id)) {
        unpinnedList.push(it);
      }
    }

    return {
      pinnedList,
      unpinnedList,
      totalCount: list.length
    };
  }, [searchQuery, pinnedIds]);

  // Render a single name row
  const renderNameRow = (item: AllahNameItem, isPinned: boolean) => {
    return (
      <div
        key={item.id}
        onClick={() => handleCardClick(item)}
        onTouchStart={() => startLongPress(item)}
        onTouchEnd={cancelLongPress}
        onTouchCancel={cancelLongPress}
        onMouseDown={() => startLongPress(item)}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        className={`flex items-center justify-between py-3 px-3 transition rounded-2xl cursor-pointer group select-none ${
          isPinned
            ? 'bg-gradient-to-r from-[#202717] via-[#162118] to-[#141b16] border border-amber-500/35 hover:border-amber-400/50 my-1.5 shadow-sm'
            : 'hover:bg-[#16201a] active:bg-[#1c2921]'
        }`}
      >
        {/* Left: Bengali Number & optional Pin indicator */}
        <div className="w-9 shrink-0 flex items-center gap-1.5">
          {isPinned ? (
            <Pin className="w-4 h-4 fill-amber-400 text-amber-400 rotate-45 shrink-0" />
          ) : (
            <span className="text-zinc-400 font-medium text-base font-serif">
              {item.bnNumber}
            </span>
          )}
        </div>

        {/* Middle: Bengali Name & Meaning */}
        <div className="flex-1 pr-2 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-[15px] truncate transition-colors ${
              isPinned ? 'text-amber-200 group-hover:text-amber-100' : 'text-white group-hover:text-[#4ade80]'
            }`}>
              {item.name}
            </span>
            {isPinned && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-medium border border-amber-500/40">
                শীর্ষে পিন
              </span>
            )}
          </div>
          <div className="text-zinc-400 text-xs mt-0.5 truncate">
            {item.meaning}
          </div>
        </div>

        {/* Right side: Quick Pin button + Arabic calligraphy */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Direct pin toggle button */}
          <button
            type="button"
            onClick={(e) => handleTogglePin(item, e)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isPinned
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                : 'opacity-40 group-hover:opacity-100 hover:bg-[#1f2c22] border-[#223126] text-zinc-400 hover:text-white'
            }`}
            title={isPinned ? 'আনপিন করুন' : 'শীর্ষে পিন করুন'}
          >
            {isPinned ? (
              <Pin className="w-3.5 h-3.5 fill-amber-400 rotate-45" />
            ) : (
              <Pin className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Arabic Calligraphy in Emerald Green (Amiri font) */}
          <div
            dir="rtl"
            lang="ar"
            className="text-right text-[#34d399] text-xl sm:text-2xl font-['Amiri',serif] font-bold min-w-[70px] leading-relaxed"
          >
            {item.arabic}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#111613] text-[#e1e7e3] -m-4 p-4 font-sans selection:bg-emerald-900 selection:text-white pb-24">
      {/* Top Header Bar strictly matching screenshots */}
      <div className="sticky top-0 z-20 bg-[#111613]/95 backdrop-blur-md pb-3 border-b border-[#1e2a21] -mx-4 px-4 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2 -ml-1 rounded-xl text-zinc-300 hover:text-white hover:bg-[#1a231d] transition cursor-pointer"
              title="ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                আল্লাহর ৯৯ নাম
              </h1>
              <p className="text-[11px] text-[#7a9584]">
                আসমাউল হুসনা ও বরকতময় ফযিলত
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {pinnedIds.length > 0 && (
              <div className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1">
                <Pin className="w-3 h-3 fill-amber-400 rotate-45" />
                <span>{pinnedIds.length} পিন</span>
              </div>
            )}
            <div className="px-2.5 py-1 rounded-full bg-[#162a1e] border border-[#234b32] text-[#4ade80] text-xs font-bold font-mono">
              ৯৯ টি নাম
            </div>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#5e7767]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, অর্থ বা নম্বর দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#161d18] border border-[#222e25] text-sm text-[#e1e7e3] placeholder-[#5e7767] focus:outline-none focus:border-[#34d399] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-[#7e9987] hover:text-white px-1.5 py-0.5 rounded bg-[#222e25]"
            >
              মুছুন
            </button>
          )}
        </div>

        {/* Hint banner about pin */}
        <div className="mt-2 text-[11px] text-[#789682] flex items-center justify-between px-1">
          <span>📌 নামের উপর চাপ দিয়ে ধরে রাখলে বা পিন বাটনে চাপলে শীর্ষে থাকবে</span>
          {pinnedIds.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setPinnedIds([]);
                localStorage.removeItem('ibadat_pinned_allah_names');
                if (onShowAlert) onShowAlert('সকল পিন মুছে ফেলা হয়েছে', true);
              }}
              className="text-amber-400/80 hover:text-amber-300 transition text-[11px] underline cursor-pointer"
            >
              সব আনপিন
            </button>
          )}
        </div>
      </div>

      {/* List of 99 Names: Pinned on top, then regular order */}
      <div className="mt-2">
        {sortedAndFiltered.totalCount === 0 ? (
          <div className="text-center py-16 text-[#688171] text-sm">
            কোনো নাম পাওয়া যায়নি। অন্য বানান দিয়ে খুঁজুন।
          </div>
        ) : (
          <div className="space-y-1">
            {/* 1. Pinned Names Section (at the very top) */}
            {sortedAndFiltered.pinnedList.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between py-1 px-1 mb-1 border-b border-[#243527]">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <Pin className="w-3.5 h-3.5 fill-amber-400 rotate-45" />
                    <span>শীর্ষে পিন করা নাম ({sortedAndFiltered.pinnedList.length}টি)</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">নিয়মিত পড়ার সুবিধার্থে</span>
                </div>
                <div className="space-y-1">
                  {sortedAndFiltered.pinnedList.map((item) => renderNameRow(item, true))}
                </div>
              </div>
            )}

            {/* 2. Unpinned Names Section */}
            {sortedAndFiltered.unpinnedList.length > 0 && (
              <div>
                {sortedAndFiltered.pinnedList.length > 0 && (
                  <div className="flex items-center justify-between py-1.5 px-1 mt-3 mb-1 border-b border-[#1b251e]">
                    <span className="text-zinc-400 text-xs font-semibold">সকল নাম (১-৯৯)</span>
                    <span className="text-[10px] text-zinc-500">চাপ দিয়ে ধরে রাখলে পিন হবে</span>
                  </div>
                )}
                <div className="divide-y divide-[#1b251e]">
                  {sortedAndFiltered.unpinnedList.map((item) => renderNameRow(item, false))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Long-Press Action Modal (চাপ দিয়ে ধরে রাখলে পিন করার সুযোগ) */}
      {longPressItem && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLongPressItem(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#162119] text-[#e3ebe5] rounded-3xl border border-[#2b4c35] p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center">
                <Pin className="w-5 h-5 rotate-45 fill-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {pinnedIds.includes(longPressItem.id) ? 'নামটি আনপিন করবেন?' : 'নামটি শীর্ষে পিন করুন'}
                </h3>
                <p className="text-xs text-[#8ca895]">
                  {pinnedIds.includes(longPressItem.id)
                    ? 'এটি সাধারণ ক্রমে ফিরে যাবে'
                    : 'এটি স্বয়ংক্রিয়ভাবে তালিকার সবার উপরে চলে আসবে'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111913] border border-[#233528] flex items-center justify-between">
              <div>
                <div className="text-white font-bold text-base flex items-center gap-1.5">
                  <span>{longPressItem.name}</span>
                  <span className="text-xs text-emerald-400 font-mono">({longPressItem.bnNumber})</span>
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">{longPressItem.meaning}</div>
              </div>
              <div dir="rtl" className="text-2xl font-bold text-[#34d399] font-['Amiri',serif]">
                {longPressItem.arabic}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setLongPressItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#202d24] text-zinc-300 font-semibold text-sm hover:bg-[#28392d] transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  handleTogglePin(longPressItem);
                  setLongPressItem(null);
                }}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 shadow transition cursor-pointer ${
                  pinnedIds.includes(longPressItem.id)
                    ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-emerald-600 text-white hover:brightness-110'
                }`}
              >
                {pinnedIds.includes(longPressItem.id) ? (
                  <>
                    <PinOff className="w-4 h-4" />
                    <span>আনপিন করুন</span>
                  </>
                ) : (
                  <>
                    <Pin className="w-4 h-4 fill-current rotate-45" />
                    <span>শীর্ষে পিন করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Modal on Click */}
      {selectedName && (
        <AllahNameDetailDialog
          item={selectedName}
          isPinned={pinnedIds.includes(selectedName.id)}
          onTogglePin={() => handleTogglePin(selectedName)}
          onDismiss={() => setSelectedName(null)}
          onShowAlert={onShowAlert}
        />
      )}
    </div>
  );
};


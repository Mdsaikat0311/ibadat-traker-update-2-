import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  ChevronRight,
  ArrowLeft,
  Search,
  Copy,
  Check,
  Share2,
  RotateCcw,
  Volume2,
  Sparkles
} from 'lucide-react';
import { DUA_CATEGORIES, DuaCategory, DuaItem } from '../data/duaBank';
import { NotificationService } from '../services/notificationService';
import { ALLAH_99_NAMES } from '../data/allahNamesData';
import { Allah99NamesView } from '../components/names/Allah99NamesView';

interface DuaScreenProps {
  onShowAlert?: (msg: string, isSuccess: boolean) => void;
  initialShowAllahNames?: boolean;
}

export const DuaScreen: React.FC<DuaScreenProps> = ({ onShowAlert, initialShowAllahNames }) => {
  const [showAllahNames, setShowAllahNames] = useState(initialShowAllahNames || false);
  const [selectedCategory, setSelectedCategory] = useState<DuaCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('dua_font_size') || '1', 10);
    } catch {
      return 1;
    }
  }); // 0: Small, 1: Normal, 2: Large, 3: Extra Large
  const [showPronunciation, setShowPronunciation] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  // Bookmarks store in localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ibadat_dua_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Tap-counters for repetitive duas (e.g. 33 times)
  const [duaCounts, setDuaCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (onShowAlert) onShowAlert('বুকমার্ক থেকে সরানো হয়েছে', false);
      } else {
        next.add(id);
        if (onShowAlert) onShowAlert('বুকমার্কে যোগ করা হয়েছে', true);
      }
      try {
        localStorage.setItem('ibadat_dua_bookmarks', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const handleIncrementCount = (dua: DuaItem) => {
    const max = dua.repeatCount || 1;
    setDuaCounts((prev) => {
      const current = prev[dua.id] || 0;
      const next = current + 1;
      // Play soft haptic chime on each tap
      NotificationService.playChime();
      if (next >= max && onShowAlert) {
        onShowAlert(`মাশাআল্লাহ! '${dua.title}' পাঠ সম্পন্ন হয়েছে (${max}/${max})`, true);
      }
      return { ...prev, [dua.id]: next };
    });
  };

  const handleResetCount = (id: string) => {
    setDuaCounts((prev) => ({ ...prev, [id]: 0 }));
  };

  const handleCopy = (dua: DuaItem) => {
    const text = `【 ${dua.title} 】\n\n${dua.arabic}\n\nউচ্চারণ: ${dua.transliteration}\n\nঅর্থ: ${dua.translation}\n\nসূত্র: ${dua.reference}${dua.virtue ? `\nফযিলত: ${dua.virtue}` : ''}\n\n(ইবাদত ট্র্যাকার অ্যাপ)`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(dua.id);
      setTimeout(() => setCopiedId(null), 2000);
      if (onShowAlert) onShowAlert('দোয়া সফলভাবে কপি হয়েছে!', true);
    });
  };

  const handleShare = async (dua: DuaItem) => {
    const text = `【 ${dua.title} 】\n\n${dua.arabic}\n\nউচ্চারণ: ${dua.transliteration}\n\nঅর্থ: ${dua.translation}\n\nসূত্র: ${dua.reference}\n\n(ইবাদত ট্র্যাকার)`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: dua.title,
          text
        });
      } catch {}
    } else {
      handleCopy(dua);
    }
  };

  const handleFontSizeChange = (delta: number) => {
    setFontSizeLevel((prev) => {
      const next = Math.max(0, Math.min(3, prev + delta));
      try {
        localStorage.setItem('dua_font_size', String(next));
      } catch {}
      return next;
    });
  };

  // Font size classes
  const arabicFontClass = useMemo(() => {
    switch (fontSizeLevel) {
      case 0: return 'text-xl leading-relaxed';
      case 1: return 'text-2xl leading-loose';
      case 2: return 'text-3xl leading-loose';
      case 3: return 'text-4xl leading-loose';
      default: return 'text-2xl leading-loose';
    }
  }, [fontSizeLevel]);

  const bengaliFontClass = useMemo(() => {
    switch (fontSizeLevel) {
      case 0: return 'text-xs';
      case 1: return 'text-sm';
      case 2: return 'text-base';
      case 3: return 'text-lg';
      default: return 'text-sm';
    }
  }, [fontSizeLevel]);

  // All duas flattened for search or bookmarks
  const allDuas = useMemo(() => {
    return DUA_CATEGORIES.flatMap((c) => c.duas);
  }, []);

  // Filtered duas for category view or global bookmarks/search
  const displayedDuas = useMemo(() => {
    let list: DuaItem[] = [];
    if (onlyBookmarks) {
      list = allDuas.filter((d) => bookmarkedIds.has(d.id));
    } else if (selectedCategory) {
      list = selectedCategory.duas;
    } else {
      list = allDuas;
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter(
      (d) =>
        d.title.toLowerCase().includes(query) ||
        d.transliteration.toLowerCase().includes(query) ||
        d.translation.toLowerCase().includes(query) ||
        d.arabic.includes(query) ||
        d.reference.toLowerCase().includes(query)
    );
  }, [allDuas, bookmarkedIds, onlyBookmarks, selectedCategory, searchQuery]);

  const matchingAllahNames = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return ALLAH_99_NAMES.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.meaning.toLowerCase().includes(q) ||
        n.arabic.includes(q) ||
        n.bnNumber.includes(q)
    );
  }, [searchQuery]);

  if (showAllahNames) {
    return (
      <Allah99NamesView
        onBack={() => setShowAllahNames(false)}
        onShowAlert={onShowAlert}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#111613] text-[#e1e7e3] -m-4 p-4 font-sans selection:bg-emerald-900 selection:text-white">
      {/* Header bar styled exactly like Screenshot 1 */}
      {!selectedCategory && !onlyBookmarks ? (
        <div className="flex items-center justify-between pb-4 border-b border-[#202b23]">
          <div>
            <h1 className="text-2xl font-bold text-[#34d399] tracking-wide">
              দোয়া ও মোনাজাত
            </h1>
            <p className="text-xs text-[#8ea496] mt-0.5">
              দৈনন্দিন দোয়া ও জিকির
            </p>
          </div>
          <button
            onClick={() => setOnlyBookmarks(true)}
            className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
              bookmarkedIds.size > 0
                ? 'bg-[#1b3a29] border-[#2f6648] text-[#4ade80]'
                : 'bg-[#18201a] border-[#222e25] text-[#8ea496] hover:text-[#4ade80]'
            }`}
            title="সংরক্ষিত দোয়া"
          >
            <Bookmark className="w-5 h-5 fill-current" />
            {bookmarkedIds.size > 0 && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-[#10b981] text-black">
                {bookmarkedIds.size}
              </span>
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between pb-3 border-b border-[#202b23]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setOnlyBookmarks(false);
                setSearchQuery('');
              }}
              className="p-2 rounded-xl bg-[#18201a] border border-[#222e25] text-[#8ea496] hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-[#34d399] line-clamp-1">
                {onlyBookmarks ? 'সংরক্ষিত দোয়াসমূহ' : selectedCategory?.name}
              </h2>
              <p className="text-xs text-[#8ea496]">
                {displayedDuas.length} টি দোয়া পাওয়া গেছে
              </p>
            </div>
          </div>

          {/* Reading Controls */}
          <div className="flex items-center gap-1 bg-[#18201a] border border-[#243328] rounded-xl p-1">
            <button
              onClick={() => handleFontSizeChange(-1)}
              disabled={fontSizeLevel === 0}
              className="px-2 py-1 text-xs font-bold text-[#8ea496] hover:text-white disabled:opacity-40 cursor-pointer"
              title="ফন্ট ছোট করুন"
            >
              A-
            </button>
            <span className="text-[10px] text-[#556b5d] px-1 font-mono">
              {fontSizeLevel === 0 ? 'ছোট' : fontSizeLevel === 1 ? 'স্বাভাবিক' : fontSizeLevel === 2 ? 'বড়' : 'অতিবড়'}
            </span>
            <button
              onClick={() => handleFontSizeChange(1)}
              disabled={fontSizeLevel === 3}
              className="px-2 py-1 text-xs font-bold text-[#8ea496] hover:text-white disabled:opacity-40 cursor-pointer"
              title="ফন্ট বড় করুন"
            >
              A+
            </button>
          </div>
        </div>
      )}

      {/* Main Categories List View (Matching Screenshot 1) */}
      {!selectedCategory && !onlyBookmarks && (
        <div className="mt-3 space-y-1.5">
          {/* Quick Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#60796a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="দোয়া, উচ্চারণ বা অর্থ দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161c18] border border-[#222d25] text-sm text-[#e1e7e3] placeholder-[#60796a] focus:outline-none focus:border-[#34d399] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-[#8ea496] hover:text-white px-1.5 py-0.5 rounded bg-[#222d25]"
              >
                মুছুন
              </button>
            )}
          </div>

          {/* If user searched globally from category list */}
          {searchQuery ? (
            <div className="space-y-3 pt-1">
              {/* Search match banner for 99 Names of Allah */}
              {matchingAllahNames.length > 0 && (
                <div
                  onClick={() => setShowAllahNames(true)}
                  className="p-3 rounded-2xl bg-gradient-to-r from-[#173020] via-[#122418] to-[#101b14] border border-emerald-600/60 flex items-center justify-between cursor-pointer hover:border-emerald-400 transition group mb-3 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1b432a] border border-[#2d6c44] text-[#4ade80] flex items-center justify-center font-bold text-sm font-serif">
                      ৯৯
                    </div>
                    <div>
                      <div className="text-sm font-bold text-emerald-300 group-hover:text-emerald-200 flex items-center gap-2">
                        আল্লাহর ৯৯ নাম
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-semibold border border-emerald-600/40">
                          {matchingAllahNames.length} টি মিল
                        </span>
                      </div>
                      <div className="text-xs text-[#8ca895]">
                        ক্লিক করে ৯৯ নামের তালিকা, অর্থ ও ফজিলত দেখুন
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-0.5 transition" />
                </div>
              )}

              <p className="text-xs text-[#8ea496] px-1 font-medium">
                অনুসন্ধানের ফলাফল ({displayedDuas.length} টি দোয়া):
              </p>
              {displayedDuas.length === 0 && matchingAllahNames.length === 0 ? (
                <div className="text-center py-12 text-[#60796a] text-sm">
                  কোনো দোয়া পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।
                </div>
              ) : (
                displayedDuas.map((dua) => (
                  <DuaCard
                    key={dua.id}
                    dua={dua}
                    arabicFontClass={arabicFontClass}
                    bengaliFontClass={bengaliFontClass}
                    showPronunciation={showPronunciation}
                    showTranslation={showTranslation}
                    isBookmarked={bookmarkedIds.has(dua.id)}
                    onToggleBookmark={() => toggleBookmark(dua.id)}
                    copied={copiedId === dua.id}
                    onCopy={() => handleCopy(dua)}
                    onShare={() => handleShare(dua)}
                    count={duaCounts[dua.id] || 0}
                    onIncrement={() => handleIncrementCount(dua)}
                    onReset={() => handleResetCount(dua.id)}
                  />
                ))
              )}
            </div>
          ) : (
            /* The Categories matching Screenshot 1 with 99 Names of Allah FIRST */
            <div className="divide-y divide-[#1c261f]">
              {/* 1. আল্লাহর ৯৯ নাম (সবার প্রথমে ক্যাটাগরি) */}
              <div
                onClick={() => setShowAllahNames(true)}
                className="flex items-center justify-between py-3.5 px-2 hover:bg-[#18211b] active:bg-[#1d2720] transition rounded-xl cursor-pointer group bg-gradient-to-r from-[#14261b]/90 via-[#101c15]/60 to-transparent border border-emerald-800/50 my-1 shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  {/* Dark Green Circle with 99 */}
                  <div className="w-9 h-9 rounded-full bg-[#1b432a] border border-[#2d6c44] flex items-center justify-center text-[#4ade80] font-bold text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform font-serif">
                    ৯৯
                  </div>
                  <div>
                    <span className="text-[15px] font-semibold text-[#edf2ee] group-hover:text-[#4ade80] transition-colors flex items-center gap-2">
                      আল্লাহর ৯৯ নাম
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-semibold border border-emerald-600/40">
                        আসমাউল হুসনা
                      </span>
                    </span>
                    <p className="text-[11px] text-[#789382] leading-tight mt-0.5">
                      অর্থ, ফজিলত ও আমলের নিয়মাবলী
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Count Pill */}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#182d20] text-[#4ade80] font-semibold border border-[#21432e]">
                    ৯৯টি
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#4f6456] group-hover:text-[#4ade80] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {DUA_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="flex items-center justify-between py-3.5 px-2 hover:bg-[#18211b] active:bg-[#1d2720] transition rounded-xl cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Dark Green Circle with Bengali Number */}
                    <div className="w-9 h-9 rounded-full bg-[#143220] border border-[#1e4d31] flex items-center justify-center text-[#4ade80] font-bold text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      {cat.bnNumber}
                    </div>
                    <span className="text-[15px] font-medium text-[#edf2ee] group-hover:text-[#4ade80] transition-colors">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Count Pill */}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#182d20] text-[#4ade80] font-medium border border-[#21432e]">
                      {cat.duas?.length || cat.count}টি
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#4f6456] group-hover:text-[#4ade80] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Reading View (Category Opened or Bookmarks View) */}
      {(selectedCategory || onlyBookmarks) && (
        <div className="mt-3 space-y-4">
          {/* Quick Filter & Display Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#161d18] border border-[#222e25]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPronunciation(!showPronunciation)}
                className={`text-xs px-2.5 py-1 rounded-lg transition border cursor-pointer ${
                  showPronunciation
                    ? 'bg-[#1b3a29] border-[#2c6145] text-[#4ade80] font-semibold'
                    : 'bg-[#1c241e] border-[#27352a] text-[#718579]'
                }`}
              >
                উচ্চারণ {showPronunciation ? 'অন' : 'অফ'}
              </button>
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`text-xs px-2.5 py-1 rounded-lg transition border cursor-pointer ${
                  showTranslation
                    ? 'bg-[#1b3a29] border-[#2c6145] text-[#4ade80] font-semibold'
                    : 'bg-[#1c241e] border-[#27352a] text-[#718579]'
                }`}
              >
                অর্থ {showTranslation ? 'অন' : 'অফ'}
              </button>
            </div>

            {/* In-category search */}
            <div className="relative flex-1 min-w-[140px] max-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="এখানে খুঁজুন..."
                className="w-full pl-7 pr-2 py-1 text-xs rounded-lg bg-[#111713] border border-[#222e25] text-[#e1e7e3] placeholder-[#60796a] focus:outline-none focus:border-[#34d399]"
              />
              <Search className="absolute left-2 top-1.5 w-3.5 h-3.5 text-[#60796a]" />
            </div>
          </div>

          {/* List of Duas in Category */}
          {displayedDuas.length === 0 ? (
            <div className="text-center py-16 bg-[#161c18] rounded-2xl border border-[#222e25] p-6 space-y-3">
              <Sparkles className="w-10 h-10 text-[#4ade80] mx-auto opacity-60" />
              <p className="text-sm text-[#8ea496]">
                {onlyBookmarks
                  ? 'আপনার কোনো সংরক্ষিত দোয়া নেই। দোয়ার কার্ডের বুকমার্ক আইকনে ক্লিক করে প্রিয় দোয়াগুলো এখানে সংরক্ষণ করতে পারেন।'
                  : 'কোনো দোয়া মেলেনি।'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedDuas.map((dua) => (
                <DuaCard
                  key={dua.id}
                  dua={dua}
                  arabicFontClass={arabicFontClass}
                  bengaliFontClass={bengaliFontClass}
                  showPronunciation={showPronunciation}
                  showTranslation={showTranslation}
                  isBookmarked={bookmarkedIds.has(dua.id)}
                  onToggleBookmark={() => toggleBookmark(dua.id)}
                  copied={copiedId === dua.id}
                  onCopy={() => handleCopy(dua)}
                  onShare={() => handleShare(dua)}
                  count={duaCounts[dua.id] || 0}
                  onIncrement={() => handleIncrementCount(dua)}
                  onReset={() => handleResetCount(dua.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface DuaCardProps {
  dua: DuaItem;
  arabicFontClass: string;
  bengaliFontClass: string;
  showPronunciation: boolean;
  showTranslation: boolean;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  copied: boolean;
  onCopy: () => void;
  onShare: () => void;
  count: number;
  onIncrement: () => void;
  onReset: () => void;
}

const DuaCard: React.FC<DuaCardProps> = ({
  dua,
  arabicFontClass,
  bengaliFontClass,
  showPronunciation,
  showTranslation,
  isBookmarked,
  onToggleBookmark,
  copied,
  onCopy,
  onShare,
  count,
  onIncrement,
  onReset
}) => {
  const target = dua.repeatCount || 1;
  const isCompleted = count >= target;

  return (
    <div className="rounded-2xl bg-[#161c18] border border-[#222f25] p-4 space-y-3.5 shadow-sm hover:border-[#2f4a38] transition-colors">
      {/* Title & Actions */}
      <div className="flex items-start justify-between gap-3 border-b border-[#212c24] pb-2.5">
        <div>
          <h3 className="text-base font-bold text-[#4ade80] flex items-center gap-2">
            <span>{dua.title}</span>
            {target > 1 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#183523] text-[#34d399] border border-[#234d34]">
                {target} বার
              </span>
            )}
          </h3>
          <p className="text-[11px] text-[#718678] mt-0.5 font-mono">
            {dua.reference}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleBookmark}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isBookmarked
                ? 'bg-[#1b3a29] border-[#2c6145] text-[#4ade80]'
                : 'bg-[#1a221c] border-[#243026] text-[#718678] hover:text-[#4ade80]'
            }`}
            title="বুকমার্ক করুন"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={onCopy}
            className="p-1.5 rounded-lg bg-[#1a221c] border border-[#243026] text-[#718678] hover:text-[#4ade80] transition cursor-pointer"
            title="কপি করুন"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={onShare}
            className="p-1.5 rounded-lg bg-[#1a221c] border border-[#243026] text-[#718678] hover:text-[#4ade80] transition cursor-pointer"
            title="শেয়ার করুন"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Arabic Script */}
      <div className="p-3.5 rounded-xl bg-[#111713] border border-[#1e2a21] text-right">
        <p
          dir="rtl"
          className={`font-['Amiri',serif] text-[#f1f5f2] tracking-wider leading-loose ${arabicFontClass}`}
        >
          {dua.arabic}
        </p>
      </div>

      {/* Pronunciation */}
      {showPronunciation && (
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#34d399]">
            উচ্চারণ:
          </span>
          <p className={`text-[#d3ded7] font-medium leading-relaxed ${bengaliFontClass}`}>
            {dua.transliteration}
          </p>
        </div>
      )}

      {/* Translation */}
      {showTranslation && (
        <div className="space-y-1 pt-1 border-t border-[#1e2921]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8]">
            অর্থ:
          </span>
          <p className={`text-[#c4d4ca] leading-relaxed ${bengaliFontClass}`}>
            {dua.translation}
          </p>
        </div>
      )}

      {/* Virtue or Procedure */}
      {dua.virtue && (
        <div className="p-2.5 rounded-xl bg-[#14261d] border border-[#1e3c2c] text-xs text-[#a7c5b3] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#4ade80]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ফযিলত ও গুরুত্ব:</span>
          </div>
          <p className="leading-relaxed">{dua.virtue}</p>
          {dua.procedure && (
            <p className="text-[11px] text-[#86a894] pt-1 border-t border-[#1e3c2c]/60">
              <span className="font-semibold text-white">নিয়ম:</span> {dua.procedure}
            </p>
          )}
        </div>
      )}

      {/* Interactive Tasbih / Reader Counter */}
      <div className="flex items-center justify-between pt-2 border-t border-[#212c24]">
        <div className="flex items-center gap-2">
          <button
            onClick={onIncrement}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer select-none active:scale-95 ${
              isCompleted
                ? 'bg-[#15462b] text-[#4ade80] border border-[#27784b]'
                : 'bg-[#1c3a27] text-white hover:bg-[#234b33] border border-[#2e6343]'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 opacity-80" />
            <span>পড়েছি ({count}/{target})</span>
            {isCompleted && <Check className="w-4 h-4 text-[#4ade80]" />}
          </button>

          {count > 0 && (
            <button
              onClick={onReset}
              className="p-2 rounded-xl bg-[#1a221c] border border-[#243026] text-[#718678] hover:text-white transition cursor-pointer"
              title="কাউন্টার রিসেট করুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-[11px] text-[#637d6e] font-mono">
          {isCompleted ? '✓ আমল সম্পন্ন' : `বাকি ${Math.max(0, target - count)} বার`}
        </span>
      </div>
    </div>
  );
};

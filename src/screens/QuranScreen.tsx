import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Volume2,
  Play,
  Pause,
  Bookmark,
  BookmarkCheck,
  BookmarkPlus,
  Paperclip,
  Share2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Settings as SettingsIcon,
  BookOpen,
  SlidersHorizontal,
  BookMarked,
  ChevronsDown,
  Palette
} from 'lucide-react';
import {
  ALL_SURAHS,
  JUZ_LIST,
  SurahMeta,
  Ayah,
  QuranBookmark,
  fetchSurahAyahs,
  getBookmarks,
  saveBookmark,
  removeBookmark,
  toBengaliNumber,
  toArabicNumber,
  arabicToBengaliPronunciation
} from '../data/quranData';
import { IslamicStar } from '../components/quran/IslamicStar';
import {
  TajweedConfig,
  getTajweedConfig,
  saveTajweedConfig,
  renderTajweedAyah
} from '../utils/tajweedService';
import { TajweedSettingModal } from '../components/quran/TajweedSettingModal';

type QuranSubTab = 'SURAH' | 'JUZ' | 'BOOKMARK';

interface QuranScreenProps {
  onShowAlert?: (message: string, isSuccess: boolean) => void;
}

export const QuranScreen: React.FC<QuranScreenProps> = ({ onShowAlert }) => {
  // Navigation & Subtabs
  const [subTab, setSubTab] = useState<QuranSubTab>('SURAH');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Active Reading View
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Audio Playback State
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Bookmarks & Ayah Interactions
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>(getBookmarks());
  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);
  const [selectedAyahForSheet, setSelectedAyahForSheet] = useState<Ayah | null>(null);
  const [lastRead, setLastRead] = useState<{
    surahNumber: number;
    surahName: string;
    surahEnglishName: string;
    ayahNumber: number;
    timestamp: number;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('ibadat_quran_last_read');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Reading Settings
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => {
    return parseInt(localStorage.getItem('ibadat_quran_font_ar') || '21', 10);
  });
  const [showTransliteration, setShowTransliteration] = useState<boolean>(() => {
    return localStorage.getItem('ibadat_quran_show_trans') !== 'false';
  });
  const [showTranslation, setShowTranslation] = useState<boolean>(() => {
    return localStorage.getItem('ibadat_quran_show_translat') !== 'false';
  });

  // Save display preferences
  const updateArabicFontSize = (size: number) => {
    setArabicFontSize(size);
    localStorage.setItem('ibadat_quran_font_ar', size.toString());
  };

  const toggleTransliteration = () => {
    const val = !showTransliteration;
    setShowTransliteration(val);
    localStorage.setItem('ibadat_quran_show_trans', val.toString());
  };

  const toggleTranslation = () => {
    const val = !showTranslation;
    setShowTranslation(val);
    localStorage.setItem('ibadat_quran_show_translat', val.toString());
  };

  // Tajweed & Tashdeed System State
  const [tajweedConfig, setTajweedConfig] = useState<TajweedConfig>(getTajweedConfig);
  const [showTajweedModal, setShowTajweedModal] = useState<boolean>(false);

  const toggleTajweed = () => {
    const updated = { ...tajweedConfig, enabled: !tajweedConfig.enabled };
    setTajweedConfig(updated);
    saveTajweedConfig(updated);
    onShowAlert?.(
      updated.enabled
        ? 'তাজবীদ কালার চালু করা হয়েছে।'
        : 'তাজবীদ বন্ধ করা হয়েছে (সব হরফ সাদা)।',
      true
    );
  };

  // Filtered Surahs
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return ALL_SURAHS;
    const q = searchQuery.toLowerCase().trim();
    return ALL_SURAHS.filter(
      (s) =>
        s.number.toString() === q ||
        s.englishName.toLowerCase().includes(q) ||
        s.banglaName.toLowerCase().includes(q) ||
        s.name.includes(q)
    );
  }, [searchQuery]);

  // Load Ayahs when a Surah is selected
  useEffect(() => {
    if (!selectedSurah) {
      setAyahs([]);
      stopAudio();
      return;
    }

    let isMounted = true;
    setLoadingAyahs(true);
    setLoadError(null);

    fetchSurahAyahs(selectedSurah.number)
      .then((data) => {
        if (!isMounted) return;
        if (data && data.length > 0) {
          setAyahs(data);
        } else {
          setLoadError('ইন্টারনেট সংযোগ চেক করুন অথবা পুনরায় চেষ্টা করুন।');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadError('কুরআন আয়াত লোড করতে সমস্যা হয়েছে।');
      })
      .finally(() => {
        if (isMounted) setLoadingAyahs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSurah]);

  // Audio Playback Handlers
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
    setCurrentPlayingAyah(null);
  };

  const playAyahAudio = (ayah: Ayah, singleOnly: boolean = false) => {
    if (!ayah.audioUrl) {
      onShowAlert?.('এই আয়াতের অডিও পাওয়া যায়নি।', false);
      return;
    }

    if (currentPlayingAyah === ayah.numberInSurah && isPlayingAudio) {
      stopAudio();
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = ayah.audioUrl;
    audioRef.current
      .play()
      .then(() => {
        setIsPlayingAudio(true);
        setCurrentPlayingAyah(ayah.numberInSurah);
      })
      .catch((e) => {
        console.warn("Audio playback error:", e);
        setIsPlayingAudio(false);
        onShowAlert?.('অডিও প্লে করতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ চেক করুন।', false);
      });

    audioRef.current.onended = () => {
      if (singleOnly) {
        // Stop playback after this single ayah (exact user request)
        setIsPlayingAudio(false);
        setCurrentPlayingAyah(null);
      } else {
        // Auto play next ayah in surah if available
        const nextIndex = ayah.numberInSurah;
        if (nextIndex < ayahs.length) {
          const nextAyah = ayahs[nextIndex];
          playAyahAudio(nextAyah, false);
        } else {
          setIsPlayingAudio(false);
          setCurrentPlayingAyah(null);
        }
      }
    };
  };

  // Bookmark handlers
  const handleToggleBookmark = (surahNumber: number, surahName: string, ayahNumber?: number) => {
    const existing = bookmarks.find(
      (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );
    if (existing) {
      const updated = removeBookmark(existing.id);
      setBookmarks(updated);
      onShowAlert?.('বুকমার্ক মুছে ফেলা হয়েছে।', false);
    } else {
      const updated = saveBookmark({
        surahNumber,
        surahName,
        ayahNumber
      });
      setBookmarks(updated);
      onShowAlert?.('বুকমার্কে যুক্ত করা হয়েছে।', true);
    }
  };

  const isAyahBookmarked = (surahNumber: number, ayahNumber?: number) => {
    return bookmarks.some(
      (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );
  };

  // Copy Ayah
  const handleCopyAyah = (ayah: Ayah) => {
    const translit = ayah.transliterationBn || arabicToBengaliPronunciation(ayah.textArabic);
    const text = `${ayah.textArabic}\n\n${translit ? translit + '\n\n' : ''}${ayah.translationBn}\n(সূরা ${selectedSurah?.banglaName}, আয়াত: ${ayah.numberInSurah})`;
    navigator.clipboard?.writeText(text);
    setCopiedAyahNumber(ayah.numberInSurah);
    setTimeout(() => setCopiedAyahNumber(null), 2000);
    onShowAlert?.('আয়াত কপি করা হয়েছে!', true);
  };

  // Surah navigation in Reader
  const handlePrevSurah = () => {
    if (!selectedSurah || selectedSurah.number <= 1) return;
    const prev = ALL_SURAHS.find((s) => s.number === selectedSurah.number - 1);
    if (prev) {
      stopAudio();
      setSelectedSurah(prev);
    }
  };

  const handleNextSurah = () => {
    if (!selectedSurah || selectedSurah.number >= 114) return;
    const next = ALL_SURAHS.find((s) => s.number === selectedSurah.number + 1);
    if (next) {
      stopAudio();
      setSelectedSurah(next);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Helper for Tajweed & Tashdeed highlighting
  const renderAyahArabic = (text: string, surahNum: number, ayahNum: number): React.ReactNode => {
    return renderTajweedAyah(text, tajweedConfig, surahNum, ayahNum);
  };

  // ----------------------------------------------------
  // VIEW: SURAH READER (Screen 2)
  // ----------------------------------------------------
  if (selectedSurah) {
    const isFirstSurah = selectedSurah.number === 1;
    const isTawbah = selectedSurah.number === 9;

    return (
      <div className="min-h-screen bg-[#070b09] text-slate-100 flex flex-col font-sans -m-4">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#070b09]/95 backdrop-blur-md border-b border-[#15201a] px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <button
              onClick={() => {
                stopAudio();
                setSelectedSurah(null);
              }}
              className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-lg active:bg-slate-800 transition cursor-pointer shrink-0"
              aria-label="Back to Surah List"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </button>

            {/* Circular Green Quran Emblem */}
            <div className="w-9 h-9 rounded-full bg-[#1b5e43] border border-[#2e7d58] flex items-center justify-center text-emerald-100 shadow-xs shrink-0">
              <BookOpen className="w-4 h-4 stroke-[2]" />
            </div>

            {/* Prominent Surah Name */}
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-wide leading-tight truncate">
                {selectedSurah.number}. {selectedSurah.banglaName}
              </h1>
              <div className="text-[11px] text-[#2dd4bf] font-medium leading-none mt-0.5 truncate">
                {selectedSurah.englishName} ({selectedSurah.revelationTypeBn} • {selectedSurah.numberOfAyahs} আয়াত)
              </div>
            </div>
          </div>

          {/* Top Actions: 4 Exact Icons as in Screenshot */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 text-slate-300">
            {/* 1. C= icon (Transliteration display mode) */}
            <button
              onClick={() => {
                toggleTransliteration();
                onShowAlert?.(showTransliteration ? "উচ্চারণ বন্ধ করা হয়েছে।" : "উচ্চারণ চালু করা হয়েছে।", true);
              }}
              title="উচ্চারণ প্রদর্শন / বন্ধ"
              className={`p-1.5 rounded-lg hover:bg-[#14201a] transition ${
                showTransliteration ? 'text-[#2dd4bf]' : 'text-slate-400'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 8 6 C 5 6, 3 8.5, 3 12 C 3 15.5, 5 18, 8 18" />
                <line x1="12" y1="9" x2="20" y2="9" />
                <line x1="12" y1="12" x2="20" y2="12" />
                <line x1="12" y1="15" x2="18" y2="15" />
              </svg>
            </button>

            {/* 2. ︾ ChevronsDown icon (Scroll to bottom / jump) */}
            <button
              onClick={() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
              title="নিচে যান"
              className="p-1.5 rounded-lg hover:bg-[#14201a] text-slate-300 transition"
            >
              <ChevronsDown className="w-5 h-5 stroke-[2]" />
            </button>

            {/* 3. 📖 BookOpen icon (Translation display toggle) */}
            <button
              onClick={() => {
                toggleTranslation();
                onShowAlert?.(showTranslation ? "অর্থ বন্ধ করা হয়েছে।" : "অর্থ চালু করা হয়েছে।", true);
              }}
              title="অর্থ প্রদর্শন / বন্ধ"
              className={`p-1.5 rounded-lg hover:bg-[#14201a] transition ${
                showTranslation ? 'text-[#2dd4bf]' : 'text-slate-400'
              }`}
            >
              <BookOpen className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* 4. 🎨 Tajweed & Tashdeed Settings icon */}
            <button
              onClick={() => setShowTajweedModal(true)}
              title="তাজবীদ ও তাশদীদ সেটিংস (Tajweed Setting)"
              className={`p-1.5 rounded-lg hover:bg-[#14201a] transition ${
                tajweedConfig.enabled ? 'text-[#f59e0b]' : 'text-slate-400'
              }`}
            >
              <Palette className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* 5. ⚙ Gear Settings icon */}
            <button
              onClick={() => setShowSettingsModal(true)}
              title="পড়ার সেটিংস ও ফন্ট"
              className="p-1.5 rounded-lg hover:bg-[#14201a] text-slate-300 transition"
            >
              <SettingsIcon className="w-5 h-5 stroke-[1.8]" />
            </button>
          </div>
        </header>

        {/* Reader Body Content */}
        <div className="flex-1 px-3 py-3 max-w-xl mx-auto w-full space-y-3 pb-24">
          {/* Ornate Islamic Framed Banner (100% matches Screenshot) */}
          <div className="relative rounded-lg overflow-hidden border border-[#8f7347]/90 bg-[#121915] p-2 shadow-md">
            {/* Arabesque filigree decorative border overlay */}
            <div className="absolute inset-0.5 border border-[#8f7347]/40 rounded-md pointer-events-none" />
            
            {/* Corner scrollwork flourishes */}
            <div className="absolute top-0.5 left-0.5 w-3 h-3 border-t-2 border-l-2 border-[#c49b63] rounded-tl-sm pointer-events-none" />
            <div className="absolute top-0.5 right-0.5 w-3 h-3 border-t-2 border-r-2 border-[#c49b63] rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-0.5 left-0.5 w-3 h-3 border-b-2 border-l-2 border-[#c49b63] rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-0.5 right-0.5 w-3 h-3 border-b-2 border-r-2 border-[#c49b63] rounded-br-sm pointer-events-none" />

            <div className="relative flex items-center justify-between gap-1.5 sm:gap-3">
              {/* Left Box: Kaaba emblem */}
              <div className="w-[62px] h-[46px] rounded-t-full rounded-b-xl border border-[#8f7347]/80 bg-[#141f19] flex items-center justify-center text-xl shadow-inner shrink-0">
                <span className="leading-none select-none">🕋</span>
              </div>

              {/* Center Box: Arabic Calligraphy Title in Arched Frame */}
              <div className="flex-1 flex items-center justify-center border-y border-[#8f7347]/50 bg-[#141f19]/80 rounded-2xl py-1 px-3 min-h-[46px] shadow-inner">
                <div
                  style={{ fontFamily: "'Amiri', serif" }}
                  className="text-2xl sm:text-3xl font-bold text-white tracking-widest drop-shadow-sm select-none"
                >
                  {selectedSurah.name}
                </div>
              </div>

              {/* Right Box: Verse Count Badge */}
              <div className="w-[62px] h-[46px] rounded-t-full rounded-b-xl border border-[#8f7347]/80 bg-[#141f19] flex flex-col items-center justify-center text-center shadow-inner shrink-0 leading-tight">
                <span className="text-xs font-bold text-slate-100">
                  {selectedSurah.numberOfAyahs}
                </span>
                <span className="text-[9px] font-medium text-slate-300 tracking-wider">
                  Verses
                </span>
              </div>
            </div>
          </div>

          {/* Bismillah Calligraphy (Only if not Tawbah and not Fatihah) */}
          {!isTawbah && !isFirstSurah && (
            <div className="text-center py-3 select-none">
              <div
                style={{ fontFamily: "'Amiri', serif" }}
                className="text-2xl sm:text-3xl font-semibold text-white tracking-widest drop-shadow-sm leading-relaxed"
              >
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loadingAyahs && (
            <div className="py-16 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-3 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
              <div className="text-xs text-slate-400">কুরআন আয়াত লোড হচ্ছে...</div>
            </div>
          )}

          {/* Error Message */}
          {loadError && (
            <div className="p-4 bg-red-950/40 border border-red-800/40 rounded-xl text-center space-y-2">
              <div className="text-sm text-red-300">{loadError}</div>
              <button
                onClick={() => {
                  setLoadingAyahs(true);
                  setLoadError(null);
                  fetchSurahAyahs(selectedSurah.number).then(setAyahs);
                }}
                className="px-4 py-1.5 bg-red-900/60 hover:bg-red-800 text-xs text-red-100 rounded-lg transition"
              >
                পুনরায় চেষ্টা করুন
              </button>
            </div>
          )}

          {/* Ayah List (Exact clean layout without bulky cards, identical to Screenshot) */}
          {!loadingAyahs &&
            ayahs.map((ayah) => {
              const isPlayingThisAyah = currentPlayingAyah === ayah.numberInSurah;
              const isLastReadAyah =
                lastRead &&
                lastRead.surahNumber === selectedSurah.number &&
                lastRead.ayahNumber === ayah.numberInSurah;

              return (
                <div
                  key={ayah.numberInSurah}
                  id={`ayah-${ayah.numberInSurah}`}
                  onClick={() => setSelectedAyahForSheet(ayah)}
                  className={`py-3.5 px-2.5 -mx-1 rounded-2xl border-b border-[#141e17]/50 space-y-2 transition-all cursor-pointer group ${
                    isPlayingThisAyah
                      ? 'bg-[#15271e] ring-1 ring-teal-500/50 shadow-md'
                      : isLastReadAyah
                      ? 'bg-[#121c17] border-l-2 border-l-teal-500/80 hover:bg-[#16231c]'
                      : 'hover:bg-[#131d17]/80 active:bg-[#17251d]'
                  }`}
                  title="আয়াত অপশন ও তিলাওয়াত মেনু খুলতে ক্লিক করুন"
                >
                  {/* Top Row: Left 8-lobed Scalloped Rosette + Right Arabic Ayah Text */}
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: 8-lobed Islamic Rosette with Ayah Number */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAyahForSheet(ayah);
                      }}
                      className="cursor-pointer active:scale-95 transition shrink-0 pt-0.5"
                      title="অপশন ও মেন্যু"
                    >
                      <IslamicStar
                        number={ayah.numberInSurah}
                        size={34}
                        numberClassName={
                          isPlayingThisAyah
                            ? 'text-[#4ade80] text-[11px] font-bold'
                            : 'text-[#2dd4bf] text-[11px] font-semibold'
                        }
                      />
                    </div>

                    {/* Right: Arabic Text with Tajweed & Circle End-of-Verse marker */}
                    <div
                      dir="rtl"
                      style={{
                        fontFamily: "'Amiri', serif",
                        fontSize: `${arabicFontSize}px`,
                        lineHeight: '2.2'
                      }}
                      className="text-right text-white font-normal tracking-wide px-1 select-text flex-1"
                    >
                      {renderAyahArabic(ayah.textArabic, selectedSurah.number, ayah.numberInSurah)}
                      <span
                        className={`inline-flex items-center justify-center w-[22px] h-[22px] rounded-full border text-[11px] font-sans mr-2 align-middle select-none shrink-0 ${
                          isPlayingThisAyah
                            ? 'border-teal-400 text-teal-300 font-bold'
                            : 'border-white/80 text-white'
                        }`}
                      >
                        {toArabicNumber(ayah.numberInSurah)}
                      </span>
                    </div>
                  </div>

                  {/* Bengali Transliteration (উচ্চারণ) - Vibrant Teal/Cyan */}
                  {showTransliteration && (ayah.transliterationBn || ayah.textArabic) && (
                    <div className="text-[#2dd4bf] text-[13px] leading-relaxed font-normal pt-0.5 pl-1">
                      {ayah.transliterationBn || arabicToBengaliPronunciation(ayah.textArabic)}
                    </div>
                  )}

                  {/* Bengali Translation (অনুবাদ) - Soft Silver/Ash Gray */}
                  {showTranslation && ayah.translationBn && (
                    <div className="text-[#cbd5e1] text-[13px] leading-relaxed font-normal pt-0.5 pl-1">
                      {ayah.translationBn}
                    </div>
                  )}
                </div>
              );
            })}

          {/* Bottom Next/Prev Surah Navigator */}
          {!loadingAyahs && ayahs.length > 0 && (
            <div className="flex items-center justify-between pt-6 pb-8 border-t border-[#141e18]">
              <button
                disabled={selectedSurah.number <= 1}
                onClick={handlePrevSurah}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition ${
                  selectedSurah.number <= 1
                    ? 'opacity-40 border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'border-[#23352c] text-slate-300 hover:text-white hover:bg-[#16231c]'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>পূর্ববর্তী সূরা</span>
              </button>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-3 py-1.5 text-xs text-[#2dd4bf] hover:underline"
              >
                উপরে যান ↑
              </button>

              <button
                disabled={selectedSurah.number >= 114}
                onClick={handleNextSurah}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition ${
                  selectedSurah.number >= 114
                    ? 'opacity-40 border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'border-[#23352c] text-slate-300 hover:text-white hover:bg-[#16231c]'
                }`}
              >
                <span>পরবর্তী সূরা</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Floating Mini Audio Bar (Sticky at bottom when playing) */}
        {isPlayingAudio && currentPlayingAyah && (
          <div className="fixed bottom-20 left-4 right-4 max-w-[400px] mx-auto z-40 bg-[#121c17]/95 border border-[#2b3e34] shadow-2xl rounded-2xl p-3 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-900/60 border border-teal-500/40 flex items-center justify-center text-[#2dd4bf]">
                <Volume2 className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  সূরা {selectedSurah.banglaName} - আয়াত {currentPlayingAyah}
                </div>
                <div className="text-[10px] text-slate-400">
                  মিশারী রাশিদ আল-আফাসী
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={stopAudio}
                className="p-2 text-slate-300 hover:text-white rounded-lg active:bg-slate-800 transition"
                title="থামান"
              >
                <Pause className="w-5 h-5 fill-current text-[#2dd4bf]" />
              </button>
              <button
                onClick={() => {
                  stopAudio();
                }}
                className="p-2 text-slate-400 hover:text-red-400 rounded-lg active:bg-slate-800 transition"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-[#121a16] border border-[#23352c] rounded-2xl w-full max-w-sm p-4 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#1c2923] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <SettingsIcon className="w-4 h-4 text-[#2dd4bf]" />
                  <span>কুরআন পড়ার সেটিংস</span>
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Arabic Font Size Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>আরবি ফন্ট সাইজ</span>
                  <span className="font-semibold text-[#2dd4bf]">{arabicFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="22"
                  max="42"
                  value={arabicFontSize}
                  onChange={(e) => updateArabicFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-[#2dd4bf] cursor-pointer"
                />
                <div className="text-right text-lg text-slate-100 font-serif pt-1 select-none" style={{ fontFamily: "'Amiri', serif" }}>
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </div>
              </div>

              {/* Transliteration Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1c2923]">
                <div>
                  <div className="text-xs font-medium text-slate-200">বাংলা উচ্চারণ (উচ্চারণ)</div>
                  <div className="text-[10px] text-slate-400">উচ্চারণ সহায়তা প্রদর্শন করুন</div>
                </div>
                <button
                  onClick={toggleTransliteration}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    showTransliteration ? 'bg-teal-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      showTransliteration ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Translation Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1c2923]">
                <div>
                  <div className="text-xs font-medium text-slate-200">বাংলা অনুবাদ (অর্থ)</div>
                  <div className="text-[10px] text-slate-400">মুহিউদ্দীন খানের বঙ্গানুবাদ</div>
                </div>
                <button
                  onClick={toggleTranslation}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    showTranslation ? 'bg-teal-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      showTranslation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Tajweed / Tashdeed Color Rules Toggle & Modal Link */}
              <div className="pt-2 border-t border-[#1c2923] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-slate-200">তাশদীদ ও তাজবীদ কালার</div>
                    <div className="text-[10px] text-slate-400">হরফের উপর অটোমেটিক কালার হাইলাইট</div>
                  </div>
                  <button
                    onClick={toggleTajweed}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      tajweedConfig.enabled ? 'bg-amber-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        tajweedConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    setShowTajweedModal(true);
                  }}
                  className="w-full py-1.5 px-3 bg-[#17231c] hover:bg-[#1f2f26] border border-[#23352c] rounded-xl text-xs text-[#2dd4bf] font-medium flex items-center justify-between transition"
                >
                  <span className="flex items-center space-x-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span>তাজবীদ রুলস ও উদাহরণ দেখুন</span>
                  </span>
                  <span>→</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full py-2 bg-teal-700 hover:bg-teal-600 text-xs font-semibold text-white rounded-xl transition"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dedicated Tajweed Setting Modal (Matches User Screenshot) */}
        <TajweedSettingModal
          isOpen={showTajweedModal}
          onClose={() => setShowTajweedModal(false)}
          config={tajweedConfig}
          onConfigChange={(newCfg) => setTajweedConfig(newCfg)}
          onShowAlert={onShowAlert}
        />

        {/* Ayah Options Bottom Sheet (100% matches User Screenshot) */}
        {selectedAyahForSheet && selectedSurah && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Dark Backdrop */}
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-[2px] transition-opacity"
              onClick={() => setSelectedAyahForSheet(null)}
            />

            {/* Bottom Sheet Drawer */}
            <div
              className="relative z-10 w-full max-w-lg mx-auto bg-[#141b17] border-t border-[#26372c] rounded-t-[28px] shadow-2xl overflow-hidden pb-8 select-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Drag Handle */}
              <div className="pt-3 pb-2.5 flex justify-center">
                <div className="w-12 h-1 rounded-full bg-[#3d4f43]" />
              </div>

              {/* Header: Exact format 'QS. Al-Fatihah 1: Verse 2' */}
              <div className="text-center px-4 pb-3.5 border-b border-[#1f2b23]">
                <h3 className="text-[15px] font-bold text-white tracking-wide">
                  QS. {selectedSurah.englishName} {selectedSurah.number}: Verse {selectedAyahForSheet.numberInSurah}
                </h3>
              </div>

              {/* Options List matching User Screenshot */}
              <div className="py-2 px-3 space-y-1">
                {/* 1. Play Murattal (Plays ONLY that specific ayah) */}
                <button
                  onClick={() => {
                    playAyahAudio(selectedAyahForSheet, true);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 text-left rounded-xl hover:bg-[#1a251e] active:bg-[#203027] transition cursor-pointer group"
                >
                  {isPlayingAudio && currentPlayingAyah === selectedAyahForSheet.numberInSurah ? (
                    <>
                      <Pause className="w-5 h-5 text-teal-400 fill-teal-400 shrink-0" />
                      <span className="text-[15px] font-medium text-teal-300">
                        Pause Murattal
                      </span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 text-slate-300 group-hover:text-teal-300 shrink-0" />
                      <span className="text-[15px] font-medium text-slate-200 group-hover:text-white">
                        Play Murattal
                      </span>
                    </>
                  )}
                </button>

                {/* 2. View Translation */}
                <button
                  onClick={() => {
                    if (!showTranslation) {
                      setShowTranslation(true);
                      localStorage.setItem('ibadat_quran_show_translat', 'true');
                    }
                    setSelectedAyahForSheet(null);
                    setTimeout(() => {
                      const el = document.getElementById(`ayah-${selectedAyahForSheet.numberInSurah}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                    onShowAlert?.(
                      `আয়াত ${toBengaliNumber(selectedAyahForSheet.numberInSurah)}-এর অনুবাদ দেখানো হচ্ছে`,
                      true
                    );
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 text-left rounded-xl hover:bg-[#1a251e] active:bg-[#203027] transition cursor-pointer group"
                >
                  <BookOpen className="w-5 h-5 text-slate-300 group-hover:text-teal-300 shrink-0" />
                  <span className="text-[15px] font-medium text-slate-200 group-hover:text-white">
                    View Translation
                  </span>
                </button>

                {/* 3. Share Verse */}
                <button
                  onClick={() => {
                    const ayah = selectedAyahForSheet;
                    const translit =
                      ayah.transliterationBn || arabicToBengaliPronunciation(ayah.textArabic);
                    const text = `${ayah.textArabic}\n\n${translit ? translit + '\n\n' : ''}${
                      ayah.translationBn
                    }\n\n(QS. ${selectedSurah.englishName} ${selectedSurah.number}: Verse ${
                      ayah.numberInSurah
                    } - সূরা ${selectedSurah.banglaName})`;
                    if (navigator.share) {
                      navigator
                        .share({
                          title: `QS. ${selectedSurah.englishName} ${selectedSurah.number}:${ayah.numberInSurah}`,
                          text: text
                        })
                        .catch(() => {});
                    } else {
                      navigator.clipboard?.writeText(text);
                      onShowAlert?.('আয়াত কপি করা হয়েছে (শেয়ার করার জন্য)', true);
                    }
                    setSelectedAyahForSheet(null);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 text-left rounded-xl hover:bg-[#1a251e] active:bg-[#203027] transition cursor-pointer group"
                >
                  <Share2 className="w-5 h-5 text-slate-300 group-hover:text-teal-300 shrink-0" />
                  <span className="text-[15px] font-medium text-slate-200 group-hover:text-white">
                    Share Verse
                  </span>
                </button>

                {/* 4. Copy Verse */}
                <button
                  onClick={() => {
                    handleCopyAyah(selectedAyahForSheet);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 text-left rounded-xl hover:bg-[#1a251e] active:bg-[#203027] transition cursor-pointer group"
                >
                  {copiedAyahNumber === selectedAyahForSheet.numberInSurah ? (
                    <>
                      <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span className="text-[15px] font-medium text-emerald-300">
                        কপি হয়েছে (Copied!)
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 text-slate-300 group-hover:text-teal-300 shrink-0" />
                      <span className="text-[15px] font-medium text-slate-200 group-hover:text-white">
                        Copy Verse
                      </span>
                    </>
                  )}
                </button>

                {/* 5. Add / Remove Bookmark */}
                <button
                  onClick={() => {
                    handleToggleBookmark(
                      selectedSurah.number,
                      selectedSurah.banglaName,
                      selectedAyahForSheet.numberInSurah
                    );
                    setSelectedAyahForSheet(null);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 text-left rounded-xl hover:bg-[#1a251e] active:bg-[#203027] transition cursor-pointer group"
                >
                  {isAyahBookmarked(selectedSurah.number, selectedAyahForSheet.numberInSurah) ? (
                    <>
                      <BookmarkCheck className="w-5 h-5 text-teal-400 shrink-0" />
                      <span className="text-[15px] font-medium text-teal-300">
                        Remove Bookmark
                      </span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-5 h-5 text-slate-300 group-hover:text-teal-300 shrink-0" />
                      <span className="text-[15px] font-medium text-slate-200 group-hover:text-white">
                        Add to Bookmark
                      </span>
                    </>
                  )}
                </button>

                {/* 6. Mark as Last Read */}
                <button
                  onClick={() => {
                    const record = {
                      surahNumber: selectedSurah.number,
                      surahName: selectedSurah.banglaName,
                      surahEnglishName: selectedSurah.englishName,
                      ayahNumber: selectedAyahForSheet.numberInSurah,
                      timestamp: Date.now()
                    };
                    try {
                      localStorage.setItem('ibadat_quran_last_read', JSON.stringify(record));
                    } catch {
                      // ignore
                    }
                    setLastRead(record);
                    onShowAlert?.(
                      `সর্বশেষ পঠিত চিহ্নিত করা হয়েছে: QS. ${selectedSurah.englishName} ${selectedSurah.number}: Verse ${selectedAyahForSheet.numberInSurah}`,
                      true
                    );
                    setSelectedAyahForSheet(null);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 text-left rounded-xl hover:bg-[#1a251e] active:bg-[#203027] transition cursor-pointer group"
                >
                  <Paperclip className="w-5 h-5 text-slate-300 group-hover:text-teal-300 shrink-0" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-[15px] font-medium text-slate-200 group-hover:text-white">
                      Mark as Last Read
                    </span>
                    {lastRead &&
                      lastRead.surahNumber === selectedSurah.number &&
                      lastRead.ayahNumber === selectedAyahForSheet.numberInSurah && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-900/60 text-teal-300 border border-teal-700/50">
                          বর্তমান
                        </span>
                      )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: MAIN LIST SCREEN (Screenshot 1)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0e1412] text-slate-100 flex flex-col font-sans -m-4">
      {/* Top Header Bar (Screenshot 1) */}
      <header className="sticky top-0 z-30 bg-[#0e1412]/95 backdrop-blur-md border-b border-[#1c2923] px-3.5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {/* Teal Quran Emblem Icon */}
            <div className="w-8 h-8 rounded-full bg-teal-800/80 border border-teal-500/50 flex items-center justify-center text-teal-200 shadow-xs">
              <BookOpen className="w-4 h-4 stroke-[2]" />
            </div>
            <h1 className="text-base font-bold text-white tracking-wide">
              Read Qur'an
            </h1>
          </div>

          <div className="flex items-center space-x-1 text-slate-300">
            {/* View / Sort icon */}
            <button
              onClick={() => {
                onShowAlert?.('সূরা তালিকা ক্রম অনুযায়ী সাজানো আছে।', true);
              }}
              title="ভিউ মোড"
              className="p-2 rounded-lg hover:bg-[#16231d] text-slate-300 transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen((prev) => !prev)}
              title="সূরা খুঁজুন"
              className={`p-2 rounded-lg transition ${
                isSearchOpen ? 'bg-teal-900/60 text-[#2dd4bf]' : 'hover:bg-[#16231d] text-slate-300'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Quick Bookmark Action */}
            <button
              onClick={() => setSubTab('BOOKMARK')}
              title="বুকমার্ক দেখুন"
              className="p-2 rounded-lg hover:bg-[#16231d] text-slate-300 transition"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Search Input */}
        {isSearchOpen && (
          <div className="mt-2.5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="সূরার নাম অথবা নম্বর দিয়ে খুঁজুন (যেমন: Fatihah, 36, ইয়াসীন)..."
              autoFocus
              className="w-full bg-[#141f19] border border-[#23352c] focus:border-[#2dd4bf] rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </header>

      {/* Subtabs Bar: SURAH | JUZ | BOOKMARK (Screenshot 1) */}
      <div className="border-b border-[#1c2923] bg-[#0e1412] px-4 flex items-center justify-around">
        {(['SURAH', 'JUZ', 'BOOKMARK'] as QuranSubTab[]).map((tab) => {
          const isActive = subTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`py-3 flex-1 text-center text-xs tracking-wider uppercase transition-colors relative select-none ${
                isActive
                  ? 'font-bold text-white'
                  : 'font-medium text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'SURAH' && 'SURAH'}
              {tab === 'JUZ' && 'JUZ'}
              {tab === 'BOOKMARK' && `BOOKMARK ${bookmarks.length > 0 ? `(${bookmarks.length})` : ''}`}

              {/* Bronze/Gold Active Underline Bar */}
              {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#c49b63] rounded-full shadow-xs" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 px-3 py-2 max-w-xl mx-auto w-full pb-24">
        {/* SUBTAB: SURAH LIST (Screenshot 1) */}
        {subTab === 'SURAH' && (
          <div className="divide-y divide-[#17231c]">
            {filteredSurahs.map((surah) => {
              return (
                <div
                  key={surah.number}
                  onClick={() => setSelectedSurah(surah)}
                  className="py-3 px-1.5 flex items-center justify-between hover:bg-[#131d17] active:bg-[#17241d] rounded-xl cursor-pointer transition select-none group"
                >
                  {/* Left: 8-Point Star with Surah Number */}
                  <div className="flex items-center space-x-3.5">
                    <IslamicStar
                      number={surah.number}
                      size={40}
                      numberClassName="text-[#2dd4bf] text-xs font-bold"
                    />

                    {/* Surah Name and Revelation info */}
                    <div>
                      <div className="text-sm font-semibold text-white tracking-wide group-hover:text-teal-200 transition">
                        {surah.englishName}
                      </div>
                      <div className="text-[11px] text-slate-400 tracking-wide uppercase mt-0.5">
                        {surah.revelationType} | {surah.numberOfAyahs} Verses
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        সূরা {surah.banglaName}
                      </div>
                    </div>
                  </div>

                  {/* Right: Arabic Calligraphy & Action Icon */}
                  <div className="flex items-center space-x-3">
                    <div
                      style={{ fontFamily: "'Amiri', serif" }}
                      className="text-xl sm:text-2xl text-slate-200 font-normal select-none tracking-wide"
                    >
                      {surah.name}
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSurah(surah);
                      }}
                      className="p-1.5 rounded-lg text-[#2dd4bf] hover:bg-[#1a2820] transition"
                      title="সূরা পড়ুন ও তিলাওয়াত শুনুন"
                    >
                      <Volume2 className="w-5 h-5 stroke-[1.8]" />
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredSurahs.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                কোনো সূরা পাওয়া যায়নি। অন্য বানান দিয়ে খুঁজুন।
              </div>
            )}
          </div>
        )}

        {/* SUBTAB: JUZ LIST */}
        {subTab === 'JUZ' && (
          <div className="space-y-2 py-2">
            {JUZ_LIST.map((juz) => {
              return (
                <div
                  key={juz.number}
                  onClick={() => {
                    const targetSurah = ALL_SURAHS.find((s) => s.number === juz.startSurahNumber);
                    if (targetSurah) setSelectedSurah(targetSurah);
                  }}
                  className="bg-[#111915] border border-[#1b2720] hover:border-[#2a3c32] rounded-xl p-3 flex items-center justify-between cursor-pointer active:bg-[#16231c] transition"
                >
                  <div className="flex items-center space-x-3">
                    <IslamicStar
                      number={juz.number}
                      size={38}
                      numberClassName="text-[#c49b63] text-xs font-bold"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">
                        পারা {toBengaliNumber(juz.number)} ({juz.nameBn})
                      </div>
                      <div className="text-[11px] text-slate-400">
                        শুরু: {juz.startSurahName} (আয়াত {juz.startAyah})
                      </div>
                    </div>
                  </div>

                  <div
                    style={{ fontFamily: "'Amiri', serif" }}
                    className="text-lg text-[#2dd4bf] font-medium"
                  >
                    {juz.nameArabic}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SUBTAB: BOOKMARK LIST */}
        {subTab === 'BOOKMARK' && (
          <div className="space-y-3 py-2">
            {/* Last Read Card */}
            {lastRead && (
              <div
                onClick={() => {
                  const targetSurah = ALL_SURAHS.find((s) => s.number === lastRead.surahNumber);
                  if (targetSurah) {
                    setSelectedSurah(targetSurah);
                    setTimeout(() => {
                      const el = document.getElementById(`ayah-${lastRead.ayahNumber}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 400);
                  }
                }}
                className="bg-gradient-to-r from-[#14231b] to-[#162a1f] border border-teal-700/50 hover:border-teal-400/70 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition shadow-md group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-900/70 border border-teal-500/50 flex items-center justify-center text-teal-300 shrink-0">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                      সর্বশেষ পঠিত (Last Read)
                    </div>
                    <div className="text-sm font-bold text-white group-hover:text-teal-200">
                      QS. {lastRead.surahEnglishName} {lastRead.surahNumber}: Verse {lastRead.ayahNumber}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      সূরা {lastRead.surahName} • আয়াত {toBengaliNumber(lastRead.ayahNumber)}
                    </div>
                  </div>
                </div>

                <div className="text-xs px-3 py-1.5 rounded-xl bg-teal-800/80 text-teal-200 border border-teal-600/50 group-hover:bg-teal-700 transition font-medium shrink-0">
                  পড়ুন →
                </div>
              </div>
            )}

            {bookmarks.length === 0 && !lastRead ? (
              <div className="py-16 text-center space-y-2">
                <BookMarked className="w-10 h-10 text-slate-600 mx-auto stroke-[1.5]" />
                <div className="text-sm font-medium text-slate-300">কোনো বুকমার্ক পাওয়া যায়নি</div>
                <div className="text-xs text-slate-500 max-w-xs mx-auto">
                  সূরা পড়ার সময় আয়াতের বারে ক্লিক করে বুকমার্ক বা সর্বশেষ পঠিত হিসেবে সংরক্ষণ করতে পারেন।
                </div>
              </div>
            ) : (
              bookmarks.map((b) => {
                const targetSurah = ALL_SURAHS.find((s) => s.number === b.surahNumber);
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      if (targetSurah) setSelectedSurah(targetSurah);
                    }}
                    className="bg-[#111915] border border-[#1c2923] hover:border-teal-500/40 rounded-xl p-3 flex items-center justify-between cursor-pointer transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <IslamicStar
                        number={b.surahNumber}
                        size={36}
                        numberClassName="text-[#2dd4bf] text-xs font-bold"
                      />
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-teal-200">
                          সূরা {b.surahName} {b.ayahNumber ? `(আয়াত: ${b.ayahNumber})` : ''}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {targetSurah?.englishName} • {targetSurah?.revelationTypeBn}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBookmark(b.id);
                          setBookmarks(getBookmarks());
                          onShowAlert?.('বুকমার্ক মুছে ফেলা হয়েছে।', false);
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                        title="মুছে ফেলুন"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

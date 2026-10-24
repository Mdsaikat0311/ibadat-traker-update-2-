import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Settings as SettingsIcon,
  BookOpen,
  SlidersHorizontal,
  BookMarked
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
  toArabicNumber
} from '../data/quranData';
import { IslamicStar } from '../components/quran/IslamicStar';

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

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>(getBookmarks());
  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);

  // Reading Settings
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => {
    return parseInt(localStorage.getItem('ibadat_quran_font_ar') || '28', 10);
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

  const playAyahAudio = (ayah: Ayah) => {
    if (!ayah.audioUrl) return;

    if (currentPlayingAyah === ayah.numberInSurah && isPlayingAudio) {
      stopAudio();
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = ayah.audioUrl;
    audioRef.current.play().then(() => {
      setIsPlayingAudio(true);
      setCurrentPlayingAyah(ayah.numberInSurah);
    }).catch((e) => {
      console.warn("Audio playback error:", e);
      setIsPlayingAudio(false);
    });

    audioRef.current.onended = () => {
      // Auto play next ayah in surah if available
      const nextIndex = ayah.numberInSurah;
      if (nextIndex < ayahs.length) {
        const nextAyah = ayahs[nextIndex];
        playAyahAudio(nextAyah);
      } else {
        setIsPlayingAudio(false);
        setCurrentPlayingAyah(null);
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
    const text = `${ayah.textArabic}\n\n${ayah.transliterationBn ? ayah.transliterationBn + '\n\n' : ''}${ayah.translationBn}\n(সূরা ${selectedSurah?.banglaName}, আয়াত: ${ayah.numberInSurah})`;
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

  // ----------------------------------------------------
  // VIEW: SURAH READER (Screen 2)
  // ----------------------------------------------------
  if (selectedSurah) {
    const isFirstSurah = selectedSurah.number === 1;
    const isTawbah = selectedSurah.number === 9;
    const currentJuz = ayahs[0]?.juz || selectedSurah.startJuz;
    const currentPage = ayahs[0]?.page || selectedSurah.startPage;

    return (
      <div className="min-h-screen bg-[#0e1412] text-slate-100 flex flex-col font-sans -m-4">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#0e1412]/95 backdrop-blur-md border-b border-[#1c2923] px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                stopAudio();
                setSelectedSurah(null);
              }}
              className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-lg active:bg-slate-800 transition"
              aria-label="Back to Surah List"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>

            {/* Circular Green Quran Emblem */}
            <div className="w-8 h-8 rounded-full bg-teal-800/80 border border-teal-500/50 flex items-center justify-center text-teal-200 shadow-xs">
              <BookOpen className="w-4 h-4 stroke-[2]" />
            </div>

            <div>
              <div className="text-sm font-bold text-white tracking-wide">
                Page {currentPage}
              </div>
              <div className="text-[11px] text-[#2dd4bf] font-medium leading-tight">
                Juz {currentJuz}
              </div>
            </div>
          </div>

          {/* Top Actions: Settings, Layout, Audio, Bookmark */}
          <div className="flex items-center space-x-1 sm:space-x-2 text-slate-300">
            <button
              onClick={() => {
                if (ayahs.length > 0) {
                  const targetAyah = ayahs.find(a => a.numberInSurah === (currentPlayingAyah || 1)) || ayahs[0];
                  playAyahAudio(targetAyah);
                }
              }}
              title={isPlayingAudio ? "অডিও থামান" : "সম্পূর্ণ সূরা তিলাওয়াত শুনুন"}
              className={`p-2 rounded-lg transition ${
                isPlayingAudio ? 'text-[#2dd4bf] bg-teal-950/60' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              {isPlayingAudio ? (
                <Volume2 className="w-5 h-5 animate-pulse text-[#2dd4bf]" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
            </button>

            <button
              onClick={() => handleToggleBookmark(selectedSurah.number, selectedSurah.banglaName)}
              title="সূরা বুকমার্ক করুন"
              className="p-2 rounded-lg hover:bg-slate-800 transition text-slate-300"
            >
              {isAyahBookmarked(selectedSurah.number) ? (
                <BookmarkCheck className="w-5 h-5 text-[#2dd4bf]" />
              ) : (
                <Bookmark className="w-5 h-5 stroke-[1.8]" />
              )}
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              title="পড়ার সেটিংস ও ফন্ট"
              className="p-2 rounded-lg hover:bg-slate-800 transition text-slate-300"
            >
              <SettingsIcon className="w-5 h-5 stroke-[1.8]" />
            </button>
          </div>
        </header>

        {/* Horizontal Surah Switcher Bar */}
        <div className="bg-[#121b17] border-b border-[#1c2923] overflow-x-auto no-scrollbar py-1.5 px-2 flex space-x-2">
          {ALL_SURAHS.map((s) => {
            const isCurrent = s.number === selectedSurah.number;
            return (
              <button
                key={s.number}
                onClick={() => {
                  if (s.number !== selectedSurah.number) {
                    stopAudio();
                    setSelectedSurah(s);
                  }
                }}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded-md font-medium transition-all ${
                  isCurrent
                    ? 'bg-[#1e2f26] text-[#2dd4bf] border-b-2 border-[#b58e57] shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#16231d]'
                }`}
              >
                {s.number}. {s.englishName}
              </button>
            );
          })}
        </div>

        {/* Reader Body Content */}
        <div className="flex-1 px-3 py-4 max-w-xl mx-auto w-full space-y-4 pb-28">
          {/* Ornate Islamic Framed Banner (Matches Screenshot 2) */}
          <div className="relative rounded-xl overflow-hidden border border-[#8f7347]/60 bg-gradient-to-b from-[#16221c] via-[#101915] to-[#0c1310] p-3 shadow-md">
            {/* Vintage Islamic Arabesque Frame Border */}
            <div className="absolute inset-0.5 border border-[#8f7347]/30 rounded-lg pointer-events-none" />
            <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-[#c49b63]" />
            <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-[#c49b63]" />
            <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-[#c49b63]" />
            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-[#c49b63]" />

            <div className="relative flex items-center justify-between">
              {/* Left Box: Revelation Badge / Kaaba emblem */}
              <div className="w-14 h-11 rounded-lg border border-[#8f7347]/50 bg-[#141e19] flex flex-col items-center justify-center text-[10px] text-[#c49b63] font-medium shadow-inner">
                <span className="text-base leading-none">🕋</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-300">
                  {selectedSurah.revelationType === 'MECCAN' ? 'মাক্কী' : 'মাদানী'}
                </span>
              </div>

              {/* Center Box: Arabic Calligraphy Title */}
              <div className="text-center px-2 flex-1">
                <h2
                  style={{ fontFamily: "'Amiri', serif" }}
                  className="text-2xl sm:text-3xl font-bold text-[#fef9c3] tracking-wide drop-shadow-sm"
                >
                  {selectedSurah.name}
                </h2>
                <div className="text-xs text-slate-300 font-medium mt-0.5">
                  সূরা {selectedSurah.banglaName} • {selectedSurah.englishName}
                </div>
              </div>

              {/* Right Box: Verse Count Badge */}
              <div className="w-14 h-11 rounded-lg border border-[#8f7347]/50 bg-[#141e19] flex flex-col items-center justify-center text-center shadow-inner">
                <span className="text-sm font-bold text-[#2dd4bf]">
                  {selectedSurah.numberOfAyahs}
                </span>
                <span className="text-[9px] uppercase text-slate-400 tracking-wider">
                  Verses
                </span>
              </div>
            </div>
          </div>

          {/* Bismillah Header (Except Surah 9 At-Tawbah & Surah 1 where it is Ayah 1) */}
          {!isTawbah && !isFirstSurah && (
            <div className="text-center py-4 border-b border-[#1c2923]/80">
              <div
                style={{ fontFamily: "'Amiri', serif" }}
                className="text-2xl text-[#f3f4f6] font-semibold tracking-wider leading-loose drop-shadow-sm select-none"
              >
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </div>
              <div className="text-xs text-[#2dd4bf] mt-1">
                বিছমিল্লাহির রাহমানির রাহিম
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                পরম করুণাময় অসীম দয়ালু আল্লাহর নামে শুরু করছি
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

          {/* Ayah Cards List (Exact layout of Screenshot 2) */}
          {!loadingAyahs &&
            ayahs.map((ayah) => {
              const isPlayingThisAyah = currentPlayingAyah === ayah.numberInSurah;
              const isBookmarked = isAyahBookmarked(selectedSurah.number, ayah.numberInSurah);
              const isCopied = copiedAyahNumber === ayah.numberInSurah;

              return (
                <div
                  key={ayah.numberInSurah}
                  id={`ayah-${ayah.numberInSurah}`}
                  className={`rounded-xl border transition-all duration-200 p-3.5 space-y-3 ${
                    isPlayingThisAyah
                      ? 'bg-[#15231c] border-teal-500/60 shadow-lg ring-1 ring-teal-500/30'
                      : 'bg-[#111915]/80 border-[#1a2620] hover:border-[#283b32]'
                  }`}
                >
                  {/* Top Bar of Card: Star with Ayah number + Action buttons */}
                  <div className="flex items-center justify-between pb-1">
                    <IslamicStar
                      number={ayah.numberInSurah}
                      size={34}
                      numberClassName="text-[#2dd4bf] text-[11px] font-bold"
                    />

                    <div className="flex items-center space-x-1">
                      {/* Play Ayah Audio */}
                      <button
                        onClick={() => playAyahAudio(ayah)}
                        title="এই আয়াতের তিলাওয়াত শুনুন"
                        className={`p-1.5 rounded-lg transition ${
                          isPlayingThisAyah
                            ? 'text-[#2dd4bf] bg-teal-900/60'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-[#1c2923]'
                        }`}
                      >
                        {isPlayingThisAyah ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>

                      {/* Copy Ayah */}
                      <button
                        onClick={() => handleCopyAyah(ayah)}
                        title="আয়াত কপি করুন"
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1c2923] rounded-lg transition"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {/* Bookmark Ayah */}
                      <button
                        onClick={() =>
                          handleToggleBookmark(
                            selectedSurah.number,
                            selectedSurah.banglaName,
                            ayah.numberInSurah
                          )
                        }
                        title="এই আয়াত বুকমার্ক করুন"
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1c2923] rounded-lg transition"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-[#2dd4bf]" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Arabic Ayah Text with Uthmani End-of-Ayah Marker (Screenshot 2) */}
                  <div
                    dir="rtl"
                    style={{
                      fontFamily: "'Amiri', serif",
                      fontSize: `${arabicFontSize}px`,
                      lineHeight: '2.1'
                    }}
                    className="text-right text-[#fbfaf8] font-normal tracking-wide px-1 select-text"
                  >
                    {ayah.textArabic}{' '}
                    <span className="inline-flex items-center justify-center align-middle mx-1.5 text-amber-400/90 text-[0.8em] font-sans">
                      ۝<span className="text-[0.65em] font-bold text-amber-300 -mr-0.5">{toArabicNumber(ayah.numberInSurah)}</span>
                    </span>
                  </div>

                  {/* Bengali Transliteration (উচ্চারণ) - Teal/Cyan Color */}
                  {showTransliteration && ayah.transliterationBn && (
                    <div className="text-[#2dd4bf] text-[13px] leading-relaxed font-medium pt-1 px-0.5">
                      {ayah.transliterationBn}
                    </div>
                  )}

                  {/* Bengali Translation (অনুবাদ) - Crisp White/Light-gray */}
                  {showTranslation && (
                    <div className="text-slate-200 text-[13px] leading-relaxed font-normal pt-0.5 px-0.5">
                      {ayah.translationBn}
                    </div>
                  )}
                </div>
              );
            })}

          {/* Bottom Next/Prev Surah Navigator */}
          {!loadingAyahs && ayahs.length > 0 && (
            <div className="flex items-center justify-between pt-6 pb-8 border-t border-[#1c2923]">
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
          <div className="space-y-2.5 py-2">
            {bookmarks.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <BookMarked className="w-10 h-10 text-slate-600 mx-auto stroke-[1.5]" />
                <div className="text-sm font-medium text-slate-300">কোনো বুকমার্ক পাওয়া যায়নি</div>
                <div className="text-xs text-slate-500 max-w-xs mx-auto">
                  সূরা পড়ার সময় বুকমার্ক আইকনে ক্লিক করে যে কোনো সূরা বা আয়াত সংরক্ষণ করতে পারেন।
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

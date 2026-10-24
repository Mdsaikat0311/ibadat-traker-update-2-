import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Volume2, Pause, Sparkles } from 'lucide-react';
import {
  TajweedConfig,
  TAJWEED_RULES,
  TajweedRuleItem,
  saveTajweedConfig
} from '../../utils/tajweedService';

interface TajweedSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TajweedConfig;
  onConfigChange: (newConfig: TajweedConfig) => void;
  onShowAlert?: (message: string, isSuccess: boolean) => void;
}

export const TajweedSettingModal: React.FC<TajweedSettingModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
  onShowAlert
}) => {
  const [playingRuleId, setPlayingRuleId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleToggleGlobal = () => {
    const updated = { ...config, enabled: !config.enabled };
    onConfigChange(updated);
    saveTajweedConfig(updated);
    onShowAlert?.(
      updated.enabled
        ? 'তাজবীদ কালার সিস্টেম চালু করা হয়েছে।'
        : 'তাজবীদ কালার বন্ধ করা হয়েছে (সব হরফ সাদা)।',
      true
    );
  };

  const handleToggleRule = (ruleId: keyof Omit<TajweedConfig, 'enabled'>) => {
    const updated = { ...config, [ruleId]: !config[ruleId] };
    onConfigChange(updated);
    saveTajweedConfig(updated);
  };

  const handlePlayAudio = (rule: TajweedRuleItem) => {
    if (playingRuleId === rule.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingRuleId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(rule.audioUrl);
    audioRef.current = audio;
    setPlayingRuleId(rule.id);

    audio.play().catch(() => {
      setPlayingRuleId(null);
      onShowAlert?.('অডিও প্লে করতে সমস্যা হয়েছে।', false);
    });

    audio.onended = () => {
      setPlayingRuleId(null);
    };
  };

  // Render Arabic example text with specific color highlight
  const renderExampleWithColor = (rule: TajweedRuleItem) => {
    const isRuleActive = config.enabled && config[rule.id];
    const text = rule.exampleArabic;

    if (!isRuleActive) {
      return <span className="text-white select-text">{text}</span>;
    }

    // Replace first matching highlight part
    for (const part of rule.highlightParts) {
      if (text.includes(part)) {
        const segments = text.split(part);
        return (
          <span className="select-text">
            {segments.map((seg, idx) => (
              <React.Fragment key={idx}>
                <span className="text-white">{seg}</span>
                {idx < segments.length - 1 && (
                  <span style={{ color: rule.highlightColor }} className="font-semibold">
                    {part}
                  </span>
                )}
              </React.Fragment>
            ))}
          </span>
        );
      }
    }

    return <span className="text-white select-text">{text}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070b09]/95 backdrop-blur-md flex flex-col font-sans overflow-hidden">
      {/* Top Header Bar matching user's screenshots */}
      <header className="sticky top-0 z-20 bg-[#070b09] border-b border-[#15201a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              onClose();
            }}
            className="p-1.5 -ml-1.5 text-slate-200 hover:text-white rounded-lg active:bg-slate-800 transition"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide flex items-center space-x-2">
              <span>Tajweed Setting</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-950 text-[#2dd4bf] border border-teal-800/40">
                তাজবীদ রুলস
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              আরবি হরফের উপর তাশদীদ ও তাজবীদ কালার রুলস
            </p>
          </div>
        </div>

        {/* Master ON/OFF Switch */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-300">
            {config.enabled ? 'চালু' : 'বন্ধ'}
          </span>
          <button
            onClick={handleToggleGlobal}
            className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 ${
              config.enabled ? 'bg-teal-500' : 'bg-slate-700'
            }`}
            title="সবগুলো কালার অন/অফ করুন"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                config.enabled ? 'translate-x-5.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </header>

      {/* Main Rules Content List */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4 max-w-xl mx-auto w-full pb-16">
        {/* Helper Banner */}
        <div className="bg-[#101914] border border-[#1b2b22] rounded-xl p-3 flex items-start space-x-3 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-[#2dd4bf] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-white">তাজবীদ কালার সিস্টেম:</span>{' '}
            চালু থাকলে কুরআন পড়ার সময় হরফের উপর স্বয়ংক্রিয় কালার চলে আসবে। আর অফ করলে
            হরফগুলো স্বাভাবিক সাদা রঙের দেখাবে।
          </div>
        </div>

        {/* Tajweed Cards (100% matched to screenshots) */}
        {TAJWEED_RULES.map((rule) => {
          const isRuleActive = config.enabled && config[rule.id];
          const isAudioPlaying = playingRuleId === rule.id;

          return (
            <div
              key={rule.id}
              className="rounded-2xl overflow-hidden border border-[#1b2820] bg-[#0c120f] shadow-lg transition-all"
            >
              {/* Colored Header Banner with Title + Toggle */}
              <div
                style={{ backgroundColor: rule.headerBg }}
                className="px-4 py-2.5 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <span
                    style={{ color: rule.headerTextColor }}
                    className="text-sm font-bold tracking-wide"
                  >
                    {rule.title}
                  </span>
                  <span
                    style={{ color: rule.headerTextColor }}
                    className="text-[11px] opacity-90 font-medium"
                  >
                    ({rule.titleBn})
                  </span>
                </div>

                {/* Individual Rule Toggle Switch */}
                <button
                  onClick={() => handleToggleRule(rule.id)}
                  disabled={!config.enabled}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    !config.enabled
                      ? 'bg-black/30 opacity-50 cursor-not-allowed'
                      : isRuleActive
                      ? 'bg-white'
                      : 'bg-black/40'
                  }`}
                  aria-label={`Toggle ${rule.title}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full shadow-sm transition-transform ${
                      isRuleActive
                        ? 'translate-x-5 bg-teal-700'
                        : 'translate-x-0 bg-white'
                    }`}
                  />
                  <span
                    className={`absolute inset-y-0 text-[9px] font-bold flex items-center ${
                      isRuleActive
                        ? 'left-1.5 text-teal-800'
                        : 'right-1.5 text-white/80'
                    }`}
                  >
                    {isRuleActive ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Bengali Rule Explanation */}
                <p className="text-[13px] leading-relaxed text-slate-200 font-normal">
                  {rule.ruleExplanationBn}
                </p>

                {/* Subtitle click hint */}
                <div className="text-[11px] text-slate-400 italic">
                  * উদাহরণের তিলাওয়াত শুনতে সাউন্ড আইকনে চাপুন।
                </div>

                {/* Example Row: Arabic Text (Right-to-Left) + Sound Button */}
                <div className="pt-2 flex items-center justify-between gap-4 border-t border-[#16231b]">
                  {/* Sound Play Button */}
                  <button
                    onClick={() => handlePlayAudio(rule)}
                    className={`p-2 rounded-xl border transition flex items-center justify-center shrink-0 ${
                      isAudioPlaying
                        ? 'bg-teal-900/60 border-teal-500/50 text-[#2dd4bf] animate-pulse'
                        : 'bg-[#15211a] border-[#223329] text-slate-300 hover:text-white hover:bg-[#1b2b22]'
                    }`}
                    title="উদাহরণ শুনুন"
                  >
                    {isAudioPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Volume2 className="w-5 h-5 stroke-[2]" />
                    )}
                  </button>

                  {/* Arabic Example Text with Tajweed Highlighting */}
                  <div
                    dir="rtl"
                    style={{ fontFamily: "'Amiri', serif" }}
                    className="text-right text-xl sm:text-2xl font-normal tracking-wide text-white flex-1"
                  >
                    {renderExampleWithColor(rule)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

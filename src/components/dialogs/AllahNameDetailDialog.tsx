import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles, RotateCcw, Award, Pin } from 'lucide-react';
import { AllahNameItem } from '../../data/allahNamesData';
import { NotificationService } from '../../services/notificationService';

interface AllahNameDetailDialogProps {
  item: AllahNameItem;
  isPinned?: boolean;
  onTogglePin?: (id: number) => void;
  onDismiss: () => void;
  onShowAlert?: (msg: string, isSuccess: boolean) => void;
}

export const AllahNameDetailDialog: React.FC<AllahNameDetailDialogProps> = ({
  item,
  isPinned = false,
  onTogglePin,
  onDismiss,
  onShowAlert
}) => {
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState(0);

  const handleTap = () => {
    setCount(prev => {
      const next = prev + 1;
      NotificationService.playChime();
      return next;
    });
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCount(0);
  };

  const handlePinClick = () => {
    if (onTogglePin) {
      onTogglePin(item.id);
    }
  };

  const handleCopy = () => {
    const text = `【 আল্লাহর গুণবাচক নাম: ${item.name} (${item.arabic}) 】\n\nঅর্থ: ${item.meaning}\nআমল ও পাঠের নিয়ম: ${item.countRecommendation}\n\nফযিলত ও বৈশিষ্ট্য:\n${item.fazilat}\n\nব্যাখ্যা ও মহিমা:\n${item.explanation}\n\n(ইবাদত ট্র্যাকার অ্যাপ)`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onShowAlert) {
        onShowAlert('নাম ও ফযিলত সফলভাবে কপি হয়েছে!', true);
      }
    });
  };

  const handleShare = async () => {
    const text = `【 আল্লাহর গুণবাচক নাম: ${item.name} (${item.arabic}) 】\n\nঅর্থ: ${item.meaning}\nআমল: ${item.countRecommendation}\n\nফযিলত: ${item.fazilat}\n\n(ইবাদত ট্র্যাকার)`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `আল্লাহর ৯৯ নাম - ${item.name}`,
          text
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onDismiss}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-gradient-to-b from-[#141b16] via-[#101612] to-[#0c100e] text-[#e3ebe5] rounded-3xl border border-[#243529] shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-[#223126] bg-[#162119]/80">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#1b3d27] border border-[#2d6641] text-[#4ade80] flex items-center justify-center text-xs font-bold font-mono">
              {item.bnNumber}
            </span>
            <span className="text-xs font-semibold text-[#8ca895] uppercase tracking-wider">
              আল্লাহর নাম
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Pin to Top Button requested by user */}
            <button
              type="button"
              onClick={handlePinClick}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                isPinned
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-[#1a261e] border-[#293d2f] text-[#8ca895] hover:text-white hover:border-[#38533f]'
              }`}
              title={isPinned ? 'তালিকা থেকে আনপিন করুন' : 'তালিকার শীর্ষে পিন করুন'}
            >
              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400 text-amber-400 rotate-45' : ''}`} />
              <span className="hidden xs:inline">{isPinned ? 'পিন করা' : 'পিন'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-[#1a261e] border border-[#293d2f] text-[#8ca895] hover:text-white transition cursor-pointer"
              title="কপি করুন"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-[#1a261e] border border-[#293d2f] text-[#8ca895] hover:text-white transition cursor-pointer"
              title="শেয়ার করুন"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="p-1.5 rounded-lg bg-[#1a261e] border border-[#293d2f] text-[#8ca895] hover:text-white transition cursor-pointer ml-0.5"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Main Name Presentation Card */}
          <div className={`relative rounded-2xl p-5 border text-center shadow-inner overflow-hidden ${
            isPinned
              ? 'bg-gradient-to-br from-[#272615] via-[#1a2016] to-[#0f1a13] border-amber-500/40'
              : 'bg-gradient-to-br from-[#1b2d21] via-[#152319] to-[#0f1a13] border-[#2b4c35]'
          }`}>
            {isPinned && (
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
                <Pin className="w-3.5 h-3.5 fill-amber-400 rotate-45" />
                <span>তালিকার শীর্ষে পিন করা</span>
              </div>
            )}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#22c55e]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#10b981]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Arabic Name (Large, glowing calligraphy style) */}
            <div
              dir="rtl"
              lang="ar"
              className="text-4xl sm:text-5xl font-['Amiri',serif] font-bold text-[#34d399] drop-shadow-[0_2px_12px_rgba(52,211,153,0.35)] py-2 select-text"
            >
              {item.arabic}
            </div>

            {/* Bengali Transliteration */}
            <div className="text-xl sm:text-2xl font-bold text-white tracking-wide mt-1">
              {item.name}
            </div>

            {/* Bengali Meaning */}
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-[#112418] border border-[#275336] text-[#6ee7b7] text-xs font-semibold">
              অর্থ: {item.meaning}
            </div>
          </div>

          {/* কয়বার পড়লে কি ফজিলত (Virtues / Fazilat Section) */}
          <div className="rounded-2xl bg-[#16221a] border border-[#284130] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#4ade80] font-bold text-sm">
                <Sparkles className="w-4 h-4 fill-current" />
                <span>আমল ও ফযিলত</span>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#1e3d29] text-[#a7f3d0] border border-[#316943]">
                {item.countRecommendation}
              </span>
            </div>

            <p className="text-sm text-[#d4e2d8] leading-relaxed whitespace-pre-line pt-1">
              {item.fazilat}
            </p>
          </div>

          {/* নামের অর্থ ও ব্যাখ্যা (Explanation Section) */}
          <div className="rounded-2xl bg-[#141d17] border border-[#213024] p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#9cb4a4] font-semibold text-xs uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-[#34d399]" />
              <span>নামের মহিমা ও ব্যাখ্যা</span>
            </div>
            <p className="text-xs sm:text-sm text-[#a8beaf] leading-relaxed">
              {item.explanation}
            </p>
          </div>

          {/* Quick Interactive Tasbih Counter */}
          <div className="rounded-2xl bg-gradient-to-r from-[#17261c] via-[#142017] to-[#17261c] border border-[#283e2e] p-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-[#8ca895]">তসবিহ গণনা</div>
              <div className="text-xl font-bold text-[#4ade80] font-mono leading-tight">
                {count} <span className="text-xs text-[#8ca895] font-normal">বার পাঠ</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {count > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 rounded-xl bg-[#1b2b20] hover:bg-[#23382a] text-[#8ca895] hover:text-white transition cursor-pointer"
                  title="পুনরায় শুরু করুন"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleTap}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-md active:scale-95 transition cursor-pointer select-none"
              >
                জিকির ট্যাপ
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e2c21] bg-[#111813] flex justify-end">
          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-2.5 rounded-xl bg-[#1d2d22] hover:bg-[#253a2c] text-[#e3ebe5] font-semibold text-sm transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

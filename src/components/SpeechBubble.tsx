import React from 'react';
import { Volume2, Sparkles, Heart } from 'lucide-react';

interface SpeechBubbleProps {
  message: string;
  isSpeaking: boolean;
  onReplaySpeech: () => void;
  tone?: 'normal' | 'happy' | 'encouraging' | 'celebrate';
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  message,
  isSpeaking,
  onReplaySpeech,
  tone = 'normal',
}) => {
  const getToneStyle = () => {
    switch (tone) {
      case 'celebrate':
        return 'border-amber-400 bg-amber-50/95 text-amber-950 shadow-amber-300/50';
      case 'happy':
        return 'border-emerald-400 bg-emerald-50/95 text-emerald-950 shadow-emerald-300/40';
      case 'encouraging':
        return 'border-sky-300 bg-sky-50/95 text-sky-950 shadow-sky-300/40';
      default:
        return 'border-amber-200 bg-white/95 text-slate-800 shadow-amber-900/10';
    }
  };

  return (
    <div className="relative inline-block max-w-[92vw] sm:max-w-xl md:max-w-2xl transition-all duration-300">
      <div
        className={`relative px-4 sm:px-6 py-3 sm:py-4 rounded-3xl border-3 shadow-xl backdrop-blur-sm ${getToneStyle()} transition-transform duration-200`}
      >
        <div className="flex items-center gap-3">
          {/* Animated decorative icon */}
          <div className="shrink-0 flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white shadow-sm border border-amber-200">
            {tone === 'celebrate' || tone === 'happy' ? (
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
            ) : tone === 'encouraging' ? (
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 animate-pulse" />
            ) : (
              <span className="text-xl sm:text-2xl">🐰</span>
            )}
          </div>

          {/* Speech Text */}
          <div className="flex-1 min-w-0">
            <p className="text-base sm:text-lg md:text-xl font-bold tracking-tight leading-snug break-words">
              {message}
            </p>
          </div>

          {/* Replay audio button */}
          <button
            type="button"
            onClick={onReplaySpeech}
            title="Nghe lại lời Thỏ nói"
            aria-label="Nghe lại lời Thỏ nói"
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm font-extrabold cursor-pointer transition-all active:scale-95 shadow-sm ${
              isSpeaking
                ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300 animate-pulse'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
            }`}
          >
            <Volume2 className={`w-4 h-4 sm:w-5 sm:h-5 ${isSpeaking ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">Nghe Thỏ nói</span>
          </button>
        </div>

        {/* Speech bubble tail pointing towards Bunny */}
        <div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-inherit border-r-3 border-b-3 border-inherit rotate-45"
          style={{ backgroundClip: 'padding-box' }}
        />
      </div>
    </div>
  );
};

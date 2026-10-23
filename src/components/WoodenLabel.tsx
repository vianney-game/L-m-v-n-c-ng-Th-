import React from 'react';
import { Leaf, GripHorizontal, CheckCircle2 } from 'lucide-react';
import { VegetableId } from '../types/game';

interface WoodenLabelProps {
  id: VegetableId;
  name: string;
  isPlaced: boolean;
  placedBasket?: 'LEFT' | 'RIGHT' | null;
  isDragging?: boolean;
  isSelected?: boolean;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const WoodenLabel: React.FC<WoodenLabelProps> = ({
  id,
  name,
  isPlaced,
  isDragging = false,
  isSelected = false,
  onPointerDown,
  onClick,
  className = '',
  style,
}) => {
  const isMongToi = id === 'mong_toi';
  const leafColor = isMongToi ? 'text-emerald-300 fill-emerald-400' : 'text-fuchsia-300 fill-fuchsia-400';
  const accentBorder = isMongToi ? 'border-emerald-300/80' : 'border-fuchsia-300/80';
  const accentGlow = isMongToi ? 'shadow-emerald-600/30' : 'shadow-fuchsia-600/30';

  if (isPlaced) {
    // Placed label state: proudly snapped to basket
    return (
      <div
        className={`relative inline-flex items-center gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl ${
          isMongToi ? 'wood-board-placed' : 'wood-board-purple'
        } text-white shadow-xl animate-pop-in border-2 sm:border-3 ${className}`}
        style={style}
      >
        <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 backdrop-blur-xs">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
        </div>
        <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-wider text-amber-50 drop-shadow-md select-none font-['Nunito',sans-serif]">
          {name}
        </span>
        <Leaf className={`w-4 h-4 sm:w-5 sm:h-5 ${leafColor} shrink-0`} />
      </div>
    );
  }

  return (
    <div
      onPointerDown={onPointerDown}
      onClick={onClick}
      style={style}
      className={`relative inline-flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl cursor-grab active:cursor-grabbing select-none touch-none transition-all duration-150 wood-board ${accentBorder} ${
        isDragging
          ? 'scale-110 shadow-2xl rotate-2 z-50 ring-4 ring-amber-300 opacity-95'
          : isSelected
          ? 'scale-105 shadow-xl ring-4 ring-yellow-400 -translate-y-1'
          : 'hover:scale-103 hover:-translate-y-0.5 shadow-lg active:scale-98'
      } ${className}`}
    >
      {/* Corner wooden screws / rivets */}
      <span className="absolute top-1.5 left-2 w-1.5 h-1.5 rounded-full bg-amber-900 border border-amber-300/60 opacity-80" />
      <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-amber-900 border border-amber-300/60 opacity-80" />
      <span className="absolute bottom-1.5 left-2 w-1.5 h-1.5 rounded-full bg-amber-900 border border-amber-300/60 opacity-80" />
      <span className="absolute bottom-1.5 right-2 w-1.5 h-1.5 rounded-full bg-amber-900 border border-amber-300/60 opacity-80" />

      {/* Grip / Touch affordance */}
      <div className="flex items-center justify-center text-amber-200/80">
        <GripHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>

      {/* Vegetable Name - Large, prominent uppercase Vietnamese letters */}
      <div className="flex items-center gap-2">
        <Leaf className={`w-5 h-5 sm:w-6 sm:h-6 ${leafColor} shrink-0 drop-shadow`} />
        <span className="font-black text-sm sm:text-base md:text-xl tracking-wide text-amber-100 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] select-none">
          {name}
        </span>
      </div>

      {/* Subtle indicator for kids */}
      <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-black/30 text-amber-200 border border-amber-300/30`}>
        Kéo bé ơi
      </span>
    </div>
  );
};

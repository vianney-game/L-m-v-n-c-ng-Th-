import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { VegetableId, BunnyEmotion, PlacedState } from '../types/game';
import {
  playWoodPick,
  playWoodSnap,
  playSuccessChime,
  playVictoryFanfare,
  playGentleWrong,
  speakVietnamese,
  hasVietnameseVoiceSupport,
} from '../utils/audio';
import { WoodenLabel } from './WoodenLabel';
import { SpeechBubble } from './SpeechBubble';
import { SparkleEffect } from './SparkleEffect';
import { VegetableModal } from './VegetableModal';

import MAIN_IMAGE from '../assets/images/garden_bunny_main_1792336808905.jpg';
import HAPPY_IMAGE from '../assets/images/garden_bunny_happy_1792336810535.jpg';
import SAD_IMAGE from '../assets/images/garden_bunny_sad_1792336811013.jpg';

const PUBLIC_MAIN_FALLBACK = '/assets/images/garden_bunny_main_1792336808905.jpg';
const PUBLIC_HAPPY_FALLBACK = '/assets/images/garden_bunny_happy_1792336810535.jpg';
const PUBLIC_SAD_FALLBACK = '/assets/images/garden_bunny_sad_1792336811013.jpg';

export const GardenGame: React.FC = () => {
  // Game states
  const [placed, setPlaced] = useState<PlacedState>({
    mong_toi: false,
    den_tim: false,
  });
  const [bunnyEmotion, setBunnyEmotion] = useState<BunnyEmotion>('NORMAL');
  const [speechText, setSpeechText] = useState<string>(
    'Con hãy kéo tên rau vào đúng giỏ nhé!'
  );
  const [speechTone, setSpeechTone] = useState<'normal' | 'happy' | 'encouraging' | 'celebrate'>('normal');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [noVoiceNotice, setNoVoiceNotice] = useState<boolean>(false);

  // Dragging & Interaction states
  const [activeDragId, setActiveDragId] = useState<VegetableId | null>(null);
  const [selectedLabelId, setSelectedLabelId] = useState<VegetableId | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredBasket, setHoveredBasket] = useState<'LEFT' | 'RIGHT' | null>(null);

  // Modals & UI states
  const [inspectVeg, setInspectVeg] = useState<VegetableId | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [recentSparkleBasket, setRecentSparkleBasket] = useState<'LEFT' | 'RIGHT' | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // Image source states with fallback and diagnostic support
  const [mainImgSrc, setMainImgSrc] = useState<string>(MAIN_IMAGE);
  const [happyImgSrc, setHappyImgSrc] = useState<string>(HAPPY_IMAGE);
  const [sadImgSrc, setSadImgSrc] = useState<string>(SAD_IMAGE);
  const [mainImageFailed, setMainImageFailed] = useState<boolean>(false);

  // DOM Refs
  const stageRef = useRef<HTMLDivElement>(null);
  const leftBasketRef = useRef<HTMLDivElement>(null);
  const rightBasketRef = useRef<HTMLDivElement>(null);
  const emotionTimeoutRef = useRef<number | null>(null);

  // Helper to trigger speech and fallback
  const triggerVoice = useCallback(
    (text: string) => {
      setSpeechText(text);
      if (voiceEnabled) {
        setIsSpeaking(true);
        const result = speakVietnamese(
          text,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
        if (!result.hasVietnameseVoice && result.spoken) {
          setNoVoiceNotice(true);
        }
      }
    },
    [voiceEnabled]
  );

  // Clear emotion timer on unmount
  useEffect(() => {
    return () => {
      if (emotionTimeoutRef.current) {
        window.clearTimeout(emotionTimeoutRef.current);
      }
    };
  }, []);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Replay speech
  const handleReplaySpeech = () => {
    if (soundEnabled) playWoodPick();
    triggerVoice(speechText);
  };

  // Process placing action
  const evaluatePlacement = useCallback(
    (labelId: VegetableId, targetBasket: 'LEFT' | 'RIGHT') => {
      // Giỏ trái: RAU MỒNG TƠI
      // Giỏ phải: RAU DỀN TÍM
      const isCorrect =
        (labelId === 'mong_toi' && targetBasket === 'LEFT') ||
        (labelId === 'den_tim' && targetBasket === 'RIGHT');

      if (isCorrect) {
        // Correct match!
        if (soundEnabled) {
          playWoodSnap();
        }

        const newPlaced = {
          ...placed,
          [labelId]: true,
        };
        setPlaced(newPlaced);
        setRecentSparkleBasket(targetBasket);
        setTimeout(() => setRecentSparkleBasket(null), 2500);

        const bothDone =
          (labelId === 'mong_toi' ? true : newPlaced.mong_toi) &&
          (labelId === 'den_tim' ? true : newPlaced.den_tim);

        if (bothDone) {
          // ALL CORRECT!
          setIsComplete(true);
          setBunnyEmotion('WINK');
          setSpeechTone('celebrate');
          if (soundEnabled) playVictoryFanfare();

          const celebrationQuote =
            'Chúc mừng bạn đã giúp mình phân loại rau chính xác nhé!';
          triggerVoice(celebrationQuote);

          // Keep happy winking celebration for ~3 seconds, then stay cheerful
          if (emotionTimeoutRef.current) clearTimeout(emotionTimeoutRef.current);
          emotionTimeoutRef.current = window.setTimeout(() => {
            setBunnyEmotion('HAPPY');
          }, 3500);
        } else {
          // One label correct
          setBunnyEmotion('HAPPY');
          setSpeechTone('happy');
          if (soundEnabled) playSuccessChime();

          const labelName = labelId === 'mong_toi' ? 'Rau Mồng Tơi' : 'Rau Dền Tím';
          const oneDoneQuote = `Giỏi quá! Bé đã đặt đúng ${labelName} rồi! Còn một giỏ nữa thôi nè!`;
          triggerVoice(oneDoneQuote);

          if (emotionTimeoutRef.current) clearTimeout(emotionTimeoutRef.current);
          emotionTimeoutRef.current = window.setTimeout(() => {
            setBunnyEmotion('NORMAL');
          }, 3200);
        }
      } else {
        // WRONG MATCH!
        setBunnyEmotion('SAD');
        setSpeechTone('encouraging');
        if (soundEnabled) playGentleWrong();

        const wrongQuote =
          'Bạn ơi, cố gắng lần nữa nhé, bạn chọn chưa chính xác rồi.';
        triggerVoice(wrongQuote);

        if (emotionTimeoutRef.current) clearTimeout(emotionTimeoutRef.current);
        emotionTimeoutRef.current = window.setTimeout(() => {
          setBunnyEmotion('NORMAL');
          setSpeechTone('normal');
        }, 3600);
      }

      // Reset selection
      setSelectedLabelId(null);
    },
    [placed, soundEnabled, triggerVoice]
  );

  // Pointer drag move & up listeners
  useEffect(() => {
    if (!activeDragId) return;

    const handlePointerMove = (e: PointerEvent) => {
      setDragPosition({ x: e.clientX, y: e.clientY });

      // Hit-test baskets
      let found: 'LEFT' | 'RIGHT' | null = null;
      if (leftBasketRef.current && rightBasketRef.current) {
        const leftRect = leftBasketRef.current.getBoundingClientRect();
        const rightRect = rightBasketRef.current.getBoundingClientRect();

        // Generous detection box
        const pad = 25;
        if (
          e.clientX >= leftRect.left - pad &&
          e.clientX <= leftRect.right + pad &&
          e.clientY >= leftRect.top - pad &&
          e.clientY <= leftRect.bottom + pad
        ) {
          found = 'LEFT';
        } else if (
          e.clientX >= rightRect.left - pad &&
          e.clientX <= rightRect.right + pad &&
          e.clientY >= rightRect.top - pad &&
          e.clientY <= rightRect.bottom + pad
        ) {
          found = 'RIGHT';
        }
      }
      setHoveredBasket(found);
    };

    const handlePointerUp = (e: PointerEvent) => {
      const currentDrag = activeDragId;
      let target: 'LEFT' | 'RIGHT' | null = null;

      if (leftBasketRef.current && rightBasketRef.current) {
        const leftRect = leftBasketRef.current.getBoundingClientRect();
        const rightRect = rightBasketRef.current.getBoundingClientRect();
        const pad = 35;

        if (
          e.clientX >= leftRect.left - pad &&
          e.clientX <= leftRect.right + pad &&
          e.clientY >= leftRect.top - pad &&
          e.clientY <= leftRect.bottom + pad
        ) {
          target = 'LEFT';
        } else if (
          e.clientX >= rightRect.left - pad &&
          e.clientX <= rightRect.right + pad &&
          e.clientY >= rightRect.top - pad &&
          e.clientY <= rightRect.bottom + pad
        ) {
          target = 'RIGHT';
        }
      }

      if (target && currentDrag) {
        evaluatePlacement(currentDrag, target);
      }

      setActiveDragId(null);
      setDragPosition(null);
      setHoveredBasket(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [activeDragId, evaluatePlacement]);

  // Start dragging a label
  const handleStartDrag = (id: VegetableId, e: React.PointerEvent<HTMLDivElement>) => {
    if (placed[id]) return;
    if (soundEnabled) playWoodPick();
    setActiveDragId(id);
    setSelectedLabelId(id);
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  // Tap-to-select alternative for young toddlers on touch screens
  const handleLabelClick = (id: VegetableId) => {
    if (placed[id]) return;
    if (soundEnabled) playWoodPick();
    setSelectedLabelId((prev) => (prev === id ? null : id));
  };

  // Click on a basket
  const handleBasketClick = (basket: 'LEFT' | 'RIGHT') => {
    if (selectedLabelId) {
      evaluatePlacement(selectedLabelId, basket);
    }
  };

  // Reset / Play Again
  const handleReset = () => {
    if (soundEnabled) playWoodPick();
    if (emotionTimeoutRef.current) clearTimeout(emotionTimeoutRef.current);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPlaced({
      mong_toi: false,
      den_tim: false,
    });
    setBunnyEmotion('NORMAL');
    setIsComplete(false);
    setSelectedLabelId(null);
    setActiveDragId(null);
    setSpeechTone('normal');
    const welcome = 'Con hãy kéo tên rau vào đúng giỏ nhé!';
    triggerVoice(welcome);
  };

  return (
    <div className="relative w-full h-screen max-h-screen overflow-hidden bg-gradient-to-b from-amber-100 via-sky-50 to-amber-100 flex flex-col items-center justify-between font-['Nunito','Be_Vietnam_Pro',sans-serif]">
      {/* Top Application Bar */}
      <header className="w-full shrink-0 z-20 flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-white/90 backdrop-blur-md border-b-2 border-amber-200 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl filter drop-shadow-sm">🥕</span>
          <div>
            <h1 className="text-base sm:text-xl md:text-2xl font-black text-amber-950 tracking-wide font-['Be_Vietnam_Pro','Nunito',sans-serif] leading-tight">
              LÀM VƯỜN CÙNG THỎ
            </h1>
            <p className="text-[11px] sm:text-xs text-amber-800 font-bold hidden sm:block">
              Con hãy kéo tên rau vào đúng giỏ nhé!
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound Effect Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95 border ${
              soundEnabled
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                : 'bg-slate-100 text-slate-400 border-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{soundEnabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt'}</span>
          </button>

          {/* Fullscreen button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Toàn màn hình"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden md:inline">{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
          </button>

          {/* Reset / Chơi lại Button */}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer transition-all active:scale-95 border border-amber-300"
          >
            <RotateCcw className="w-4 h-4" />
            <span>CHƠI LẠI</span>
          </button>
        </div>
      </header>

      {/* Main 16:9 Interactive Stage Container */}
      <main className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center p-1 sm:p-3 overflow-hidden">
        <div
          ref={stageRef}
          className="relative w-full aspect-16/9 max-h-[82vh] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300/80 bg-amber-900/10"
        >
          {/* Main Background Image - 3D Bunny with baskets */}
          <img
            src={mainImgSrc}
            alt="Bạn Thỏ trong vườn rau cầm hai giỏ mồng tơi và dền tím"
            referrerPolicy="no-referrer"
            onError={() => {
              console.warn("Primary MAIN_IMAGE failed, attempting public fallback...");
              if (mainImgSrc !== PUBLIC_MAIN_FALLBACK) {
                setMainImgSrc(PUBLIC_MAIN_FALLBACK);
              } else {
                setMainImageFailed(true);
              }
            }}
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          />

          {/* Diagnostic alert in development if image fails to load */}
          {mainImageFailed && (
            <div className="absolute inset-4 z-45 flex flex-col items-center justify-center p-6 bg-white/95 rounded-2xl border-4 border-dashed border-amber-500 shadow-xl text-center">
              <span className="text-4xl mb-2">📸</span>
              <h3 className="text-lg font-black text-amber-950 mb-1 font-['Be_Vietnam_Pro','Nunito',sans-serif]">
                Thông Báo Chẩn Đoán: Không Thể Tải Hình Ảnh Nền
              </h3>
              <p className="text-xs text-slate-600 max-w-md mb-3 leading-relaxed">
                Đường dẫn hình ảnh không tải được:
                <br />
                <span className="font-mono text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded mt-1 inline-block">
                  src/assets/images/garden_bunny_main_1792336808905.jpg
                </span>
              </p>
              <div className="text-xs text-slate-700 bg-amber-50 p-3 rounded-xl border border-amber-200 text-left max-w-lg leading-relaxed space-y-1">
                <p className="font-bold text-amber-900">Cách khắc phục:</p>
                <p>1. Nếu bạn có tệp ảnh gốc, vui lòng tải ảnh vào thư mục <code className="font-mono text-amber-900 bg-white px-1 rounded">src/assets/images/</code> hoặc <code className="font-mono text-amber-900 bg-white px-1 rounded">public/assets/images/</code> qua trình quản lý tệp của dự án.</p>
                <p>2. Đảm bảo tên tệp trùng khớp với đường dẫn cấu hình trong mã nguồn.</p>
              </div>
            </div>
          )}

          {/* Bunny Emotion Morph / Reaction Overlays */}
          {bunnyEmotion === 'HAPPY' || bunnyEmotion === 'WINK' ? (
            <div className="absolute top-[4%] left-[34%] w-[32%] aspect-square rounded-full overflow-hidden shadow-2xl border-4 border-amber-300 animate-pop-in z-25 bg-amber-100">
              <img
                src={happyImgSrc}
                alt="Bạn Thỏ nháy mắt vui mừng"
                referrerPolicy="no-referrer"
                onError={() => {
                  if (happyImgSrc !== PUBLIC_HAPPY_FALLBACK) {
                    setHappyImgSrc(PUBLIC_HAPPY_FALLBACK);
                  }
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 ring-4 ring-amber-400/50 rounded-full animate-ping pointer-events-none" />
            </div>
          ) : bunnyEmotion === 'SAD' ? (
            <div className="absolute top-[4%] left-[34%] w-[32%] aspect-square rounded-full overflow-hidden shadow-2xl border-4 border-sky-300 animate-pop-in z-25 bg-amber-100">
              <img
                src={sadImgSrc}
                alt="Bạn Thỏ buồn hiu động viên bé"
                referrerPolicy="no-referrer"
                onError={() => {
                  if (sadImgSrc !== PUBLIC_SAD_FALLBACK) {
                    setSadImgSrc(PUBLIC_SAD_FALLBACK);
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}

          {/* Sparkles / Confetti when winning */}
          <SparkleEffect active={isComplete} type="victory" />

          {/* Speech Bubble floating near Bunny's top */}
          <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            <SpeechBubble
              message={speechText}
              isSpeaking={isSpeaking}
              onReplaySpeech={handleReplaySpeech}
              tone={speechTone}
            />
          </div>

          {/* ===================== DROP ZONE LEFT: RAU MỒNG TƠI ===================== */}
          <div
            ref={leftBasketRef}
            onClick={() => handleBasketClick('LEFT')}
            className={`absolute top-[48%] left-[16%] sm:left-[21%] w-[28%] sm:w-[24%] h-[38%] rounded-3xl border-3 border-dashed transition-all duration-200 flex flex-col items-center justify-between p-2 cursor-pointer z-20 ${
              placed.mong_toi
                ? 'border-emerald-400 bg-emerald-500/10'
                : hoveredBasket === 'LEFT'
                ? 'border-yellow-400 bg-yellow-300/30 ring-4 ring-yellow-400/60 scale-103 animate-pulse-border'
                : selectedLabelId === 'mong_toi'
                ? 'border-amber-300 bg-amber-400/20 ring-2 ring-amber-400 animate-bounce'
                : 'border-white/60 bg-black/10 hover:border-amber-300 hover:bg-white/10'
            }`}
          >
            {/* Sparkle effect on left basket */}
            <SparkleEffect active={recentSparkleBasket === 'LEFT'} type="basket" />

            {/* Header info badge */}
            <div className="w-full flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-emerald-600/90 text-white shadow-sm">
                Giỏ Trái: Rau Xanh
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInspectVeg('mong_toi');
                }}
                title="Bé xem kỹ rau mồng tơi"
                className="p-1 rounded-full bg-white/80 hover:bg-white text-emerald-800 shadow-sm"
              >
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Center cue or snapped label */}
            <div className="flex-1 w-full flex items-end justify-center pb-1">
              {placed.mong_toi ? (
                <div className="w-full flex justify-center animate-pop-in">
                  <WoodenLabel
                    id="mong_toi"
                    name="RAU MỒNG TƠI"
                    isPlaced={true}
                    placedBasket="LEFT"
                    className="w-full justify-center text-center shadow-lg"
                  />
                </div>
              ) : (
                <div className="text-center bg-black/40 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/40">
                  <span className="text-[11px] sm:text-xs md:text-sm font-extrabold text-white drop-shadow">
                    {hoveredBasket === 'LEFT' ? '✨ Thả nhãn vào đây!' : '👇 Giỏ rau màu xanh'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ===================== DROP ZONE RIGHT: RAU DỀN TÍM ===================== */}
          <div
            ref={rightBasketRef}
            onClick={() => handleBasketClick('RIGHT')}
            className={`absolute top-[48%] right-[16%] sm:right-[21%] w-[28%] sm:w-[24%] h-[38%] rounded-3xl border-3 border-dashed transition-all duration-200 flex flex-col items-center justify-between p-2 cursor-pointer z-20 ${
              placed.den_tim
                ? 'border-fuchsia-400 bg-fuchsia-500/10'
                : hoveredBasket === 'RIGHT'
                ? 'border-yellow-400 bg-yellow-300/30 ring-4 ring-yellow-400/60 scale-103 animate-pulse-border'
                : selectedLabelId === 'den_tim'
                ? 'border-amber-300 bg-amber-400/20 ring-2 ring-amber-400 animate-bounce'
                : 'border-white/60 bg-black/10 hover:border-amber-300 hover:bg-white/10'
            }`}
          >
            {/* Sparkle effect on right basket */}
            <SparkleEffect active={recentSparkleBasket === 'RIGHT'} type="basket" />

            {/* Header info badge */}
            <div className="w-full flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-fuchsia-700/90 text-white shadow-sm">
                Giỏ Phải: Rau Tím Đỏ
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInspectVeg('den_tim');
                }}
                title="Bé xem kỹ rau dền tím"
                className="p-1 rounded-full bg-white/80 hover:bg-white text-fuchsia-900 shadow-sm"
              >
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Center cue or snapped label */}
            <div className="flex-1 w-full flex items-end justify-center pb-1">
              {placed.den_tim ? (
                <div className="w-full flex justify-center animate-pop-in">
                  <WoodenLabel
                    id="den_tim"
                    name="RAU DỀN TÍM"
                    isPlaced={true}
                    placedBasket="RIGHT"
                    className="w-full justify-center text-center shadow-lg"
                  />
                </div>
              ) : (
                <div className="text-center bg-black/40 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/40">
                  <span className="text-[11px] sm:text-xs md:text-sm font-extrabold text-white drop-shadow">
                    {hoveredBasket === 'RIGHT' ? '✨ Thả nhãn vào đây!' : '👇 Giỏ rau lá tím đỏ'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Victory celebratory banner inside stage when both correct */}
          {isComplete && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-35 animate-pop-in">
              <div className="flex items-center gap-3 px-6 py-2.5 bg-amber-400/95 border-3 border-amber-100 rounded-full shadow-2xl text-amber-950 font-black text-sm sm:text-lg">
                <Sparkles className="w-6 h-6 text-yellow-100 animate-spin" />
                <span>BÉ GIỎI QUÁ! CẢ HAI GIỎ ĐỀU ĐÚNG RỒI! ⭐⭐⭐</span>
                <Sparkles className="w-6 h-6 text-yellow-100 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Tray: Draggable Wooden Plaque Labels */}
      <footer className="w-full shrink-0 z-20 py-2 sm:py-3 px-4 bg-amber-950/90 border-t-4 border-amber-700 shadow-2xl backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 text-amber-200 text-xs sm:text-sm font-bold">
            <span className="text-lg">👇</span>
            <span>Con hãy kéo tên rau vào đúng giỏ nhé!</span>
          </div>

          {/* Container for unplaced wooden labels */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto">
            {/* Label 1: Rau Mồng Tơi */}
            {!placed.mong_toi ? (
              <WoodenLabel
                id="mong_toi"
                name="RAU MỒNG TƠI"
                isPlaced={false}
                isSelected={selectedLabelId === 'mong_toi'}
                isDragging={activeDragId === 'mong_toi'}
                onPointerDown={(e) => handleStartDrag('mong_toi', e)}
                onClick={() => handleLabelClick('mong_toi')}
              />
            ) : null}

            {/* Label 2: Rau Dền Tím */}
            {!placed.den_tim ? (
              <WoodenLabel
                id="den_tim"
                name="RAU DỀN TÍM"
                isPlaced={false}
                isSelected={selectedLabelId === 'den_tim'}
                isDragging={activeDragId === 'den_tim'}
                onPointerDown={(e) => handleStartDrag('den_tim', e)}
                onClick={() => handleLabelClick('den_tim')}
              />
            ) : null}

            {/* When all placed, show Play Again Button in tray */}
            {placed.mong_toi && placed.den_tim ? (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-base shadow-xl border-2 border-emerald-300 cursor-pointer transition-transform active:scale-95 animate-bounce"
              >
                <RotateCcw className="w-5 h-5" />
                <span>CHƠI LẠI</span>
              </button>
            ) : null}
          </div>
        </div>
      </footer>

      {/* Gentle toast notification if device has no Vietnamese voice installed */}
      {noVoiceNotice && (
        <div className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] p-3.5 bg-amber-950/95 text-amber-100 rounded-2xl shadow-2xl border-2 border-amber-400/60 backdrop-blur-md flex items-center justify-between gap-3 text-xs sm:text-sm animate-pop-in">
          <div className="flex items-center gap-2.5">
            <span className="text-xl shrink-0">💬</span>
            <span className="font-semibold leading-snug">
              Thiết bị chưa có sẵn giọng đọc tiếng Việt, lời thoại hiển thị đầy đủ trên màn hình nhé!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setNoVoiceNotice(false)}
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 active:scale-95 text-white rounded-xl font-bold shrink-0 text-xs cursor-pointer shadow-sm"
          >
            Đã hiểu
          </button>
        </div>
      )}

      {/* Floating Drag Avatar following cursor / finger */}
      {activeDragId && dragPosition && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{
            left: dragPosition.x,
            top: dragPosition.y,
          }}
        >
          <WoodenLabel
            id={activeDragId}
            name={activeDragId === 'mong_toi' ? 'RAU MỒNG TƠI' : 'RAU DỀN TÍM'}
            isPlaced={false}
            isDragging={true}
          />
        </div>
      )}

      {/* Detail inspection modal */}
      <VegetableModal vegetable={inspectVeg} onClose={() => setInspectVeg(null)} />
    </div>
  );
};

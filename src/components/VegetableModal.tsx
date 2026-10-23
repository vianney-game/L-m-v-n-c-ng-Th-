import React, { useState, useEffect } from 'react';
import { X, Sparkles, BookOpen } from 'lucide-react';
import { VegetableId } from '../types/game';
import MONG_TOI_IMAGE from '../assets/images/basket_mongtoi_green_1792336810906.jpg';
import DEN_TIM_IMAGE from '../assets/images/basket_dentim_purple_1792336811384.jpg';

const PUBLIC_MONG_TOI_FALLBACK = '/assets/images/basket_mongtoi_green_1792336810906.jpg';
const PUBLIC_DEN_TIM_FALLBACK = '/assets/images/basket_dentim_purple_1792336811384.jpg';

interface VegetableModalProps {
  vegetable: VegetableId | null;
  onClose: () => void;
}

export const VegetableModal: React.FC<VegetableModalProps> = ({ vegetable, onClose }) => {
  if (!vegetable) return null;

  const isMongToi = vegetable === 'mong_toi';
  const primaryImage = isMongToi ? MONG_TOI_IMAGE : DEN_TIM_IMAGE;
  const fallbackImage = isMongToi ? PUBLIC_MONG_TOI_FALLBACK : PUBLIC_DEN_TIM_FALLBACK;

  const [currentImg, setCurrentImg] = useState<string>(primaryImage);
  const [loadError, setLoadError] = useState<boolean>(false);

  useEffect(() => {
    setCurrentImg(isMongToi ? MONG_TOI_IMAGE : DEN_TIM_IMAGE);
    setLoadError(false);
  }, [vegetable, isMongToi]);

  const details = isMongToi
    ? {
        title: 'RAU MỒNG TƠI',
        sub: 'Loại rau lá xanh tươi mát trong vườn bạn Thỏ',
        badgeColor: 'bg-emerald-600 text-white',
        borderCol: 'border-emerald-300',
        traits: [
          'Lá hình tim tròn, dày và bóng mượt màu xanh lục tràn đầy sức sống.',
          'Thân leo mập mạp, mọng nước, khi chạm vào có cảm giác mềm mại mát lành.',
          'Món ngon của bé: Canh cua mồng tơi, canh rau mồng tơi nấu tôm hoặc thịt băm giải nhiệt mùa hè rất ngon miệng!',
        ],
        tip: 'Giàu vitamin A và chất xơ giúp mắt sáng và tiêu hóa khỏe mạnh!',
      }
    : {
        title: 'RAU DỀN TÍM (DỀN ĐỎ)',
        sub: 'Loại rau lá tím đỏ rực rỡ giàu dinh dưỡng',
        badgeColor: 'bg-fuchsia-700 text-white',
        borderCol: 'border-fuchsia-300',
        traits: [
          'Lá màu đỏ tía và tím thẫm rất bắt mắt, viền lá mềm mại với gân tía tươi tắn.',
          'Nước canh rau dền có màu hồng đỏ tự nhiên vô cùng đẹp mắt, các bé rất thích.',
          'Món ngon của bé: Nấu canh tôm tươi, canh thịt nạc hoặc luộc chấm tương ngọt.',
        ],
        tip: 'Rất giàu canxi và sắt giúp xương chắc khỏe và tăng cường sức đề kháng!',
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
      <div
        className={`relative w-full max-w-lg bg-amber-50 rounded-3xl border-4 ${details.borderCol} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-100/90 border-b-2 border-amber-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-700" />
            <h3 className="text-xl font-extrabold text-amber-950 tracking-wide font-['Be_Vietnam_Pro','Nunito',sans-serif]">
              Khám Phá Cùng Bé
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white hover:bg-amber-200 text-amber-900 flex items-center justify-center shadow-sm cursor-pointer transition-transform active:scale-90"
            aria-label="Đóng bảng khám phá"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Vegetable Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-inner border-2 border-amber-200/80 aspect-4/3 max-h-56 mx-auto">
            {!loadError ? (
              <img
                src={currentImg}
                alt={details.title}
                referrerPolicy="no-referrer"
                onError={() => {
                  if (currentImg !== fallbackImage) {
                    setCurrentImg(fallbackImage);
                  } else {
                    setLoadError(true);
                  }
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-amber-100 text-center text-amber-900">
                <span className="text-2xl mb-1">🌿</span>
                <span className="text-xs font-bold">Không thể tải ảnh rau chi tiết</span>
                <span className="text-[10px] text-slate-500 font-mono mt-1">{fallbackImage}</span>
              </div>
            )}
            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1.5 rounded-full text-xs font-black shadow-md ${details.badgeColor}`}>
                {details.title}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xl font-black text-slate-800 text-center">{details.title}</h4>
            <p className="text-xs sm:text-sm text-slate-600 text-center font-medium">{details.sub}</p>
          </div>

          {/* Description points */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-500" /> Đặc điểm nhận biết:
            </div>
            <ul className="text-xs sm:text-sm text-slate-700 space-y-2 leading-relaxed">
              {details.traits.map((t, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">✦</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fun fact badge */}
          <div className="rounded-2xl p-3.5 bg-amber-100/80 border border-amber-300 text-amber-950 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <span className="text-lg">🌿</span>
            <span>{details.tip}</span>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-base shadow-md cursor-pointer transition-transform active:scale-95"
          >
            Bé Đã Hiểu Rồi! Tiếp Tục Chơi Nào
          </button>
        </div>
      </div>
    </div>
  );
};

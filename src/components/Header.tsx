import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  muted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({ muted, onToggleMute }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <header
      id="main-header"
      className="relative text-white pt-5 pb-20 sm:pb-24 px-5 text-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #042f2e 0%, #134e4a 50%, #0e7490 100%)',
      }}
    >
      {/* Top utility control */}
      <div className="relative z-10 max-w-5xl mx-auto flex items-center justify-end gap-4 mb-3">
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'تشغيل المؤثرات الصوتية' : 'كتم المؤثرات الصوتية'}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 border border-white/20"
        >
          {muted ? (
            <>
              <VolumeX className="w-4 h-4" aria-hidden="true" />
              <span>الصوت مكتوم</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" aria-hidden="true" />
              <span>الصوت مفعّل</span>
            </>
          )}
        </button>
      </div>

      {/* Main Header Lockup */}
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
        {!imgError ? (
          <img
            src="/src/assets/images/header_logo_1794585871630.jpg"
            alt="شعار منصة الأستاذ أحمد نورالدين للدراسات الاجتماعية"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl border-4 border-amber-400 shadow-2xl bg-white object-contain shrink-0"
          />
        ) : (
          <div
            aria-hidden="true"
            className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl border-4 border-amber-400 shadow-2xl bg-white flex items-center justify-center shrink-0"
          >
            <svg viewBox="0 0 100 100" className="w-28 h-28">
              <circle cx="50" cy="50" r="40" fill="#134e4a" stroke="#f59e0b" strokeWidth="4" />
              <polygon points="50,15 58,42 85,50 58,58 50,85 42,58 15,50 42,42" fill="#fbbf24" />
            </svg>
          </div>
        )}

        <div className="flex flex-col items-center text-center max-w-2xl">
          <div className="flex items-center gap-2.5 text-lg sm:text-2xl font-bold text-[#ccfbf1] mb-1">
            <span>درس</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2dd4bf"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span>لعبة</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-md mb-3 leading-tight text-balance">
            مع الأستاذ <span className="text-[#5eead4]">أَحْمَد نُورالدِّين</span>
          </h1>

          <h2 className="text-base sm:text-xl font-bold text-[#f0fdfa] leading-relaxed text-balance">
            الصَّفُّ الثَّالِثُ الإِعْدَادِيُّ - الْوَحْدَةُ الأُولَى - الدَّرْسُ الأَوَّلُ: مَوْقِعُ وَمَظَاهِرُ سَطْحِ قَارَّاتِ العَالَمِ الجَدِيدِ
          </h2>
        </div>
      </div>

      {/* Curved Bottom Wave */}
      <svg
        className="absolute bottom-[-1px] left-0 w-full h-10 sm:h-14 pointer-events-none"
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="#ecfeff"
          d="M0,32 C320,96 1120,0 1440,56 L1440,90 L0,90 Z"
        />
      </svg>
    </header>
  );
};

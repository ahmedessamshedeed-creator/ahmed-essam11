import React, { useEffect } from 'react';

interface WelcomeScreenProps {
  visible: boolean;
  onEnter: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ visible, onEnter }) => {
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onEnter();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [visible, onEnter]);

  if (!visible) return null;

  return (
    <div
      id="welcome-screen"
      role="dialog"
      aria-modal="true"
      aria-label="شاشة الترحيب"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-5 py-8 text-white"
      style={{
        background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 52%, #991b1b 100%)',
      }}
    >
      <div className="max-w-xl w-full flex flex-col items-center gap-6">
        <p className="text-red-100 text-base sm:text-lg font-bold tracking-wide">
          منصة الدراسات الاجتماعية التفاعلية · الصف الثالث الإعدادي
        </p>

        <button
          type="button"
          data-start="true"
          onClick={onEnter}
          className="bg-white text-[#b91c1c] border-none px-8 py-4 sm:px-10 sm:py-5 rounded-full text-xl sm:text-2xl font-black cursor-pointer shadow-2xl transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-4 focus-visible:outline-amber-300"
        >
          اضغط لدخول إلى صفحة المبرمج أحمد عصام
        </button>

        <p className="text-lg font-bold text-[#fecaca]">
          برمجة وتطوير: المبرمج أحمد عصام
        </p>
      </div>
    </div>
  );
};

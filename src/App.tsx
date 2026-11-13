import React, { useEffect, useState } from 'react';
import {
  ListChecks,
  CheckCheck,
  Sparkles,
  Crosshair,
  Zap,
  MapPin,
  BookOpen,
  MessageCircle,
} from 'lucide-react';
import { GAME_MODES } from './data/curriculum';
import { GameModeId, GameModeMeta, PlayStyle } from './types/game';
import { soundFx } from './utils/sound';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ModeSelectModal } from './components/ModeSelectModal';
import { LessonAtlasModal } from './components/LessonAtlasModal';
import { SoloGameScreen } from './components/SoloGameScreen';
import { DuelGameScreen } from './components/DuelGameScreen';

const MODE_ICONS: Record<GameModeId, React.ReactNode> = {
  mcq: <ListChecks className="w-9 h-9 text-[#134e4a]" aria-hidden="true" />,
  tf: <CheckCheck className="w-9 h-9 text-[#134e4a]" aria-hidden="true" />,
  bubbles: <Sparkles className="w-9 h-9 text-[#134e4a]" aria-hidden="true" />,
  shooting: <Crosshair className="w-9 h-9 text-[#134e4a]" aria-hidden="true" />,
  genius: <Zap className="w-9 h-9 text-[#134e4a]" aria-hidden="true" />,
  map: <MapPin className="w-9 h-9 text-[#134e4a]" aria-hidden="true" />,
};

export default function App() {
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const params = new URLSearchParams(window.location.search);
    return params.get('autostart') !== '1';
  });

  const [muted, setMuted] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<GameModeMeta | null>(null);
  const [activeSession, setActiveSession] = useState<{
    mode: GameModeMeta;
    style: PlayStyle;
    team0Name: string;
    team1Name: string;
  } | null>(null);

  useEffect(() => {
    if (showWelcome) {
      document.body.dataset.state = 'title';
    } else if (!activeSession) {
      document.body.dataset.state = 'menu';
    } else if (activeSession.style === 'duel') {
      document.body.dataset.state = 'duel';
    } else {
      document.body.dataset.state = 'playing';
    }
  }, [showWelcome, activeSession]);

  const handleEnterSite = () => {
    soundFx.play('click');
    setShowWelcome(false);
  };

  const handleToggleMute = () => {
    const nextMuted = soundFx.toggleMute();
    setMuted(nextMuted);
    if (!nextMuted) {
      soundFx.play('click');
    }
  };

  const handleStartGame = (
    style: PlayStyle,
    team0Name: string,
    team1Name: string
  ) => {
    if (!pendingMode) return;
    soundFx.play('click');
    setActiveSession({
      mode: pendingMode,
      style,
      team0Name,
      team1Name,
    });
    setPendingMode(null);
  };

  const whatsappContactText = encodeURIComponent(
    'السلام عليكم، أستفسر عن درس موقع ومظاهر سطح قارات العالم الجديد - الصف الثالث الإعدادي.'
  );

  return (
    <div className="min-h-screen flex flex-col">
      <WelcomeScreen visible={showWelcome} onEnter={handleEnterSite} />

      {!activeSession && (
        <Header muted={muted} onToggleMute={handleToggleMute} />
      )}

      {!activeSession ? (
        <main id="home-screen" className="flex-1 px-4 sm:px-6 pt-4 pb-16 max-w-5xl w-full mx-auto">
          {/* Quick Lesson Intro Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 mb-7 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-right">
              <h3 className="text-lg sm:text-xl font-black text-[#134e4a] text-balance">
                اختر التحدي المناسب أو راجع الدرس أولاً
              </h3>
              <p className="text-sm text-slate-600 font-semibold mt-0.5">
                تشمل الألعاب: أمريكا الشمالية · أمريكا الجنوبية · أستراليا (الأوقيانوسية) · القارة القطبية الجنوبية
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFx.play('click');
                setLessonOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-b from-[#0d9488] to-[#134e4a] text-white font-extrabold text-sm sm:text-base cursor-pointer shadow-md hover:brightness-110 whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              <span>ملخص الدرس والخرائط</span>
            </button>
          </div>

          {/* 6 Game Mode Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAME_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  soundFx.play('click');
                  setPendingMode(mode);
                }}
                className="group bg-white rounded-2xl p-7 text-center shadow-md hover:shadow-xl border-2 border-transparent hover:border-[#0d9488]/40 transition-all duration-200 hover:-translate-y-1.5 cursor-pointer flex flex-col items-center relative overflow-hidden"
              >
                <span className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ccfbf1] to-[#99f6e4] flex items-center justify-center mb-4 shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  {MODE_ICONS[mode.id]}
                </span>
                <h3 className="text-xl font-black text-slate-800 mb-2">{mode.title}</h3>
                <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                  {mode.subtitle}
                </p>
                <span className="mt-4 text-xs font-extrabold text-[#0f766e]">
                  {mode.questionCount} أسئلة · لعب فردي أو فريقين
                </span>
              </button>
            ))}
          </div>
        </main>
      ) : activeSession.style === 'solo' ? (
        <SoloGameScreen
          mode={activeSession.mode}
          muted={muted}
          onToggleMute={handleToggleMute}
          onOpenLesson={() => {
            soundFx.play('click');
            setLessonOpen(true);
          }}
          onBack={() => setActiveSession(null)}
        />
      ) : (
        <DuelGameScreen
          mode={activeSession.mode}
          team0Name={activeSession.team0Name}
          team1Name={activeSession.team1Name}
          onBack={() => setActiveSession(null)}
        />
      )}

      <Footer />

      {/* Floating WhatsApp Link */}
      {!activeSession && !showWelcome && (
        <a
          href={`https://wa.me/?text=${whatsappContactText}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="مشاركة الدرس أو التواصل عبر واتساب"
          className="fixed bottom-5 left-5 w-14 h-14 rounded-full bg-[#25d366] hover:bg-[#1da851] text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-30"
        >
          <MessageCircle className="w-7 h-7" aria-hidden="true" />
        </a>
      )}

      <ModeSelectModal
        mode={pendingMode}
        onClose={() => setPendingMode(null)}
        onStart={handleStartGame}
      />

      <LessonAtlasModal
        open={lessonOpen}
        onClose={() => setLessonOpen(false)}
      />
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Share2,
  ZoomIn,
  ZoomOut,
  Trophy,
  Timer,
  Crosshair,
  Copy,
  Check,
  Volume2,
  VolumeX,
  BookOpen,
} from 'lucide-react';
import {
  BUBBLE_QUESTIONS,
  GENIUS_QUESTIONS,
  MAP_QUESTIONS,
  MCQ_QUESTIONS,
  SHOOTING_QUESTIONS,
  TF_QUESTIONS,
} from '../data/curriculum';
import {
  ChoiceQuestion,
  GameModeMeta,
  MapQuestion,
  MistakeRecord,
  TfQuestion,
} from '../types/game';
import {
  buildWhatsappShareUrl,
  computeScorePercentage,
  computeTimerPercent,
  getPerformanceFeedback,
  shuffleArray,
  validateShareName,
} from '../utils/gameLogic';
import { soundFx } from '../utils/sound';
import { ContinentMapSvg } from './ContinentMapSvg';

interface SoloGameScreenProps {
  mode: GameModeMeta;
  muted: boolean;
  onToggleMute: () => void;
  onOpenLesson: () => void;
  onBack: () => void;
}

type SoloQuestion =
  | { kind: 'choice'; data: ChoiceQuestion }
  | { kind: 'tf'; data: TfQuestion }
  | { kind: 'map'; data: MapQuestion };

const GENIUS_DURATION_MS = 12000;

export const SoloGameScreen: React.FC<SoloGameScreenProps> = ({
  mode,
  muted,
  onToggleMute,
  onOpenLesson,
  onBack,
}) => {
  const buildDeck = useCallback((): SoloQuestion[] => {
    switch (mode.id) {
      case 'mcq':
        return shuffleArray(MCQ_QUESTIONS)
          .slice(0, mode.questionCount)
          .map((data) => ({ kind: 'choice', data }));
      case 'bubbles':
        return shuffleArray(BUBBLE_QUESTIONS)
          .slice(0, mode.questionCount)
          .map((data) => ({ kind: 'choice', data }));
      case 'shooting':
        return shuffleArray(SHOOTING_QUESTIONS)
          .slice(0, mode.questionCount)
          .map((data) => ({ kind: 'choice', data }));
      case 'genius':
        return shuffleArray(GENIUS_QUESTIONS)
          .slice(0, mode.questionCount)
          .map((data) => ({ kind: 'choice', data }));
      case 'tf':
        return shuffleArray(TF_QUESTIONS)
          .slice(0, mode.questionCount)
          .map((data) => ({ kind: 'tf', data }));
      case 'map':
        return shuffleArray(MAP_QUESTIONS)
          .slice(0, mode.questionCount)
          .map((data) => ({ kind: 'map', data }));
    }
  }, [mode.id, mode.questionCount]);

  const [deck, setDeck] = useState<SoloQuestion[]>(() => buildDeck());
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [answered, setAnswered] = useState<{
    chosenIndex: number;
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [shaking, setShaking] = useState(false);
  const [finished, setFinished] = useState(false);
  const [mapZoomed, setMapZoomed] = useState(false);

  // Genius timer
  const [remainingMs, setRemainingMs] = useState(GENIUS_DURATION_MS);
  const lastTickSecRef = useRef<number>(12);

  // Share state
  const [studentName, setStudentName] = useState('');
  const [shareError, setShareError] = useState('');
  const [verifiedUrl, setVerifiedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Confetti pieces
  const [confetti, setConfetti] = useState<
    Array<{ id: number; left: number; color: string; duration: number; delay: number }>
  >([]);

  // Refs for smooth 60fps floating/moving targets in bubbles & shooting modes
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const current = deck[index];

  // Update body dataset state for testability
  useEffect(() => {
    document.body.dataset.state = finished ? 'results' : 'playing';
  }, [finished]);

  // Reset per-question state
  useEffect(() => {
    setRemainingMs(GENIUS_DURATION_MS);
    lastTickSecRef.current = 12;
  }, [index, deck]);

  // Trigger confetti on finishing with >= 70%
  useEffect(() => {
    if (!finished) {
      setConfetti([]);
      return;
    }
    const pct = computeScorePercentage(score, deck.length);
    const feedback = getPerformanceFeedback(pct);
    if (feedback.celebrate) {
      soundFx.play('win');
      const colors = ['#0d9488', '#f59e0b', '#10b981', '#0ea5e9', '#ef4444'];
      setConfetti(
        Array.from({ length: 42 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          color: colors[i % colors.length],
          duration: 2.2 + Math.random() * 1.8,
          delay: Math.random() * 0.6,
        }))
      );
    }
  }, [finished, score, deck.length]);

  const handleAnswerChoice = useCallback(
    (chosenIndex: number, timedOut = false) => {
      if (answered || finished || !current) return;

      if (current.kind === 'choice' || current.kind === 'map') {
        const q = current.data;
        const isCorrect = !timedOut && chosenIndex === q.correctIndex;

        if (isCorrect) {
          soundFx.play(mode.id === 'bubbles' || mode.id === 'shooting' ? 'pop' : 'correct');
          setScore((s) => s + 1);
          setAnswered({
            chosenIndex,
            isCorrect: true,
            message: `أحسنت! ${q.explanation}`,
          });
        } else {
          soundFx.play('wrong');
          setShaking(true);
          setTimeout(() => setShaking(false), 500);
          const chosenLabel = timedOut ? 'انتهى الوقت' : q.options[chosenIndex] ?? 'غير محدد';
          const correctLabel = q.options[q.correctIndex];
          setMistakes((prev) => [
            ...prev,
            {
              question: q.question,
              chosenAnswer: chosenLabel,
              correctAnswer: correctLabel,
              note: q.explanation,
            },
          ]);
          setAnswered({
            chosenIndex,
            isCorrect: false,
            message: timedOut
              ? `انتهى الوقت! الإجابة الصحيحة هي: ${correctLabel}`
              : `إجابة غير صحيحة. ${q.explanation}`,
          });
        }
      } else if (current.kind === 'tf') {
        const q = current.data;
        const pickedTrue = chosenIndex === 0;
        const isCorrect = !timedOut && pickedTrue === q.isTrue;
        const correctLabel = q.isTrue ? 'صح ✓' : 'خطأ ✗';
        const chosenLabel = timedOut ? 'انتهى الوقت' : pickedTrue ? 'صح ✓' : 'خطأ ✗';

        if (isCorrect) {
          soundFx.play('correct');
          setScore((s) => s + 1);
          setAnswered({
            chosenIndex,
            isCorrect: true,
            message: q.correction,
          });
        } else {
          soundFx.play('wrong');
          setShaking(true);
          setTimeout(() => setShaking(false), 500);
          setMistakes((prev) => [
            ...prev,
            {
              question: q.statement,
              chosenAnswer: chosenLabel,
              correctAnswer: correctLabel,
              note: q.correction,
            },
          ]);
          setAnswered({
            chosenIndex,
            isCorrect: false,
            message: q.correction,
          });
        }
      }
    },
    [answered, current, finished, mode.id]
  );

  // Genius Countdown Timer
  useEffect(() => {
    if (mode.id !== 'genius' || answered || finished) return;
    let lastTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      const dtMs = Math.min(rawDt, 0.05) * 1000;
      lastTime = now;

      setRemainingMs((prev) => {
        const next = prev - dtMs;
        const sec = Math.ceil(next / 1000);
        if (sec <= 3 && sec >= 1 && sec !== lastTickSecRef.current) {
          lastTickSecRef.current = sec;
          soundFx.play('tick');
        }
        if (next <= 0) {
          setTimeout(() => handleAnswerChoice(-1, true), 0);
          return 0;
        }
        return next;
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [mode.id, answered, finished, handleAnswerChoice]);

  // 60FPS animation for Bubbles and Shooting modes using DOM refs (no 60Hz React setState)
  useEffect(() => {
    if ((mode.id !== 'bubbles' && mode.id !== 'shooting') || finished || !current) return;

    const arena = arenaRef.current;
    if (!arena) return;

    const count = 4;
    const states = Array.from({ length: count }, (_, i) => {
      if (mode.id === 'bubbles') {
        const xPct = 4 + i * 24;
        return {
          xPct,
          yPx: 290 + (i % 2) * 58 + Math.floor(i / 2) * 32,
          speed: 36 + (i % 3) * 10,
          phase: i * 1.4,
        };
      }
      // Shooting targets
      return {
        xPx: 40 + i * 140,
        yPx: 45 + i * 74,
        vx: (i % 2 === 0 ? 1 : -1) * (95 + i * 18),
        phase: i * 1.1,
      };
    });

    let lastTime = performance.now();
    let rafId = 0;

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const rect = arena.getBoundingClientRect();
      const arenaW = Math.max(rect.width, 320);
      const arenaH = Math.max(rect.height, 340);

      for (let i = 0; i < count; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;

        if (!answered) {
          if (mode.id === 'bubbles') {
            const st = states[i] as { xPct: number; yPx: number; speed: number; phase: number };
            st.yPx -= st.speed * dt;
            if (st.yPx < -70) {
              st.yPx = arenaH + 20;
            }
            const sway = Math.sin(now * 0.002 + st.phase) * 4;
            const xPx = (st.xPct / 100) * arenaW + sway;
            el.style.transform = `translate3d(${xPx.toFixed(1)}px, ${st.yPx.toFixed(1)}px, 0)`;
          } else {
            const st = states[i] as { xPx: number; yPx: number; vx: number; phase: number };
            const elW = el.offsetWidth || 160;
            st.xPx += st.vx * dt;
            if (st.xPx <= 10) {
              st.xPx = 10;
              st.vx = Math.abs(st.vx);
            } else if (st.xPx + elW >= arenaW - 10) {
              st.xPx = Math.max(10, arenaW - elW - 10);
              st.vx = -Math.abs(st.vx);
            }
            const bobY = st.yPx + Math.sin(now * 0.003 + st.phase) * 14;
            el.style.transform = `translate3d(${st.xPx.toFixed(1)}px, ${bobY.toFixed(1)}px, 0)`;
          }
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [mode.id, index, answered, finished, current]);

  const handleNext = () => {
    soundFx.play('click');
    setAnswered(null);
    setMapZoomed(false);
    if (index + 1 >= deck.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const handleRestart = () => {
    soundFx.play('click');
    setDeck(buildDeck());
    setIndex(0);
    setScore(0);
    setMistakes([]);
    setAnswered(null);
    setFinished(false);
    setMapZoomed(false);
    setVerifiedUrl('');
    setShareError('');
    setCopied(false);
  };

  const handlePrepareShare = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateShareName(studentName);
    if (!res.valid) {
      setShareError(res.error ?? 'يرجى كتابة الاسم.');
      setVerifiedUrl('');
      return;
    }
    setShareError('');
    const url = buildWhatsappShareUrl({
      studentName: res.cleanName,
      gameTitle: mode.title,
      score,
      total: deck.length,
    });
    setVerifiedUrl(url);
  };

  const handleCopyResult = async () => {
    const res = validateShareName(studentName);
    if (!res.valid) {
      setShareError(res.error ?? 'يرجى كتابة الاسم.');
      return;
    }
    setShareError('');
    const pct = computeScorePercentage(score, deck.length);
    const text = `نتيجة الطالب/ة ${res.cleanName} في ${mode.title} (قارات العالم الجديد): ${score} من ${deck.length} (${pct}%)`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored gracefully
    }
  };

  const percentage = useMemo(
    () => computeScorePercentage(score, deck.length),
    [score, deck.length]
  );
  const feedback = useMemo(() => getPerformanceFeedback(percentage), [percentage]);

  return (
    <section id="game-screen" className="flex-1 flex flex-col pb-10">
      {/* Confetti */}
      {confetti.map((c) => (
        <span
          key={c.id}
          className="confetti-piece"
          style={{
            left: `${c.left}%`,
            backgroundColor: c.color,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      {/* Game Top Navigation */}
      <div className="bg-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm rounded-b-2xl mb-4 max-w-5xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundFx.play('click');
              onBack();
            }}
            className="inline-flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3.5 py-2 rounded-xl cursor-pointer text-sm whitespace-nowrap shrink-0"
          >
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
            <span>القائمة الرئيسية</span>
          </button>

          <button
            type="button"
            onClick={onOpenLesson}
            aria-label="ملخص الدرس والخرائط"
            className="inline-flex items-center gap-1.5 bg-[#f0fdfa] hover:bg-[#ccfbf1] text-[#134e4a] border border-[#99f6e4] font-bold px-3 py-2 rounded-xl cursor-pointer text-sm whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">ملخص الدرس</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
            className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl cursor-pointer shrink-0"
          >
            {muted ? <VolumeX className="w-4 h-4" aria-hidden="true" /> : <Volume2 className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>

        <h2 className="text-base sm:text-xl font-black text-[#134e4a] truncate">
          {mode.title}
        </h2>

        <div className="flex items-center gap-2 shrink-0">
          <span
            aria-label="النقاط الحالية"
            className="bg-amber-100 text-amber-900 font-extrabold px-3 py-1.5 rounded-xl text-sm tabular-nums whitespace-nowrap"
          >
            النقاط: {score}
          </span>
          {!finished && (
            <span
              id="game-progress"
              className="bg-[#0d9488] text-white font-extrabold px-3.5 py-1.5 rounded-xl text-sm tabular-nums whitespace-nowrap"
            >
              {index + 1} / {deck.length}
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-5 max-w-4xl w-full mx-auto flex flex-col">
        {finished ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 border border-slate-200">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#ccfbf1] text-[#134e4a] flex items-center justify-center">
              <Trophy className="w-10 h-10" aria-hidden="true" />
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#134e4a]">
                {feedback.title}
              </h3>
              <p className="text-slate-600 font-semibold mt-1">{feedback.subtitle}</p>
            </div>

            <div className="inline-flex items-center gap-6 bg-[#f0fdfa] border border-[#99f6e4] rounded-2xl px-8 py-4">
              <div>
                <div className="text-xs font-bold text-slate-500">النتيجة النهائية</div>
                <div className="text-3xl font-black text-[#0f766e] tabular-nums">
                  {score} / {deck.length}
                </div>
              </div>
              <div className="w-px h-10 bg-[#99f6e4]" />
              <div>
                <div className="text-xs font-bold text-slate-500">النسبة المئوية</div>
                <div className="text-3xl font-black text-[#0e7490] tabular-nums">
                  {percentage}%
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-b from-[#0d9488] to-[#134e4a] text-white font-extrabold cursor-pointer shadow-md hover:brightness-110"
              >
                <RotateCcw className="w-5 h-5" aria-hidden="true" />
                <span>العب مرة أخرى</span>
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold cursor-pointer"
              >
                اختر لعبة أخرى
              </button>
            </div>

            {/* Mistakes Review */}
            <div className="text-right pt-4 border-t border-slate-200">
              <h4 className="text-lg font-black text-slate-800 mb-3">
                مراجعة الإجابات ({mistakes.length === 0 ? 'بدون أخطاء' : `${mistakes.length} أخطاء`})
              </h4>
              {mistakes.length === 0 ? (
                <p className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  أداء مثالي! أجبت على جميع الأسئلة بشكل صحيح دون أي أخطاء.
                </p>
              ) : (
                <ul className="errors-scroll max-h-64 overflow-y-auto space-y-3 pr-1">
                  {mistakes.map((m, idx) => (
                    <li
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-sm"
                    >
                      <div className="font-extrabold text-[#134e4a]">{m.question}</div>
                      <div className="text-red-600 font-bold">
                        إجابتك: {m.chosenAnswer}
                      </div>
                      <div className="text-emerald-700 font-extrabold">
                        الإجابة الصحيحة: {m.correctAnswer}
                      </div>
                      {m.note && <div className="text-slate-600 font-semibold">{m.note}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* WhatsApp Share Box */}
            <form
              onSubmit={handlePrepareShare}
              className="bg-[#f0fdfa] border-2 border-[#99f6e4] rounded-2xl p-5 text-center space-y-3"
            >
              <h4 className="text-lg font-black text-[#115e59]">
                شارك نتيجتك مع الأستاذ أحمد نورالدين عبر واتساب
              </h4>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <label htmlFor="student-name-input" className="sr-only">
                  اسم الطالب
                </label>
                <input
                  id="student-name-input"
                  type="text"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    setShareError('');
                    setVerifiedUrl('');
                  }}
                  placeholder="اكتب اسمك الثلاثي هنا..."
                  className="w-full sm:w-72 px-4 py-2.5 rounded-xl border-2 border-[#5eead4] bg-white text-center font-bold text-slate-800 focus:outline-none focus:border-[#0d9488]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold cursor-pointer shadow-sm whitespace-nowrap shrink-0"
                >
                  <Share2 className="w-4 h-4" aria-hidden="true" />
                  <span>تجهيز رابط واتساب</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold cursor-pointer whitespace-nowrap shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      <span>نسخ النتيجة</span>
                    </>
                  )}
                </button>
              </div>

              {shareError && (
                <p role="alert" className="text-red-600 font-bold text-sm">
                  {shareError}
                </p>
              )}

              {verifiedUrl && (
                <div className="pt-1">
                  <a
                    href={verifiedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#25d366] hover:bg-[#1da851] text-white font-black shadow-md"
                  >
                    <span>افتح واتساب وأرسل النتيجة الآن</span>
                  </a>
                </div>
              )}
            </form>
          </div>
        ) : current ? (
          <div className={`space-y-5 ${shaking ? 'animate-shake' : ''}`}>
            {/* Question Prompt Card */}
            <div className="bg-white px-5 py-5 sm:px-7 sm:py-6 rounded-2xl text-center text-lg sm:text-2xl font-extrabold text-[#134e4a] shadow-md border border-slate-200 leading-relaxed">
              {current.kind === 'tf' ? current.data.statement : current.data.question}
            </div>

            {/* Mode-Specific Play Area */}
            {mode.id === 'mcq' && current.kind === 'choice' && (
              <div className="flex flex-col gap-3">
                {current.data.options.map((opt, idx) => {
                  const isCorrectOpt = idx === current.data.correctIndex;
                  const isChosen = answered?.chosenIndex === idx;
                  let cls =
                    'bg-gradient-to-b from-[#0d9488] to-[#134e4a] text-white border-b-4 border-[#042f2e]';
                  if (answered) {
                    if (isCorrectOpt) {
                      cls = 'bg-emerald-600 text-white border-b-4 border-emerald-800';
                    } else if (isChosen) {
                      cls = 'bg-red-600 text-white border-b-4 border-red-800';
                    } else {
                      cls = 'bg-slate-300 text-slate-600 border-b-4 border-slate-400';
                    }
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={Boolean(answered)}
                      onClick={() => handleAnswerChoice(idx)}
                      className={`w-full px-5 py-4 rounded-xl text-base sm:text-xl font-bold text-right flex items-center justify-between gap-3 transition-transform hover:-translate-y-0.5 cursor-pointer disabled:cursor-default ${cls}`}
                    >
                      <span>{opt}</span>
                      {answered && isCorrectOpt && (
                        <CheckCircle2 className="w-6 h-6 shrink-0" aria-hidden="true" />
                      )}
                      {answered && isChosen && !isCorrectOpt && (
                        <XCircle className="w-6 h-6 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {mode.id === 'tf' && current.kind === 'tf' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'صح ✓', idx: 0, base: 'from-emerald-500 to-teal-700 border-emerald-900' },
                  { label: 'خطأ ✗', idx: 1, base: 'from-red-500 to-rose-700 border-rose-900' },
                ].map((btn) => {
                  const correctIdx = current.data.isTrue ? 0 : 1;
                  const isCorrectOpt = btn.idx === correctIdx;
                  const isChosen = answered?.chosenIndex === btn.idx;
                  let extra = `bg-gradient-to-b ${btn.base} text-white`;
                  if (answered) {
                    if (isCorrectOpt) {
                      extra = 'bg-emerald-600 text-white border-emerald-800 ring-4 ring-emerald-300';
                    } else if (isChosen) {
                      extra = 'bg-red-700 text-white border-red-900';
                    } else {
                      extra = 'bg-slate-300 text-slate-600 border-slate-400';
                    }
                  }
                  return (
                    <button
                      key={btn.idx}
                      type="button"
                      disabled={Boolean(answered)}
                      onClick={() => handleAnswerChoice(btn.idx)}
                      className={`py-7 px-6 rounded-2xl text-2xl sm:text-3xl font-black border-b-4 shadow-lg cursor-pointer transition-transform hover:-translate-y-0.5 disabled:cursor-default ${extra}`}
                    >
                      {btn.label}
                    </button>
                  );
                })}
              </div>
            )}

            {mode.id === 'bubbles' && current.kind === 'choice' && (
              <div
                ref={arenaRef}
                data-testid="bubbles-arena"
                className="relative h-[380px] sm:h-[410px] rounded-2xl overflow-hidden border-4 border-[#0d9488] shadow-inner"
                style={{
                  background: 'linear-gradient(to bottom, #042f2e 0%, #134e4a 100%)',
                }}
              >
                <p className="relative z-10 text-center text-xs sm:text-sm font-bold text-[#99f6e4] pt-2.5 pointer-events-none">
                  اضغط على الفقاعة التي تحمل الإجابة الصحيحة
                </p>
                {current.data.options.map((opt, idx) => {
                  const isCorrectOpt = idx === current.data.correctIndex;
                  const isChosen = answered?.chosenIndex === idx;
                  let bgClass = 'bg-white/95 text-[#134e4a] border-white';
                  if (answered) {
                    if (isCorrectOpt) bgClass = 'bg-emerald-500 text-white border-emerald-200';
                    else if (isChosen) bgClass = 'bg-red-500 text-white border-red-200';
                    else bgClass = 'bg-slate-300/80 text-slate-700 border-slate-200';
                  }
                  return (
                    <button
                      key={idx}
                      ref={(el) => {
                        itemRefs.current[idx] = el;
                      }}
                      type="button"
                      disabled={Boolean(answered)}
                      onClick={() => handleAnswerChoice(idx)}
                      style={{
                        top: 0,
                        left: 0,
                        background: answered
                          ? undefined
                          : 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.98) 0%, rgba(204,251,241,0.92) 70%, rgba(94,234,212,0.85) 100%)',
                      }}
                      className={`absolute w-[20%] min-w-[100px] max-w-[165px] py-3 px-2 rounded-full border-2 font-extrabold text-xs sm:text-sm shadow-lg cursor-pointer text-center transition-colors ${bgClass}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {mode.id === 'shooting' && current.kind === 'choice' && (
              <div
                ref={arenaRef}
                data-testid="shooting-arena"
                className="relative h-[380px] sm:h-[410px] rounded-2xl overflow-hidden border-4 border-[#0d9488] shadow-inner bg-gradient-to-b from-[#e0f2fe] to-[#ecfeff]"
              >
                <p className="relative z-10 text-center text-xs sm:text-sm font-bold text-[#0e7490] pt-2.5 pointer-events-none">
                  صوّب بالضغط على الهدف المتحرك الصحيح
                </p>
                {current.data.options.map((opt, idx) => {
                  const isCorrectOpt = idx === current.data.correctIndex;
                  const isChosen = answered?.chosenIndex === idx;
                  let cls = 'bg-white text-slate-900 border-amber-500 hover:bg-amber-50';
                  if (answered) {
                    if (isCorrectOpt) cls = 'bg-emerald-600 text-white border-emerald-300';
                    else if (isChosen) cls = 'bg-red-600 text-white border-red-300';
                    else cls = 'bg-slate-200 text-slate-600 border-slate-300';
                  }
                  return (
                    <button
                      key={idx}
                      ref={(el) => {
                        itemRefs.current[idx] = el;
                      }}
                      type="button"
                      disabled={Boolean(answered)}
                      onClick={() => handleAnswerChoice(idx)}
                      style={{ top: 0, left: 0 }}
                      className={`absolute px-4 py-2.5 rounded-full border-3 font-extrabold text-xs sm:text-base shadow-md cursor-crosshair inline-flex items-center gap-2 whitespace-nowrap ${cls}`}
                    >
                      <Crosshair className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {mode.id === 'genius' && current.kind === 'choice' && (
              <div
                className="rounded-2xl p-5 border-4 border-[#2dd4bf] shadow-xl space-y-4"
                style={{
                  background: 'linear-gradient(135deg, #042f2e 0%, #134e4a 55%, #0f766e 100%)',
                }}
              >
                <div className="flex items-center justify-between text-white font-extrabold text-sm">
                  <span className="inline-flex items-center gap-1.5 text-[#5eead4]">
                    <Timer className="w-4 h-4" aria-hidden="true" />
                    <span>تحدي السرعة</span>
                  </span>
                  <span
                    className={`tabular-nums px-3 py-0.5 rounded-lg ${
                      remainingMs <= 4000 ? 'bg-red-600 text-white' : 'bg-black/35 text-[#ccfbf1]'
                    }`}
                  >
                    {Math.ceil(remainingMs / 1000)} ثانية
                  </span>
                </div>

                <div className="w-full h-3.5 bg-black/35 rounded-full overflow-hidden border border-white/20">
                  <div
                    className="h-full rounded-full transition-[width] duration-100"
                    style={{
                      width: `${computeTimerPercent(remainingMs, GENIUS_DURATION_MS)}%`,
                      background: 'linear-gradient(to right, #2dd4bf, #f59e0b, #ef4444)',
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {current.data.options.map((opt, idx) => {
                    const isCorrectOpt = idx === current.data.correctIndex;
                    const isChosen = answered?.chosenIndex === idx;
                    let cls =
                      'bg-gradient-to-b from-[#14b8a6] to-[#0f766e] text-white border-b-4 border-[#042f2e] hover:brightness-110';
                    if (answered) {
                      if (isCorrectOpt) cls = 'bg-emerald-500 text-white border-b-4 border-emerald-700';
                      else if (isChosen) cls = 'bg-red-500 text-white border-b-4 border-red-700';
                      else cls = 'bg-slate-600/60 text-slate-300 border-b-4 border-slate-700';
                    }
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={Boolean(answered)}
                        onClick={() => handleAnswerChoice(idx)}
                        className={`min-h-[68px] px-4 py-3 rounded-xl font-extrabold text-base sm:text-lg cursor-pointer transition-all disabled:cursor-default ${cls}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mode.id === 'map' && current.kind === 'map' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#0f766e]">
                    لاحظ العلامة (؟) على الخريطة واختر الاسم الجغرافي الصحيح
                  </span>
                  <button
                    type="button"
                    onClick={() => setMapZoomed((z) => !z)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {mapZoomed ? (
                      <>
                        <ZoomOut className="w-4 h-4" aria-hidden="true" />
                        <span>تصغير الخريطة</span>
                      </>
                    ) : (
                      <>
                        <ZoomIn className="w-4 h-4" aria-hidden="true" />
                        <span>تكبير الخريطة</span>
                      </>
                    )}
                  </button>
                </div>

                <div
                  className={`rounded-2xl border-4 border-[#0d9488] bg-white shadow-lg mx-auto overflow-hidden ${
                    mapZoomed ? 'overflow-auto max-h-[48vh] w-full' : 'max-w-[560px] w-full'
                  }`}
                >
                  <div className={mapZoomed ? 'w-[1150px] max-w-none' : 'w-full'}>
                    <ContinentMapSvg
                      continent={current.data.continent}
                      markerX={current.data.markerX}
                      markerY={current.data.markerY}
                      featureLabel={current.data.featureLabel}
                      revealed={Boolean(answered)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {current.data.options.map((opt, idx) => {
                    const isCorrectOpt = idx === current.data.correctIndex;
                    const isChosen = answered?.chosenIndex === idx;
                    let cls =
                      'bg-gradient-to-b from-[#0d9488] to-[#134e4a] text-white border-b-4 border-[#042f2e]';
                    if (answered) {
                      if (isCorrectOpt) cls = 'bg-emerald-600 text-white border-b-4 border-emerald-800';
                      else if (isChosen) cls = 'bg-red-600 text-white border-b-4 border-red-800';
                      else cls = 'bg-slate-300 text-slate-600 border-b-4 border-slate-400';
                    }
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={Boolean(answered)}
                        onClick={() => handleAnswerChoice(idx)}
                        className={`min-h-[58px] px-4 py-3 rounded-xl font-extrabold text-base sm:text-lg cursor-pointer transition-transform hover:-translate-y-0.5 disabled:cursor-default ${cls}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Answer Feedback & Next Button */}
            {answered && (
              <div
                role="status"
                className={`rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-2 ${
                  answered.isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-red-50 border-red-300 text-red-950'
                }`}
              >
                <div className="flex items-start gap-3 text-right">
                  {answered.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <p className="font-bold text-sm sm:text-base leading-relaxed">
                    {answered.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-[#134e4a] hover:bg-[#0d9488] text-white font-extrabold cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
                >
                  {index + 1 >= deck.length ? 'عرض النتيجة النهائية' : 'السؤال التالي'}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};

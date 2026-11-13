import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, RotateCcw, Trophy, Clock } from 'lucide-react';
import {
  BUBBLE_QUESTIONS,
  GENIUS_QUESTIONS,
  MAP_QUESTIONS,
  MCQ_QUESTIONS,
  SHOOTING_QUESTIONS,
  TF_QUESTIONS,
} from '../data/curriculum';
import {
  GameModeMeta,
  MistakeRecord,
  UnifiedDuelQuestion,
} from '../types/game';
import {
  computeTimerPercent,
  evaluateTeamDuelWinner,
  shuffleArray,
} from '../utils/gameLogic';
import { soundFx } from '../utils/sound';
import { ContinentMapSvg } from './ContinentMapSvg';

interface DuelGameScreenProps {
  mode: GameModeMeta;
  team0Name: string;
  team1Name: string;
  onBack: () => void;
}

interface TeamState {
  deck: UnifiedDuelQuestion[];
  index: number;
  score: number;
  remainingMs: number;
  locked: boolean;
  flash: 'ok' | 'bad' | null;
  verdict: string;
  chosenIdx: number | null;
  finished: boolean;
  mistakes: MistakeRecord[];
}

const DUEL_QUESTION_MS = 15000;

function buildDuelDeck(mode: GameModeMeta): UnifiedDuelQuestion[] {
  if (mode.id === 'tf') {
    return shuffleArray(TF_QUESTIONS)
      .slice(0, mode.questionCount)
      .map((q) => ({
        kind: 'tf',
        id: q.id,
        prompt: q.statement,
        options: ['صح ✓', 'خطأ ✗'],
        correctIndex: q.isTrue ? 0 : 1,
        correctLabel: q.isTrue ? 'صح ✓' : 'خطأ ✗',
      }));
  }

  if (mode.id === 'map') {
    return shuffleArray(MAP_QUESTIONS)
      .slice(0, mode.questionCount)
      .map((q) => ({
        kind: 'map',
        id: q.id,
        continent: q.continent,
        markerX: q.markerX,
        markerY: q.markerY,
        featureLabel: q.featureLabel,
        prompt: q.question,
        options: [...q.options],
        correctIndex: q.correctIndex,
        correctLabel: q.options[q.correctIndex],
      }));
  }

  const bank =
    mode.id === 'bubbles'
      ? BUBBLE_QUESTIONS
      : mode.id === 'shooting'
      ? SHOOTING_QUESTIONS
      : mode.id === 'genius'
      ? GENIUS_QUESTIONS
      : MCQ_QUESTIONS;

  return shuffleArray(bank)
    .slice(0, mode.questionCount)
    .map((q) => ({
      kind: 'choice',
      id: q.id,
      prompt: q.question,
      options: [...q.options],
      correctIndex: q.correctIndex,
      correctLabel: q.options[q.correctIndex],
    }));
}

function createInitialTeamState(deck: UnifiedDuelQuestion[]): TeamState {
  return {
    deck,
    index: 0,
    score: 0,
    remainingMs: DUEL_QUESTION_MS,
    locked: false,
    flash: null,
    verdict: '',
    chosenIdx: null,
    finished: false,
    mistakes: [],
  };
}

export const DuelGameScreen: React.FC<DuelGameScreenProps> = ({
  mode,
  team0Name,
  team1Name,
  onBack,
}) => {
  const [teams, setTeams] = useState<[TeamState, TeamState]>(() => [
    createInitialTeamState(buildDuelDeck(mode)),
    createInitialTeamState(buildDuelDeck(mode)),
  ]);

  const bothFinished = teams[0].finished && teams[1].finished;

  useEffect(() => {
    document.body.classList.add('duel-on');
    document.body.dataset.state = bothFinished ? 'results' : 'duel';
    return () => {
      document.body.classList.remove('duel-on');
    };
  }, [bothFinished]);

  const handleTeamAnswer = useCallback(
    (teamIdx: 0 | 1, optionIdx: number, timedOut = false) => {
      setTeams((prev) => {
        const currentTeam = prev[teamIdx];
        if (currentTeam.locked || currentTeam.finished) return prev;
        const q = currentTeam.deck[currentTeam.index];
        if (!q) return prev;

        const isCorrect = !timedOut && optionIdx === q.correctIndex;
        soundFx.play(isCorrect ? 'correct' : 'wrong');

        const updated: TeamState = {
          ...currentTeam,
          locked: true,
          chosenIdx: optionIdx,
          flash: isCorrect ? 'ok' : 'bad',
          score: isCorrect ? currentTeam.score + 1 : currentTeam.score,
          verdict: isCorrect
            ? 'إجابة صحيحة (+1)'
            : timedOut
            ? `انتهى الوقت! الصحيح: ${q.correctLabel}`
            : `خطأ! الصحيح: ${q.correctLabel}`,
          mistakes: isCorrect
            ? currentTeam.mistakes
            : [
                ...currentTeam.mistakes,
                {
                  question: q.prompt,
                  chosenAnswer: timedOut ? 'انتهى الوقت' : q.options[optionIdx] ?? '—',
                  correctAnswer: q.correctLabel,
                },
              ],
        };

        const nextTuple: [TeamState, TeamState] =
          teamIdx === 0 ? [updated, prev[1]] : [prev[0], updated];
        return nextTuple;
      });

      setTimeout(() => {
        setTeams((prev) => {
          const t = prev[teamIdx];
          if (!t.locked || t.finished) return prev;
          const nextIdx = t.index + 1;
          const isDone = nextIdx >= t.deck.length;
          const advanced: TeamState = {
            ...t,
            index: isDone ? t.index : nextIdx,
            remainingMs: DUEL_QUESTION_MS,
            locked: false,
            flash: null,
            verdict: '',
            chosenIdx: null,
            finished: isDone,
          };
          return teamIdx === 0 ? [advanced, prev[1]] : [prev[0], advanced];
        });
      }, 900);
    },
    []
  );

  // Per-team independent timer loop
  useEffect(() => {
    if (bothFinished) return;
    const interval = window.setInterval(() => {
      setTeams((prev) => {
        let changed = false;
        const nextTeams = prev.map((t, idx) => {
          if (t.finished || t.locked) return t;
          changed = true;
          const nextMs = Math.max(0, t.remainingMs - 100);
          if (nextMs === 0) {
            setTimeout(() => handleTeamAnswer(idx as 0 | 1, -1, true), 0);
          }
          return { ...t, remainingMs: nextMs };
        }) as [TeamState, TeamState];

        return changed ? nextTeams : prev;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [bothFinished, handleTeamAnswer]);

  useEffect(() => {
    if (bothFinished) {
      soundFx.play('win');
    }
  }, [bothFinished]);

  const handleRestartDuel = () => {
    soundFx.play('click');
    setTeams([
      createInitialTeamState(buildDuelDeck(mode)),
      createInitialTeamState(buildDuelDeck(mode)),
    ]);
  };

  const winner = useMemo(
    () =>
      evaluateTeamDuelWinner(
        teams[0].score,
        teams[1].score,
        team0Name,
        team1Name
      ),
    [teams, team0Name, team1Name]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#ecfeff]"
      style={{
        backgroundImage: 'radial-gradient(#a5d4ce 1.5px, transparent 1.5px)',
        backgroundSize: '25px 25px',
      }}
    >
      {/* Top Duel Bar */}
      <div className="flex items-center justify-between gap-3 bg-white px-4 py-2.5 shadow-sm shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm sm:text-base cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
          <span>خروج</span>
        </button>

        <strong className="text-[#134e4a] font-black text-sm sm:text-lg truncate">
          {mode.duelLabel}
        </strong>

        <span className="hidden sm:inline-block bg-amber-100 text-amber-900 font-extrabold px-3 py-1 rounded-xl text-xs whitespace-nowrap shrink-0">
          شاشة مقسومة · فريقان
        </span>
      </div>

      {/* Split Playfield */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        {([0, 1] as const).map((teamIdx) => {
          const team = teams[teamIdx];
          const isT0 = teamIdx === 0;
          const teamName = isT0 ? team0Name : team1Name;
          const q = team.deck[team.index];
          const secLeft = Math.ceil(team.remainingMs / 1000);
          const timerPct = computeTimerPercent(team.remainingMs, DUEL_QUESTION_MS);

          const bgClass =
            team.flash === 'ok'
              ? 'bg-emerald-500/20'
              : team.flash === 'bad'
              ? 'bg-red-500/20'
              : isT0
              ? 'bg-[#0d9488]/5'
              : 'bg-orange-500/5';

          return (
            <React.Fragment key={teamIdx}>
              {teamIdx === 1 && (
                <div className="relative shrink-0 h-1.5 md:h-auto md:w-1.5 bg-gradient-to-r md:bg-gradient-to-b from-[#0d9488] via-amber-500 to-[#ea580c]">
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800 text-amber-300 font-black text-xs flex items-center justify-center border-2 border-white shadow-md z-10">
                    VS
                  </span>
                </div>
              )}

              <section
                aria-label={`منطقة ${teamName}`}
                className={`flex-1 min-w-0 min-h-0 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3 transition-colors ${bgClass}`}
              >
                {/* Team Header */}
                <div
                  className={`flex items-center justify-between gap-2 bg-white rounded-2xl px-3.5 py-2 shadow-sm border-2 ${
                    isT0 ? 'border-[#0d9488]' : 'border-[#ea580c]'
                  }`}
                >
                  <span
                    className={`font-black text-base sm:text-lg truncate ${
                      isT0 ? 'text-[#0f766e]' : 'text-[#c2410c]'
                    }`}
                  >
                    {teamName}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm px-2.5 py-0.5 rounded-lg tabular-nums">
                      {team.index + 1} / {team.deck.length}
                    </span>
                    <span
                      className={`text-white font-black text-lg px-3 py-0.5 rounded-lg tabular-nums ${
                        isT0 ? 'bg-[#0d9488]' : 'bg-[#ea580c]'
                      }`}
                    >
                      {team.score}
                    </span>
                  </div>
                </div>

                {team.finished ? (
                  <div className="my-auto bg-white rounded-2xl p-6 text-center shadow-md space-y-2">
                    <Clock className="w-10 h-10 mx-auto text-[#0d9488]" aria-hidden="true" />
                    <h3 className="text-xl font-black text-[#134e4a]">
                      انتهى {teamName} من جميع الأسئلة!
                    </h3>
                    <p className="text-slate-600 font-semibold text-sm">
                      بانتظار انتهاء الفريق المنافس لعرض النتيجة النهائية...
                    </p>
                    <p className="text-2xl font-black text-[#0f766e] tabular-nums pt-2">
                      النقاط: {team.score} / {team.deck.length}
                    </p>
                  </div>
                ) : q ? (
                  <>
                    {/* Timer */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-black/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-[width] duration-100"
                          style={{
                            width: `${timerPct}%`,
                            background:
                              secLeft <= 4
                                ? 'linear-gradient(to right, #f97316, #ef4444)'
                                : 'linear-gradient(to right, #10b981, #f59e0b)',
                          }}
                        />
                      </div>
                      <span
                        className={`min-w-[44px] text-center font-black text-sm px-2 py-0.5 rounded-lg tabular-nums text-white ${
                          secLeft <= 4 ? 'bg-red-600' : 'bg-slate-800'
                        }`}
                      >
                        {secLeft}ث
                      </span>
                    </div>

                    {/* Question Box */}
                    <div className="bg-white rounded-2xl p-3.5 sm:p-4 text-center font-extrabold text-[#134e4a] text-sm sm:text-lg shadow-sm border border-slate-200 leading-snug">
                      {q.prompt}
                    </div>

                    {/* Map Stage if map mode */}
                    {q.kind === 'map' && (
                      <div className="rounded-xl overflow-hidden border-2 border-[#0d9488] bg-white max-h-[26vh] flex items-center justify-center">
                        <div className="w-full max-w-[360px]">
                          <ContinentMapSvg
                            continent={q.continent}
                            markerX={q.markerX}
                            markerY={q.markerY}
                            featureLabel={q.featureLabel}
                            revealed={team.locked}
                          />
                        </div>
                      </div>
                    )}

                    {/* Options */}
                    <div
                      className={`grid grid-cols-2 gap-2.5 ${
                        q.kind === 'tf' ? 'mt-2' : ''
                      }`}
                    >
                      {q.options.map((opt, optIdx) => {
                        const isCorrectOpt = optIdx === q.correctIndex;
                        const isChosen = team.chosenIdx === optIdx;
                        let btnStyle = isT0
                          ? 'bg-gradient-to-b from-[#0d9488] to-[#134e4a] border-[#042f2e] text-white'
                          : 'bg-gradient-to-b from-[#f97316] to-[#c2410c] border-[#9a3412] text-white';

                        if (q.kind === 'tf') {
                          btnStyle =
                            optIdx === 0
                              ? 'bg-gradient-to-b from-emerald-500 to-teal-700 border-emerald-900 text-white text-xl sm:text-2xl min-h-[72px]'
                              : 'bg-gradient-to-b from-red-500 to-rose-700 border-rose-900 text-white text-xl sm:text-2xl min-h-[72px]';
                        }

                        if (team.locked) {
                          if (isCorrectOpt) {
                            btnStyle = 'bg-emerald-600 border-emerald-800 text-white';
                          } else if (isChosen) {
                            btnStyle = 'bg-red-600 border-red-800 text-white';
                          } else {
                            btnStyle = 'bg-slate-300 border-slate-400 text-slate-600';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={team.locked}
                            onClick={() => handleTeamAnswer(teamIdx, optIdx)}
                            className={`px-3 py-3 rounded-xl font-extrabold text-xs sm:text-base border-b-4 cursor-pointer transition-transform active:translate-y-0.5 disabled:cursor-default min-h-[54px] ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Instant Verdict */}
                    <div
                      className={`text-center font-black text-sm sm:text-base min-h-[1.5rem] ${
                        team.flash === 'ok' ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {team.verdict}
                    </div>
                  </>
                ) : null}
              </section>
            </React.Fragment>
          );
        })}

        {/* Duel Results Overlay */}
        {bothFinished && (
          <div className="absolute inset-0 z-20 overflow-y-auto p-4 bg-[#ecfeff]">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 border border-slate-200">
              <div
                className="rounded-2xl p-6 text-white space-y-3"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                }}
              >
                <Trophy className="w-12 h-12 mx-auto" aria-hidden="true" />
                <div className="text-sm font-bold text-amber-100">{winner.badge}</div>
                <h2 className="text-2xl sm:text-3xl font-black">{winner.headline}</h2>

                <div className="flex flex-wrap justify-center gap-4 pt-2">
                  <div className="bg-white/20 rounded-xl px-6 py-2.5">
                    <div className="text-xs font-bold">{team0Name}</div>
                    <div className="text-2xl font-black tabular-nums">
                      {teams[0].score} / {teams[0].deck.length}
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-xl px-6 py-2.5">
                    <div className="text-xs font-bold">{team1Name}</div>
                    <div className="text-2xl font-black tabular-nums">
                      {teams[1].score} / {teams[1].deck.length}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRestartDuel}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-b from-[#0d9488] to-[#134e4a] text-white font-extrabold cursor-pointer shadow-md"
                >
                  <RotateCcw className="w-5 h-5" aria-hidden="true" />
                  <span>إعادة المنافسة</span>
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold cursor-pointer"
                >
                  العودة للقائمة الرئيسية
                </button>
              </div>

              {/* Side-by-Side Mistake Review */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                {([0, 1] as const).map((teamIdx) => {
                  const t = teams[teamIdx];
                  const tName = teamIdx === 0 ? team0Name : team1Name;
                  return (
                    <div
                      key={teamIdx}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-72 overflow-y-auto errors-scroll"
                    >
                      <h3
                        className={`text-center font-black text-base mb-3 ${
                          teamIdx === 0 ? 'text-[#0f766e]' : 'text-[#c2410c]'
                        }`}
                      >
                        أخطاء {tName} ({t.mistakes.length})
                      </h3>
                      {t.mistakes.length === 0 ? (
                        <p className="text-emerald-700 font-bold text-center text-sm bg-emerald-50 rounded-xl p-3">
                          أداء مثالي بدون أي أخطاء!
                        </p>
                      ) : (
                        <ul className="space-y-2.5">
                          {t.mistakes.map((m, mIdx) => (
                            <li
                              key={mIdx}
                              className="bg-white p-3 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-1"
                            >
                              <div className="font-extrabold text-[#134e4a]">{m.question}</div>
                              <div className="text-red-600 font-bold">
                                الإجابة المختارة: {m.chosenAnswer}
                              </div>
                              <div className="text-emerald-700 font-extrabold">
                                الصحيح: {m.correctAnswer}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { User, Users, X } from 'lucide-react';
import { GameModeMeta, PlayStyle } from '../types/game';
import { normalizeTeamName } from '../utils/gameLogic';

interface ModeSelectModalProps {
  mode: GameModeMeta | null;
  onClose: () => void;
  onStart: (style: PlayStyle, team0Name: string, team1Name: string) => void;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  mode,
  onClose,
  onStart,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<PlayStyle>('solo');
  const [team0, setTeam0] = useState('فريق النيل');
  const [team1, setTeam1] = useState('فريق الأبطال');

  if (!mode) return null;

  const handleConfirmDuel = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(
      'duel',
      normalizeTeamName(team0, 'الفريق الأول'),
      normalizeTeamName(team1, 'الفريق الثاني')
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mode-modal-title"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md text-center shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق نافذة اختيار طريقة اللعب"
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="mode-modal-title" className="text-2xl font-black text-[#134e4a] mb-1">
          {mode.title}
        </h2>
        <p className="text-slate-600 font-semibold text-sm mb-5">
          اختر طريقة اللعب المناسبة لك
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => {
              setSelectedStyle('solo');
              onStart('solo', '', '');
            }}
            className={`border-2 rounded-2xl p-4 cursor-pointer transition-all text-center flex flex-col items-center gap-2 ${
              selectedStyle === 'solo'
                ? 'border-[#0d9488] bg-[#f0fdfa]'
                : 'border-[#ccfbf1] bg-[#f8fafc] hover:border-[#0d9488]'
            }`}
          >
            <span className="w-12 h-12 rounded-full bg-[#ccfbf1] text-[#134e4a] flex items-center justify-center">
              <User className="w-6 h-6" aria-hidden="true" />
            </span>
            <span className="text-lg font-extrabold text-slate-800">لعب فردي</span>
            <span className="text-xs font-semibold text-slate-500">
              تدريب ذاتي مع مراجعة الأخطاء ومشاركة النتيجة
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStyle('duel')}
            className={`border-2 rounded-2xl p-4 cursor-pointer transition-all text-center flex flex-col items-center gap-2 ${
              selectedStyle === 'duel'
                ? 'border-[#ea580c] bg-[#fff7ed]'
                : 'border-[#ccfbf1] bg-[#f8fafc] hover:border-[#ea580c]'
            }`}
          >
            <span className="w-12 h-12 rounded-full bg-orange-100 text-[#c2410c] flex items-center justify-center">
              <Users className="w-6 h-6" aria-hidden="true" />
            </span>
            <span className="text-lg font-extrabold text-slate-800">منافسة بين فريقين</span>
            <span className="text-xs font-semibold text-slate-500">
              شاشة مقسومة وتحدي مباشر مع مؤقت لكل فريق
            </span>
          </button>
        </div>

        {selectedStyle === 'duel' && (
          <form onSubmit={handleConfirmDuel} className="mt-4 pt-4 border-t border-slate-200 text-right space-y-3">
            <div>
              <label htmlFor="team0-input" className="block font-extrabold text-sm text-[#0f766e] mb-1">
                اسم الفريق الأول (الأخضر)
              </label>
              <input
                id="team0-input"
                type="text"
                value={team0}
                onChange={(e) => setTeam0(e.target.value)}
                maxLength={24}
                placeholder="فريق النيل"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#5eead4] text-center font-bold text-slate-800 focus:outline-none focus:border-[#0d9488]"
              />
            </div>

            <div>
              <label htmlFor="team1-input" className="block font-extrabold text-sm text-[#c2410c] mb-1">
                اسم الفريق الثاني (البرتقالي)
              </label>
              <input
                id="team1-input"
                type="text"
                value={team1}
                onChange={(e) => setTeam1(e.target.value)}
                maxLength={24}
                placeholder="فريق الأبطال"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-orange-300 text-center font-bold text-slate-800 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-b from-[#0d9488] to-[#134e4a] text-white font-extrabold cursor-pointer shadow-md hover:brightness-110"
              >
                ابدأ المنافسة الآن
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl bg-slate-200 text-slate-800 font-bold cursor-pointer hover:bg-slate-300"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

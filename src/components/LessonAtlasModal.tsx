import React, { useState } from 'react';
import { X, Compass, Mountain, Waves } from 'lucide-react';
import { LESSON_CONTINENTS } from '../data/curriculum';
import { ContinentId } from '../types/game';
import { ContinentMapSvg } from './ContinentMapSvg';

interface LessonAtlasModalProps {
  open: boolean;
  onClose: () => void;
}

export const LessonAtlasModal: React.FC<LessonAtlasModalProps> = ({ open, onClose }) => {
  const [activeId, setActiveId] = useState<ContinentId>('north-america');

  if (!open) return null;

  const continent = LESSON_CONTINENTS.find((c) => c.id === activeId) ?? LESSON_CONTINENTS[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lesson-atlas-title"
    >
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 bg-[#134e4a] text-white shrink-0">
          <div>
            <h2 id="lesson-atlas-title" className="text-lg sm:text-2xl font-black">
              ملخص الدرس والأطلس التفاعلي لقارات العالم الجديد
            </h2>
            <p className="text-xs sm:text-sm text-[#ccfbf1] font-semibold">
              راجع الموقع الفلكي والجغرافي ومظاهر السطح قبل بدء التحديات
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق ملخص الدرس"
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Continent Tabs */}
        <div className="flex flex-wrap gap-2 px-5 py-3 bg-[#f0fdfa] border-b border-slate-200 shrink-0">
          {LESSON_CONTINENTS.map((item) => {
            const active = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                className={`px-4 py-2 rounded-xl text-sm font-extrabold cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#0d9488] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Labeled Map */}
          <div className="lg:col-span-6 rounded-2xl overflow-hidden border-2 border-[#0d9488] bg-[#d7f3f9]">
            <ContinentMapSvg continent={continent.id} showAllLabels />
          </div>

          {/* Structured Lesson Notes */}
          <div className="lg:col-span-6 space-y-4 text-right">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#134e4a]">
                {continent.name}
              </h3>
              <p className="text-sm font-bold text-[#0e7490] mt-1">{continent.areaNote}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-[#134e4a]">
                <Compass className="w-5 h-5 text-[#0d9488]" aria-hidden="true" />
                <span>الموقع الفلكي والجغرافي</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                {continent.astronomical}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs sm:text-sm text-slate-700">
                <div><strong className="text-[#134e4a]">شمالاً:</strong> {continent.borders.north}</div>
                <div><strong className="text-[#134e4a]">جنوباً:</strong> {continent.borders.south}</div>
                <div><strong className="text-[#134e4a]">شرقاً:</strong> {continent.borders.east}</div>
                <div><strong className="text-[#134e4a]">غرباً:</strong> {continent.borders.west}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-amber-900">
                <Mountain className="w-5 h-5 text-amber-700" aria-hidden="true" />
                <span>الجبال والهضاب</span>
              </div>
              <ul className="space-y-1.5 text-sm text-slate-800 font-semibold list-disc list-inside">
                {continent.mountains.map((m, idx) => (
                  <li key={`m-${idx}`}>{m}</li>
                ))}
                {continent.plateaus.map((p, idx) => (
                  <li key={`p-${idx}`}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-cyan-950">
                <Waves className="w-5 h-5 text-cyan-700" aria-hidden="true" />
                <span>السهول والأنهار</span>
              </div>
              <ul className="space-y-1.5 text-sm text-slate-800 font-semibold list-disc list-inside">
                {continent.plainsAndRivers.map((r, idx) => (
                  <li key={`r-${idx}`}>{r}</li>
                ))}
              </ul>
            </div>

            <p className="text-sm font-bold text-[#134e4a] bg-[#f0fdfa] border border-[#99f6e4] rounded-xl p-3">
              معلومة هامة للامتحان: {continent.keyFact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

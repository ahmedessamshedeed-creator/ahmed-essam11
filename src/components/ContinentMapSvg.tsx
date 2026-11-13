import React from 'react';
import { ContinentId } from '../types/game';

interface ContinentMapSvgProps {
  continent: ContinentId;
  markerX?: number;
  markerY?: number;
  featureLabel?: string;
  revealed?: boolean;
  showAllLabels?: boolean;
}

export const ContinentMapSvg: React.FC<ContinentMapSvgProps> = ({
  continent,
  markerX,
  markerY,
  featureLabel,
  revealed = false,
  showAllLabels = false,
}) => {
  return (
    <div className="relative w-full select-none">
      <svg
        viewBox="0 0 800 560"
        className="w-full h-auto block bg-[#d7f3f9]"
        role="img"
        aria-label={`خريطة ${continent}`}
      >
        <defs>
          <linearGradient id="oceanGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#cdeff8" />
            <stop offset="100%" stopColor="#9cdcf0" />
          </linearGradient>
          <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ecfccb" />
            <stop offset="100%" stopColor="#d9f99d" />
          </linearGradient>
          <linearGradient id="plateauGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id="iceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>
        </defs>

        {/* Ocean Backdrop */}
        <rect width="800" height="560" fill="url(#oceanGrad)" />

        {/* Subtle Graticule Grid */}
        <g stroke="#7dd3fc" strokeWidth="1" strokeDasharray="4 6" opacity="0.55">
          <line x1="0" y1="140" x2="800" y2="140" />
          <line x1="0" y1="280" x2="800" y2="280" />
          <line x1="0" y1="420" x2="800" y2="420" />
          <line x1="200" y1="0" x2="200" y2="560" />
          <line x1="400" y1="0" x2="400" y2="560" />
          <line x1="600" y1="0" x2="600" y2="560" />
        </g>

        {/* Compass Rose (Top Left) */}
        <g transform="translate(58, 56)" opacity="0.88">
          <circle cx="0" cy="0" r="24" fill="#ffffff" fillOpacity="0.85" stroke="#0f766e" strokeWidth="2" />
          <polygon points="0,-19 5,-4 0,-8 -5,-4" fill="#0f766e" />
          <polygon points="0,19 5,4 0,8 -5,4" fill="#94a3b8" />
          <polygon points="19,0 4,5 8,0 4,-5" fill="#94a3b8" />
          <polygon points="-19,0 -4,5 -8,0 -4,-5" fill="#94a3b8" />
          <text x="0" y="-27" textAnchor="middle" fontSize="13" fontWeight="900" fill="#134e4a">
            ش
          </text>
        </g>

        {continent === 'north-america' && (
          <g>
            {/* Arctic Circle */}
            <line x1="0" y1="115" x2="800" y2="115" stroke="#0369a1" strokeWidth="1.5" strokeDasharray="8 5" opacity="0.5" />
            {/* Greenland / Northern Islands Hint */}
            <path d="M555,52 L645,45 L665,105 L595,135 L545,98 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
            {/* Main Continent */}
            <path
              d="M95,135 L155,95 L235,98 L330,85 L430,90 L460,130 L435,180 L452,232 L510,235 L522,185 L545,155 L615,178 L632,238 L595,270 L562,315 L515,360 L488,395 L485,375 L455,378 L420,400 L398,438 L428,472 L458,495 L418,505 L368,468 L322,422 L288,370 L255,315 L220,250 L178,195 L130,175 L88,162 Z"
              fill="url(#landGrad)"
              stroke="#15803d"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Hudson Bay Water Cutout */}
            <path d="M442,155 L508,158 L518,225 L482,240 L446,212 Z" fill="#a5e1f4" stroke="#0284c7" strokeWidth="1.5" />

            {/* Labrador Plateau */}
            <ellipse cx="575" cy="222" rx="34" ry="26" fill="url(#plateauGrad)" stroke="#b45309" strokeWidth="1.5" />
            {/* Mexican Plateau */}
            <ellipse cx="355" cy="426" rx="30" ry="28" fill="url(#plateauGrad)" stroke="#b45309" strokeWidth="1.5" />

            {/* Rocky Mountains (West) */}
            <g fill="#78350f" stroke="#451a03" strokeWidth="1.2">
              <polygon points="240,185 256,148 272,185" />
              <polygon points="258,230 276,190 294,230" />
              <polygon points="274,278 292,236 310,278" />
              <polygon points="292,326 310,285 328,326" />
              <polygon points="308,370 326,332 344,370" />
            </g>

            {/* Appalachian Mountains (East) */}
            <g fill="#92400e" stroke="#451a03" strokeWidth="1.2">
              <polygon points="502,332 518,298 534,332" />
              <polygon points="524,302 540,268 556,302" />
              <polygon points="546,274 562,242 578,274" />
            </g>

            {/* Great Lakes */}
            <g fill="#0ea5e9" stroke="#0369a1" strokeWidth="1">
              <ellipse cx="458" cy="268" rx="14" ry="7" />
              <ellipse cx="480" cy="276" rx="12" ry="6" />
              <ellipse cx="498" cy="268" rx="10" ry="5" />
            </g>

            {/* Nelson River */}
            <path d="M390,265 Q418,248 446,218" fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
            {/* St. Lawrence River */}
            <path d="M510,266 Q560,256 618,242" fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
            {/* Mississippi River */}
            <path d="M425,252 Q440,315 436,385" fill="none" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />

            {/* Ocean & Gulf Labels */}
            <text x="360" y="48" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0369a1">المحيط القطبي الشمالي</text>
            <text x="705" y="340" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0369a1">المحيط الأطلنطي</text>
            <text x="125" y="330" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0369a1">المحيط الهادي</text>
            <text x="458" y="424" textAnchor="middle" fontSize="15" fontWeight="800" fill="#0369a1">خليج المكسيك</text>
            <text x="480" y="198" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0369a1">خليج هدسن</text>

            {showAllLabels && (
              <g
                fontSize="14"
                fontWeight="900"
                fill="#0f172a"
                stroke="#ffffff"
                strokeWidth="4"
                paintOrder="stroke fill"
              >
                <text x="220" y="275" textAnchor="end">جبال روكي</text>
                <text x="615" y="318" textAnchor="start">جبال الأبلاش</text>
                <text x="575" y="222" textAnchor="middle">هضبة لبرادور</text>
                <text x="355" y="432" textAnchor="middle">هضبة المكسيك</text>
                <text x="398" y="345" textAnchor="end">نهر المسيسبي</text>
              </g>
            )}
          </g>
        )}

        {continent === 'south-america' && (
          <g>
            {/* Equator & Tropic of Capricorn */}
            <line x1="0" y1="168" x2="800" y2="168" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="8 5" opacity="0.55" />
            <text x="730" y="160" fontSize="12" fontWeight="700" fill="#b91c1c">دائرة الاستواء</text>
            <line x1="0" y1="340" x2="800" y2="340" stroke="#d97706" strokeWidth="1.5" strokeDasharray="8 5" opacity="0.55" />
            <text x="730" y="332" fontSize="12" fontWeight="700" fill="#b45309">مدار الجدي</text>

            {/* Main Continent */}
            <path
              d="M278,76 L345,62 L415,78 L480,115 L555,165 L592,208 L565,268 L518,328 L462,385 L408,438 L372,498 L338,512 L305,478 L286,408 L268,320 L238,242 L228,175 L252,118 Z"
              fill="url(#landGrad)"
              stroke="#15803d"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Guiana Plateau */}
            <ellipse cx="395" cy="112" rx="45" ry="22" fill="url(#plateauGrad)" stroke="#b45309" strokeWidth="1.5" />
            {/* Brazilian Plateau */}
            <ellipse cx="496" cy="245" rx="64" ry="52" fill="url(#plateauGrad)" stroke="#b45309" strokeWidth="1.5" />
            {/* Patagonia Plateau */}
            <ellipse cx="348" cy="445" rx="28" ry="38" fill="url(#plateauGrad)" stroke="#b45309" strokeWidth="1.5" />

            {/* Andes Mountains */}
            <g fill="#78350f" stroke="#451a03" strokeWidth="1.2">
              <polygon points="240,145 256,110 272,145" />
              <polygon points="246,195 262,158 278,195" />
              <polygon points="258,248 275,210 292,248" />
              <polygon points="274,305 290,268 306,305" />
              <polygon points="286,365 302,328 318,365" />
              <polygon points="298,425 314,388 330,425" />
              <polygon points="310,482 325,448 340,482" />
            </g>

            {/* Orinoco River */}
            <path d="M300,108 Q335,88 378,78" fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
            {/* Amazon River & Tributaries */}
            <path d="M275,180 Q365,168 485,152" fill="none" stroke="#0284c7" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M335,142 Q370,158 405,166" fill="none" stroke="#0284c7" strokeWidth="2.5" />
            <path d="M350,210 Q385,188 425,163" fill="none" stroke="#0284c7" strokeWidth="2.5" />
            {/* Parana / La Plata Rivers */}
            <path d="M435,295 Q412,345 418,392" fill="none" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
            <path d="M385,305 Q405,342 414,378" fill="none" stroke="#0284c7" strokeWidth="2.8" strokeLinecap="round" />

            {/* Ocean Labels */}
            <text x="365" y="40" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0369a1">البحر الكاريبي</text>
            <text x="670" y="265" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0369a1">المحيط الأطلنطي</text>
            <text x="145" y="290" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0369a1">المحيط الهادي</text>

            {showAllLabels && (
              <g fontSize="13" fontWeight="800" fill="#1e293b">
                <text x="210" y="265" textAnchor="end">جبال الأنديز</text>
                <text x="395" y="114" textAnchor="middle">هضبة جيانا</text>
                <text x="496" y="248" textAnchor="middle">هضبة البرازيل</text>
                <text x="348" y="445" textAnchor="middle">هضبة بتاجونيا</text>
                <text x="385" y="160" textAnchor="middle">حوض الأمازون</text>
                <text x="415" y="362" textAnchor="middle">سهول لابلاتا</text>
              </g>
            )}
          </g>
        )}

        {continent === 'australia' && (
          <g>
            {/* Tropic of Capricorn */}
            <line x1="0" y1="265" x2="800" y2="265" stroke="#d97706" strokeWidth="1.5" strokeDasharray="8 5" opacity="0.55" />
            <text x="100" y="256" fontSize="12" fontWeight="700" fill="#b45309">مدار الجدي</text>

            {/* Main Australian Continent */}
            <path
              d="M280,165 L345,140 L375,165 L418,162 L442,118 L478,125 L525,185 L575,245 L588,315 L555,382 L495,412 L435,392 L385,365 L312,368 L235,388 L192,365 L182,295 L205,222 Z"
              fill="url(#landGrad)"
              stroke="#15803d"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Tasmania */}
            <path d="M505,455 L545,458 L540,498 L508,495 Z" fill="url(#landGrad)" stroke="#15803d" strokeWidth="2.2" />
            {/* New Zealand Hint */}
            <path d="M685,365 L712,350 L725,388 L698,408 Z" fill="url(#landGrad)" stroke="#15803d" strokeWidth="2" />
            <path d="M670,420 L696,408 L705,452 L672,468 Z" fill="url(#landGrad)" stroke="#15803d" strokeWidth="2" />

            {/* Western Plateau */}
            <ellipse cx="285" cy="265" rx="76" ry="74" fill="url(#plateauGrad)" stroke="#b45309" strokeWidth="1.5" />

            {/* Great Dividing Range (Australian Alps) */}
            <g fill="#78350f" stroke="#451a03" strokeWidth="1.2">
              <polygon points="518,195 532,162 546,195" />
              <polygon points="538,242 552,208 566,242" />
              <polygon points="545,292 560,256 575,292" />
              <polygon points="538,342 552,306 566,342" />
              <polygon points="512,382 528,348 544,382" />
            </g>

            {/* Murray & Darling Rivers */}
            <path d="M530,275 Q488,325 452,378" fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M522,352 Q482,362 452,378" fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />

            {/* Sea & Gulf Labels */}
            <text x="360" y="75" textAnchor="middle" fontSize="17" fontWeight="800" fill="#0369a1">بحر أرافورا</text>
            <text x="415" y="142" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0369a1">خليج كاربنتاريا</text>
            <text x="345" y="405" textAnchor="middle" fontSize="14" fontWeight="800" fill="#0369a1">الخليج الأسترالي الكبير</text>
            <text x="108" y="300" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0369a1">المحيط الهندي</text>
            <text x="690" y="275" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0369a1">المحيط الهادي</text>

            {showAllLabels && (
              <g fontSize="13" fontWeight="800" fill="#1e293b">
                <text x="285" y="268" textAnchor="middle">الهضبة الغربية</text>
                <text x="580" y="295" textAnchor="start">جبال الحاجز الكبير</text>
                <text x="478" y="352" textAnchor="middle">نهرا مري ودارلنج</text>
                <text x="525" y="482" textAnchor="middle">تسمانيا</text>
                <text x="695" y="490" textAnchor="middle">نيوزيلندا</text>
              </g>
            )}
          </g>
        )}

        {continent === 'antarctica' && (
          <g>
            {/* Antarctic Circle */}
            <circle cx="400" cy="280" r="215" fill="none" stroke="#0284c7" strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />
            <text x="635" y="280" fontSize="13" fontWeight="800" fill="#0369a1">الدائرة القطبية الجنوبية</text>

            {/* Antarctica Landmass */}
            <path
              d="M210,120 L255,148 L295,182 L338,145 L410,125 L495,140 L552,188 L565,262 L542,340 L488,395 L435,382 L405,425 L368,395 L302,382 L252,325 L245,255 L270,210 L225,165 Z"
              fill="url(#iceGrad)"
              stroke="#0284c7"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            {/* Ice Shelf / Contour */}
            <circle cx="400" cy="270" r="78" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="5 5" />
            <circle cx="400" cy="270" r="6" fill="#0f766e" />
            <text x="400" y="255" textAnchor="middle" fontSize="15" fontWeight="900" fill="#0f766e">
              القطب الجنوبي
            </text>

            <text x="150" y="135" textAnchor="middle" fontSize="17" fontWeight="800" fill="#0369a1">
              المحيط القطبي الجنوبي
            </text>
            <text x="645" y="455" textAnchor="middle" fontSize="17" fontWeight="800" fill="#0369a1">
              المحيط القطبي الجنوبي
            </text>
          </g>
        )}

        {/* Feature Mask Overlay */}
        {typeof markerX === 'number' && typeof markerY === 'number' && (
          <g>
            {!revealed ? (
              <g
                transform={`translate(${markerX * 8}, ${markerY * 5.6})`}
                className="cursor-pointer"
              >
                <circle r="22" fill="#ea580c" stroke="#ffffff" strokeWidth="3.5" />
                <text
                  x="0"
                  y="7"
                  textAnchor="middle"
                  fontSize="22"
                  fontWeight="900"
                  fill="#ffffff"
                >
                  ؟
                </text>
              </g>
            ) : (
              <g transform={`translate(${markerX * 8}, ${markerY * 5.6})`}>
                <rect
                  x="-76"
                  y="-19"
                  width="152"
                  height="38"
                  rx="12"
                  fill="#047857"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
                <text
                  x="0"
                  y="6"
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="900"
                  fill="#ffffff"
                >
                  {featureLabel}
                </text>
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};

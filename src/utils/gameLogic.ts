export function shuffleArray<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export function computeScorePercentage(correct: number, total: number): number {
  if (total <= 0) return 0;
  const clamped = Math.max(0, Math.min(correct, total));
  return Math.round((clamped / total) * 100);
}

export function getPerformanceFeedback(percentage: number): {
  title: string;
  subtitle: string;
  celebrate: boolean;
} {
  if (percentage >= 90) {
    return {
      title: 'ممتاز! عبقري الجغرافيا',
      subtitle: 'أداء رائع وإتقان كامل لموقع ومظاهر سطح قارات العالم الجديد.',
      celebrate: true,
    };
  }
  if (percentage >= 70) {
    return {
      title: 'أحسنت! نتيجة مشرفة',
      subtitle: 'مستوى متميز جداً، راجع الأخطاء القليلة لتصل إلى الدرجة النهائية.',
      celebrate: true,
    };
  }
  if (percentage >= 50) {
    return {
      title: 'جيد! واصل التدريب',
      subtitle: 'بداية طيبة، يمكنك مراجعة ملخص الدرس والخرائط ثم المحاولة مجدداً.',
      celebrate: false,
    };
  }
  return {
    title: 'تحتاج إلى مراجعة سريعة',
    subtitle: 'استعرض ملخص قارات العالم الجديد وتابع الأخطاء بالأسفل ثم أعد التحدي.',
    celebrate: false,
  };
}

export function normalizeTeamName(name: string, fallback: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function evaluateTeamDuelWinner(
  team0Score: number,
  team1Score: number,
  team0Name: string,
  team1Name: string
): {
  winnerIndex: 0 | 1 | 'draw';
  headline: string;
  badge: string;
} {
  if (team0Score > team1Score) {
    return {
      winnerIndex: 0,
      headline: `فوز مستحق لفريق ${team0Name}`,
      badge: 'الفائز بالمركز الأول',
    };
  }
  if (team1Score > team0Score) {
    return {
      winnerIndex: 1,
      headline: `فوز مستحق لفريق ${team1Name}`,
      badge: 'الفائز بالمركز الأول',
    };
  }
  return {
    winnerIndex: 'draw',
    headline: 'تعادل مثير بين الفريقين!',
    badge: 'تعادل',
  };
}

export function validateShareName(name: string): {
  valid: boolean;
  cleanName: string;
  error?: string;
} {
  const cleanName = name.trim();
  if (cleanName.length < 2) {
    return {
      valid: false,
      cleanName,
      error: 'يرجى كتابة اسم الطالب أولاً (حرفين على الأقل) قبل الإرسال.',
    };
  }
  return {
    valid: true,
    cleanName,
  };
}

export function buildWhatsappShareUrl(params: {
  studentName: string;
  gameTitle: string;
  score: number;
  total: number;
  phone?: string;
}): string {
  const pct = computeScorePercentage(params.score, params.total);
  const message = [
    `السلام عليكم أستاذ أحمد نورالدين`,
    `الطالب/ة: ${params.studentName.trim()}`,
    `النشاط: ${params.gameTitle} (قارات العالم الجديد - الصف الثالث الإعدادي)`,
    `الدرجة: ${params.score} من ${params.total} (${pct}%)`,
  ].join('\n');

  const encoded = encodeURIComponent(message);
  if (params.phone && params.phone.trim().length > 0) {
    return `https://wa.me/${params.phone.replace(/\D/g, '')}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

export function computeTimerPercent(remainingMs: number, totalMs: number): number {
  if (totalMs <= 0) return 0;
  return Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
}

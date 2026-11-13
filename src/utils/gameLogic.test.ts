import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shuffleArray,
  computeScorePercentage,
  getPerformanceFeedback,
  normalizeTeamName,
  evaluateTeamDuelWinner,
  validateShareName,
  buildWhatsappShareUrl,
  computeTimerPercent,
} from './gameLogic';

test('shuffleArray preserves all items without mutating original array', () => {
  const source = [1, 2, 3, 4, 5];
  const shuffled = shuffleArray(source, () => 0.42);
  assert.deepEqual(source, [1, 2, 3, 4, 5]);
  assert.equal(shuffled.length, source.length);
  assert.deepEqual([...shuffled].sort((a, b) => a - b), source);
});

test('computeScorePercentage clamps and handles zero total safely', () => {
  assert.equal(computeScorePercentage(0, 0), 0);
  assert.equal(computeScorePercentage(7, 10), 70);
  assert.equal(computeScorePercentage(12, 10), 100);
  assert.equal(computeScorePercentage(-2, 10), 0);
});

test('getPerformanceFeedback categorizes scores accurately', () => {
  assert.equal(getPerformanceFeedback(95).celebrate, true);
  assert.equal(getPerformanceFeedback(70).celebrate, true);
  assert.equal(getPerformanceFeedback(60).celebrate, false);
  assert.equal(getPerformanceFeedback(30).celebrate, false);
});

test('evaluateTeamDuelWinner handles Team 0 win, Team 1 win, and draw', () => {
  assert.equal(evaluateTeamDuelWinner(8, 5, 'الأبطال', 'النسور').winnerIndex, 0);
  assert.equal(evaluateTeamDuelWinner(4, 9, 'الأبطال', 'النسور').winnerIndex, 1);
  assert.equal(evaluateTeamDuelWinner(6, 6, 'الأبطال', 'النسور').winnerIndex, 'draw');
});

test('normalizeTeamName falls back only when empty or whitespace', () => {
  assert.equal(normalizeTeamName('  فريق النيل  ', 'الفريق الأول'), 'فريق النيل');
  assert.equal(normalizeTeamName('   ', 'الفريق الأول'), 'الفريق الأول');
});

test('validateShareName rejects empty or single-char names and accepts valid names', () => {
  assert.equal(validateShareName('').valid, false);
  assert.equal(validateShareName('أ').valid, false);
  const ok = validateShareName('  يوسف محمد  ');
  assert.equal(ok.valid, true);
  assert.equal(ok.cleanName, 'يوسف محمد');
});

test('buildWhatsappShareUrl encodes Arabic text and optional phone', () => {
  const url = buildWhatsappShareUrl({
    studentName: 'سارة أحمد',
    gameTitle: 'الاختيار من متعدد',
    score: 9,
    total: 10,
  });
  assert.ok(url.startsWith('https://wa.me/?text='));
  assert.ok(decodeURIComponent(url).includes('سارة أحمد'));
  assert.ok(decodeURIComponent(url).includes('90%'));
});

test('computeTimerPercent bounds between 0 and 100', () => {
  assert.equal(computeTimerPercent(6000, 12000), 50);
  assert.equal(computeTimerPercent(-500, 12000), 0);
  assert.equal(computeTimerPercent(15000, 12000), 100);
  assert.equal(computeTimerPercent(1000, 0), 0);
});

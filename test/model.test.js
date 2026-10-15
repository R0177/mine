import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, validState, summary, safeUrl, localDate } from '../src/model.js';
test('empty workspace round-trips as a valid backup', () => {
  assert.equal(validState(JSON.parse(JSON.stringify(initialState()))), true);
  assert.deepEqual(summary([]), { minutes: 0, today: 0, days: 0 });
});
test('statistics count distinct dates and selected-day minutes', () => {
  assert.deepEqual(summary([{ date: '2026-10-15', minutes: 30 }, { date: '2026-10-15', minutes: 20 }, { date: '2026-10-14', minutes: 45 }], '2026-10-15'), { minutes: 95, today: 50, days: 2 });
});
test('backups reject malformed entries and executable links', () => {
  const state = initialState();
  state.projects.push({ id: '1', title: 'Essay', category: '写作', description: 'Practice', url: 'https://example.com' });
  assert.equal(validState(state), true);
  state.projects[0].url = 'javascript:alert(1)';
  assert.equal(validState(state), false);
  assert.equal(validState({ ...initialState(), sessions: [{ minutes: -1 }] }), false);
  assert.equal(validState({ ...initialState(), goal: '<script>' }), false);
  assert.equal(validState(null), false);
});
test('only web links are allowed and dates use the local calendar', () => {
  assert.equal(safeUrl('https://example.com/work'), true);
  assert.equal(safeUrl('data:text/html,test'), false);
  assert.equal(safeUrl('/relative'), false);
  assert.equal(localDate(new Date(2026, 0, 2, 12)), '2026-01-02');
});

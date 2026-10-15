export const skills = ['听力', '阅读', '写作', '口语'];
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function initialState() {
  return { version: 1, goal: '7.0', exam: '', tasks: [], sessions: [], projects: [] };
}
export function validState(value) {
  return !!value && value.version === 1 && typeof value.goal === 'string' && /^(?:[0-8](?:\.0|\.5)?|9(?:\.0)?)$/.test(value.goal) && typeof value.exam === 'string' && (value.exam === '' || /^\d{4}-\d{2}-\d{2}$/.test(value.exam)) &&
    Array.isArray(value.tasks) && value.tasks.every(t => t && typeof t.id === 'string' && typeof t.title === 'string' && skills.includes(t.skill) && typeof t.done === 'boolean') &&
    Array.isArray(value.sessions) && value.sessions.every(s => s && typeof s.id === 'string' && skills.includes(s.skill) && Number.isInteger(s.minutes) && s.minutes > 0 && s.minutes <= 1440 && typeof s.note === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s.date)) &&
    Array.isArray(value.projects) && value.projects.every(p => p && typeof p.id === 'string' && typeof p.title === 'string' && typeof p.category === 'string' && typeof p.description === 'string' && typeof p.url === 'string' && (!p.url || safeUrl(p.url)));
}
export function safeUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol); } catch { return false; }
}
export function summary(sessions, today = localDate()) {
  return { minutes: sessions.reduce((sum, s) => sum + s.minutes, 0), today: sessions.filter(s => s.date === today).reduce((sum, s) => sum + s.minutes, 0), days: new Set(sessions.map(s => s.date)).size };
}

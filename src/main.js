import './style.css';
import { skills, localDate, initialState, validState, safeUrl, summary } from './model.js';

const KEY = 'study-studio-v1';
let state = initialState();
let storageWarning = '';
try { const saved = localStorage.getItem(KEY); if (saved) { const parsed = JSON.parse(saved); if (!validState(parsed)) throw new Error(); state = parsed; } } catch { storageWarning = '无法读取本地记录。请先导出或检查浏览器存储，再保存新内容。'; }
let page = 'overview';
let filter = '全部';
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icons = { overview: '◫', ielts: '◉', portfolio: '▧' };
const pages = { overview: '学习概览', ielts: '雅思学习', portfolio: '个人作品集' };
const options = () => skills.map(s => `<option>${s}</option>`).join('');
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); storageWarning = ''; } catch { storageWarning = '浏览器存储失败，本次更改仅在当前页面保留，请导出备份。'; }
  render();
}
function notify(message) { const el = document.querySelector('#toast'); el.textContent = message; el.hidden = false; clearTimeout(notify.timer); notify.timer = setTimeout(() => el.hidden = true, 4000); }
function taskList() {
  return state.tasks.length ? state.tasks.map(t => `<li class="task ${t.done ? 'done' : ''}"><label><input type="checkbox" data-task="${esc(t.id)}" ${t.done ? 'checked' : ''}><span>${esc(t.title)}<small>${esc(t.skill)}练习</small></span></label><button class="icon-button" data-delete-task="${esc(t.id)}" aria-label="删除任务 ${esc(t.title)}">×</button></li>`).join('') : '<li class="empty">留一点时间给进步。添加你的第一个学习任务。</li>';
}
function overview() {
  const stats = summary(state.sessions);
  const days = state.exam ? Math.ceil((new Date(`${state.exam}T00:00:00`) - new Date(`${localDate()}T00:00:00`)) / 86400000) : null;
  return `<section class="hero"><div><div class="eyebrow">A LITTLE BETTER, EVERY DAY</div><h2>让学习有方向，<br>让成长有迹可循<span>。</span></h2><p>在这里准备下一场考试，也收集属于自己的闪光时刻。</p><button class="primary" data-nav="ielts">开始今天的学习 <span>↗</span></button></div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="art-note">keep<br><em>growing.</em><span>学习 · 记录 · 创作</span></div><div class="star">✳︎</div><div class="art-tag">ONE STEP AT A TIME</div></div></section>
  <section class="stats" aria-label="学习统计"><article><span>雅思目标分数</span><strong>${esc(state.goal)}<small> / 9.0</small></strong><div>为下一段旅程做准备</div></article><article><span>今日专注</span><strong>${stats.today}<small> 分钟</small></strong><div>累计 ${stats.minutes} 分钟的努力</div></article><article><span>学习足迹</span><strong>${stats.days}<small> 天</small></strong><div>每一次练习都算数</div></article><article><span>${days === null ? '作品收集' : '距离考试'}</span><strong>${days === null ? state.projects.length : Math.max(0, days)}<small> ${days === null ? '件' : '天'}</small></strong><div>${days === null ? '慢慢构建你的作品世界' : days < 0 ? '考试日期已过，可更新目标' : esc(state.exam)}</div></article></section>
  <div class="two-column"><section class="panel"><div class="section-head"><div><div class="eyebrow">MY STUDY PLAN</div><h3>下一步，小小的进步</h3></div><button class="text-button" data-action="task">＋ 添加任务</button></div><ul class="tasks">${taskList()}</ul></section><section class="panel note-panel"><div class="eyebrow">A SPACE FOR YOUR IDEAS</div><h3>不止于一个分数</h3><p>文章、设计、代码，或者一次有趣的探索。把值得留下的作品，整理成自己的故事。</p><button class="text-button" data-nav="portfolio">整理我的作品集 ↗</button><div class="note-decoration" aria-hidden="true">✴︎</div></section></div>
  <section class="section-head bottom-heading"><div><div class="eyebrow">YOUR LEARNING TOOLKIT</div><h3>四项能力，循序向前</h3></div><button class="text-button" data-nav="ielts">进入雅思学习 →</button></section><div class="skill-grid">${skillCards()}</div>`;
}
function skillCards() {
  const descriptions = ['精听一句，听懂更多', '读懂逻辑，也读懂世界', '把想法写得清晰有力', '开口表达自己的观点'];
  return skills.map((s, i) => `<button class="skill-card skill-${i}" data-record="${s}"><span class="skill-number">0${i + 1} / ${['LISTENING','READING','WRITING','SPEAKING'][i]}</span><strong>${s}<span>↗</span></strong><p>${descriptions[i]}</p><small>已练习 ${state.sessions.filter(x => x.skill === s).reduce((sum, x) => sum + x.minutes, 0)} 分钟 · 点击记录</small></button>`).join('');
}
function ielts() {
  return `<div class="page-heading"><div class="eyebrow">THE ROAD TO YOUR NEXT CHAPTER</div><h2>每天一点，离目标更近。</h2><p>制定计划，记录练习，用自己的节奏稳步前进。</p></div><section class="goal-banner"><div><span class="eyebrow">MY IELTS GOAL</span><h3>目标 ${esc(state.goal)} 分</h3><p>${state.exam ? `考试日期：${esc(state.exam)}` : '设定考试日期，给努力一个时间坐标。'}</p></div><button class="secondary" data-action="goal">调整学习目标 ↗</button></section><div class="skill-grid">${skillCards()}</div><div class="two-column study-columns"><section class="panel"><div class="section-head"><h3>我的学习计划</h3><button class="text-button" data-action="task">＋ 添加任务</button></div><ul class="tasks">${taskList()}</ul></section><section class="panel"><div class="section-head"><h3>练习记录</h3><button class="text-button" data-record="听力">＋ 记录练习</button></div><div class="session-list">${state.sessions.length ? [...state.sessions].reverse().map(s => `<article class="session"><div><span class="pill">${esc(s.skill)}</span><strong>${s.minutes} 分钟</strong><button class="icon-button" data-delete-session="${esc(s.id)}" aria-label="删除练习记录">×</button></div><p>${esc(s.note || '完成了一次专注练习。')}</p><small>${esc(s.date)}</small></article>`).join('') : '<div class="empty">还没有练习记录。完成练习后，记下时长和收获。</div>'}</div></section></div><section class="panel resources"><h3>官方学习资源</h3><p>使用官方材料了解考试题型与评分标准。</p><a href="https://ielts.org/take-a-test/preparation-resources" target="_blank" rel="noopener noreferrer">IELTS 备考资源 ↗</a><a href="https://learnenglish.britishcouncil.org/" target="_blank" rel="noopener noreferrer">British Council 英语学习 ↗</a></section>`;
}
function portfolio() {
  const categories = ['全部', ...new Set(state.projects.map(p => p.category))];
  const projects = state.projects.filter(p => filter === '全部' || p.category === filter);
  return `<div class="page-heading portfolio-heading"><div><div class="eyebrow">THINGS I HAVE MADE</div><h2>把想法，变成作品。</h2><p>收集每一次探索，慢慢拼出属于自己的创作地图。</p></div><button class="primary" data-action="project">＋ 添加作品</button></div><div class="filters" aria-label="作品分类">${categories.map(c => `<button class="${filter === c ? 'active' : ''}" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="project-grid">${projects.length ? projects.map((p, i) => `<article class="project-card"><div class="project-cover cover-${i % 3}" aria-hidden="true"><span>${esc(p.category)}</span><strong>${String(i + 1).padStart(2, '0')}</strong><div>✳︎</div></div><div class="project-body"><span class="eyebrow">${esc(p.category)}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="project-actions">${p.url && safeUrl(p.url) ? `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">查看作品 ↗</a>` : '<span>尚未添加链接</span>'}<button class="text-button" data-edit-project="${esc(p.id)}">编辑</button><button class="text-button muted" data-delete-project="${esc(p.id)}">删除</button></div></div></article>`).join('') : '<div class="portfolio-empty"><div aria-hidden="true">▧</div><h3>你的第一件作品，会是什么？</h3><p>可以是一篇英语文章、一份设计，或一个独立项目。</p><button class="secondary" data-action="project">添加第一件作品 ↗</button></div>'}</div>`;
}
function render() {
  document.querySelector('#app').innerHTML = `<aside class="sidebar"><a class="brand" href="#overview" aria-label="Study Studio 首页"><span class="brand-icon">s<span>✳︎</span></span><span>study studio<small>学习与创作的日常</small></span></a><div class="nav-label">MY WORKSPACE</div><nav aria-label="主导航">${Object.entries(pages).map(([key, name]) => `<button data-nav="${key}" class="nav-item ${page === key ? 'selected' : ''}" ${page === key ? 'aria-current="page"' : ''}><span>${icons[key]}</span>${name}<span class="nav-arrow">↗</span></button>`).join('')}</nav><div class="sidebar-quote"><span>“</span><p>积跬步，<br>以至千里。</p><small>MAKE ROOM TO GROW</small></div><div class="sidebar-bottom"><div class="avatar">M</div><div>我的个人空间<small>持续学习，自由创作</small></div><span class="online-dot"></span></div></aside><main><header><div class="breadcrumb">我的空间 <span>/</span> <strong>${pages[page]}</strong></div><div class="header-date">${new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date())}</div></header><div class="content">${storageWarning ? `<p class="warning" role="alert">${esc(storageWarning)}</p>` : ''}${page === 'overview' ? overview() : page === 'ielts' ? ielts() : portfolio()}<footer><span>保持好奇，慢慢生长。 <span class="footer-star">✳︎</span></span><div><button class="text-button" data-action="export">导出备份</button><button class="text-button" data-action="import">导入数据</button></div><small>数据保存在当前浏览器，建议定期备份。</small></footer></div></main><dialog id="editor"></dialog><div id="toast" role="status" hidden></div><input id="import-file" type="file" accept="application/json,.json" hidden>`;
  bind();
}
function navigate(next) { page = next; location.hash = next; render(); window.scrollTo(0, 0); }
function openForm(kind, value = '') {
  const project = kind === 'project' && value ? state.projects.find(p => p.id === value) : null;
  const titles = { goal: '为自己设定一个目标', task: '添加学习任务', record: '记录一次练习', project: project ? '编辑作品' : '添加一件作品' };
  let fields = '';
  if (kind === 'goal') fields = `<label>雅思目标分数<input name="goal" type="number" min="0" max="9" step="0.5" value="${esc(state.goal)}" required></label><label>考试日期（选填）<input name="exam" type="date" value="${esc(state.exam)}"></label>`;
  if (kind === 'task') fields = `<label>想完成什么？<input name="title" maxlength="160" placeholder="例如：完成一套 Cambridge 听力练习" required></label><label>练习科目<select name="skill">${options()}</select></label>`;
  if (kind === 'record') fields = `<div class="form-row"><label>练习科目<select name="skill">${options()}</select></label><label>学习时长（分钟）<input name="minutes" type="number" min="1" max="1440" value="30" required></label></div><label>练习日期<input name="date" type="date" value="${localDate()}" max="${localDate()}" required></label><label>今天有什么收获？<textarea name="note" maxlength="2000" rows="4" placeholder="记录练习内容、错题，或下一步想改进的地方…"></textarea></label>`;
  if (kind === 'project') fields = `<label>作品名称<input name="title" maxlength="120" value="${esc(project?.title || '')}" placeholder="给这份作品一个名字" required></label><label>分类<input name="category" maxlength="30" value="${esc(project?.category || '')}" placeholder="例如：英语写作、设计、代码项目" required></label><label>作品介绍<textarea name="description" maxlength="3000" rows="4" required placeholder="介绍你的想法、过程与收获">${esc(project?.description || '')}</textarea></label><label>作品链接（选填）<input name="url" type="url" value="${esc(project?.url || '')}" placeholder="https://…"></label>`;
  const dialog = document.querySelector('#editor');
  dialog.innerHTML = `<form id="entry-form"><div class="section-head"><h3>${titles[kind]}</h3><button type="button" class="icon-button" id="close-dialog" aria-label="关闭">×</button></div>${fields}<p class="form-error" role="alert"></p><div class="form-actions"><button type="button" class="secondary" id="cancel-dialog">取消</button><button class="primary" type="submit">保存${kind === 'record' ? '记录' : ''} ↗</button></div></form>`;
  if (kind === 'record') dialog.querySelector('[name="skill"]').value = value || '听力';
  dialog.querySelector('#close-dialog').onclick = () => dialog.close();
  dialog.querySelector('#cancel-dialog').onclick = () => dialog.close();
  dialog.querySelector('form').onsubmit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    Object.keys(data).forEach(k => data[k] = data[k].trim());
    if (Object.entries(data).some(([k, v]) => ['title','category','description'].includes(k) && !v)) { dialog.querySelector('.form-error').textContent = '请填写非空的内容。'; return; }
    if (kind === 'project' && data.url && !safeUrl(data.url)) { dialog.querySelector('.form-error').textContent = '请使用 http 或 https 开头的链接。'; return; }
    if (kind === 'goal') { state.goal = Number(data.goal).toFixed(1); state.exam = data.exam; }
    if (kind === 'task') state.tasks.push({ ...data, id: crypto.randomUUID(), done: false });
    if (kind === 'record') state.sessions.push({ ...data, id: crypto.randomUUID(), minutes: Number(data.minutes) });
    if (kind === 'project') { if (project) Object.assign(project, data); else state.projects.push({ ...data, id: crypto.randomUUID() }); filter = '全部'; }
    dialog.close(); save(); notify('已保存，继续向前一点。');
  };
  dialog.showModal();
}
function bind() {
  document.querySelectorAll('[data-nav]').forEach(el => el.onclick = () => navigate(el.dataset.nav));
  document.querySelectorAll('[data-task]').forEach(el => el.onchange = () => { state.tasks.find(t => t.id === el.dataset.task).done = el.checked; save(); });
  for (const [attr, collection] of [['delete-task','tasks'],['delete-session','sessions'],['delete-project','projects']]) {
    document.querySelectorAll(`[data-${attr}]`).forEach(el => el.onclick = () => { if (!confirm('确定删除这条内容吗？')) return; state[collection] = state[collection].filter(x => x.id !== el.getAttribute(`data-${attr}`)); if (collection === 'projects') filter = '全部'; save(); });
  }
  document.querySelectorAll('[data-record]').forEach(el => el.onclick = () => openForm('record', el.dataset.record));
  document.querySelectorAll('[data-edit-project]').forEach(el => el.onclick = () => openForm('project', el.dataset.editProject));
  document.querySelectorAll('[data-filter]').forEach(el => el.onclick = () => { filter = el.dataset.filter; render(); });
  document.querySelectorAll('[data-action]').forEach(el => el.onclick = () => {
    const action = el.dataset.action;
    if (['task','goal','project'].includes(action)) openForm(action);
    if (action === 'export') { const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = `study-studio-${localDate()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
    if (action === 'import') document.querySelector('#import-file').click();
  });
  document.querySelector('#import-file').onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    try { if (file.size > 5 * 1024 * 1024) throw new Error(); const data = JSON.parse(await file.text()); if (!validState(data)) throw new Error(); if (!confirm('导入将替换当前所有学习记录与作品，建议先导出备份。继续吗？')) return; state = data; filter = '全部'; save(); notify('数据已导入。'); } catch { notify('导入失败：请选择有效的 Study Studio JSON 备份（不超过 5 MB）。'); }
    e.target.value = '';
  };
}
window.addEventListener('hashchange', () => { const next = location.hash.slice(1); if (Object.hasOwn(pages, next) && next !== page) { page = next; render(); } });
if (Object.hasOwn(pages, location.hash.slice(1))) page = location.hash.slice(1);
render();

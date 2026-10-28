/* 语境英语 · 应用层
 * 无构建、无依赖、无网络请求。数据全在本地，进度存 localStorage。
 */
(function () {
  'use strict';

  var D = window.APP_DATA;
  if (!D) return;

  var ARTS = D.articles;
  var artById = {};
  var vocabById = {};
  ARTS.forEach(function (a) {
    artById[a.id] = a;
    a.vocab.forEach(function (v) { v.articleId = a.id; vocabById[v.id] = v; });
  });

  /* ============================================================
   * 0. 小工具
   * ============================================================ */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function escapeRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(id) { return document.getElementById(id); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  var DAY = 86400000;
  function startOfDay(t) { var d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function fmtDate(ts) { var d = new Date(ts); return (d.getMonth() + 1) + '月' + d.getDate() + '日'; }

  var toastTimer = null;
  function toast(msg) {
    var t = el('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1900);
  }

  /* ============================================================
   * 1. 进度存储
   * ============================================================ */
  var KEY = 'context-english.v1';
  var state = loadState();

  function blankState() { return { v: 1, words: {}, arts: {}, writing: [], meta: { lastBackup: 0 } }; }
  function loadState() {
    var base = blankState();
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return base;
      var s = JSON.parse(raw);
      if (!s || typeof s !== 'object') return base;
      return {
        v: 1,
        words: s.words && typeof s.words === 'object' ? s.words : {},
        arts: s.arts && typeof s.arts === 'object' ? s.arts : {},
        writing: Array.isArray(s.writing) ? s.writing : [],
        meta: s.meta && typeof s.meta === 'object'
          ? { lastBackup: Number(s.meta.lastBackup) || 0 }
          : { lastBackup: 0 }
      };
    } catch (e) { return base; }
  }
  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 隐身模式等 */ }
  }

  function artState(id) {
    if (!state.arts[id] || typeof state.arts[id] !== 'object') state.arts[id] = { stages: {}, draft: '' };
    if (!state.arts[id].stages) state.arts[id].stages = {};
    return state.arts[id];
  }
  function stageDone(id, k) { return !!artState(id).stages[k]; }
  function markStage(id, k, silent) {
    var s = artState(id);
    if (s.stages[k]) return;
    s.stages[k] = true;
    saveState();
    if (!silent) toast('已完成「' + ({ read: '读', listen: '听', speak: '说', write: '写' }[k] || k) + '」');
  }

  /* ---------- 间隔重复（简化 FSRS：6 级，间隔 0.25 / 1 / 3 / 7 / 16 / 35 天） ---------- */
  var INTERVALS = [0.25, 1, 3, 7, 16, 35];

  function ensureWord(id) {
    if (!state.words[id]) {
      state.words[id] = { level: 0, due: Date.now(), reps: 0, lapses: 0, savedAt: Date.now(), last: 0 };
    }
    return state.words[id];
  }
  function isSaved(id) { return !!state.words[id]; }

  function dueList() {
    var now = Date.now();
    return Object.keys(state.words)
      .filter(function (id) { return state.words[id] && state.words[id].due <= now && vocabById[id]; })
      .sort(function (a, b) { return state.words[a].due - state.words[b].due; });
  }
  function gradeWord(id, g) {
    var w = ensureWord(id);
    w.reps += 1;
    w.last = Date.now();
    if (g === 'forgot') {
      w.lapses += 1;
      w.level = Math.max(0, w.level - 1);
      w.due = Date.now() + 12 * 3600000;
    } else if (g === 'hard') {
      w.due = Date.now() + Math.max(0.25, INTERVALS[w.level] * 0.5) * DAY;
    } else {
      w.level = Math.min(5, w.level + 1);
      w.due = Date.now() + INTERVALS[w.level] * DAY;
    }
    saveState();
  }

  /* ============================================================
   * 2. 朗读 / 录音 / 识别
   * ============================================================ */
  var synth = window.speechSynthesis || null;
  var voice = null;
  var speakGen = 0;

  function pickVoice() {
    if (!synth || !synth.getVoices) return;
    var vs = synth.getVoices();
    if (!vs || !vs.length) return;
    var rules = [
      function (v) { return /^en-GB/i.test(v.lang) && /google|natural|premium|enhanced/i.test(v.name); },
      function (v) { return /^en-US/i.test(v.lang) && /google|natural|premium|enhanced/i.test(v.name); },
      function (v) { return /^en-GB/i.test(v.lang); },
      function (v) { return /^en-US/i.test(v.lang); },
      function (v) { return /^en/i.test(v.lang); }
    ];
    for (var i = 0; i < rules.length; i++) {
      for (var j = 0; j < vs.length; j++) {
        if (rules[i](vs[j])) { voice = vs[j]; return; }
      }
    }
  }
  if (synth) {
    pickVoice();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', pickVoice);
    else synth.onvoiceschanged = pickVoice;
  }

  function speakSeq(text, onEnd, rate) {
    if (!synth) { if (onEnd) onEnd(); return; }
    var my = ++speakGen;
    try { synth.cancel(); } catch (e) {}
    var u = new SpeechSynthesisUtterance(String(text));
    u.lang = (voice && voice.lang) || 'en-US';
    if (voice) u.voice = voice;
    u.rate = rate == null ? 0.94 : rate;
    u.pitch = 1;
    u.onend = function () { if (my === speakGen && onEnd) onEnd(); };
    u.onerror = function () { if (my === speakGen && onEnd) onEnd(); };
    try { synth.speak(u); } catch (e) { if (onEnd) onEnd(); }
  }
  function speakOnce(text, rate) { speakSeq(text, null, rate); }
  function stopSpeak() { speakGen++; try { if (synth) synth.cancel(); } catch (e) {} }

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  var REC = { active: false, key: '', rec: null, chunks: [], stream: null, asr: null, url: '', asrText: '' };
  var recUrls = {};

  function wordsOf(s) {
    return String(s || '').toLowerCase().replace(/[^a-z'’ ]/g, ' ').split(/\s+/).filter(Boolean);
  }

  /* 逐词比对：返回 [['hit'|'miss'|'extra', word]...] */
  function lcsDiff(a, b) {
    var n = a.length, m = b.length, i, j;
    var dp = [];
    for (i = 0; i <= n; i++) dp.push(new Uint16Array(m + 1));
    for (i = n - 1; i >= 0; i--) {
      for (j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    var out = [];
    i = 0; j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { out.push(['hit', a[i]]); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push(['miss', a[i]]); i++; }
      else { out.push(['extra', b[j]]); j++; }
    }
    while (i < n) out.push(['miss', a[i++]]);
    while (j < m) out.push(['extra', b[j++]]);
    return out;
  }
  function diffHTML(target, typed) {
    var d = lcsDiff(wordsOf(target), wordsOf(typed));
    return d.map(function (x) {
      var cls = x[0] === 'hit' ? 'hit' : x[0] === 'miss' ? 'miss' : 'extra';
      return '<span class="' + cls + '">' + esc(x[1]) + '</span>';
    }).join(' ');
  }
  function matchScore(target, typed) {
    var d = lcsDiff(wordsOf(target), wordsOf(typed));
    var hit = d.filter(function (x) { return x[0] === 'hit'; }).length;
    var total = wordsOf(target).length || 1;
    return Math.round(hit / total * 100);
  }

  /* ============================================================
   * 3. 路由
   * ============================================================ */
  var cur = { artId: null, stage: 'read' };
  var P = { idx: 0, playing: false, reveal: false, gen: 0 };
  var R = null;

  function parseHash() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    var p = h.split('/').filter(Boolean);
    return { name: p[0] || 'home', arg: p[1] || '', sub: p[2] || '' };
  }
  function go(path) {
    if (('#' + path) === location.hash) { render(); return; }
    location.hash = path;
  }

  /* ============================================================
   * 4. 图标
   * ============================================================ */
  var I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.4 12 3l9 7.4"/><path d="M5.4 9.2V21h13.2V9.2"/><path d="M9.6 21v-6.2h4.8V21"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.6C10.6 5.3 8.4 4.6 5.6 4.6H4v13.8h1.6c2.8 0 5 .7 6.4 2 1.4-1.3 3.6-2 6.4-2H20V4.6h-1.6c-2.8 0-5 .7-6.4 2Z"/><path d="M12 6.6v13.8"/></svg>',
    review: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.5a8 8 0 1 0-2.6 5.9"/><path d="M20 5.5v6h-6"/></svg>',
    note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3.5h7.6l4.4 4.4v12.6H6.5z"/><path d="M14 3.5v4.6h4.6"/><path d="M9.4 13h6"/><path d="M9.4 16.4h4"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="3.6" height="14" rx="1.2"/><rect x="13.4" y="5" width="3.6" height="14" rx="1.2"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.4L12 5.5v13L7.4 14.5H4z"/><path d="M15.6 9.2a4 4 0 0 1 0 5.6"/><path d="M18.2 6.6a7.6 7.6 0 0 1 0 10.8"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="10.5" rx="3"/><path d="M5.5 11.2a6.5 6.5 0 0 0 13 0"/><path d="M12 17.8V21"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="6.5" width="11" height="11" rx="2"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.4 4.4L19 7.4"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5.5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="18.5" r="1.7"/></svg>'
  };

  /* ============================================================
   * 5. 文案小工具
   * ============================================================ */
  function artDone(id) { return stageDone(id, 'read'); }
  function nextStage(a) {
    var order = ['read', 'listen', 'speak', 'write'];
    for (var i = 0; i < order.length; i++) if (!stageDone(a.id, order[i])) return order[i];
    return 'read';
  }
  function stageLabel(k) { return { read: '读', listen: '听', speak: '说', write: '写', grammar: '语法' }[k] || k; }

  function formIndex(a) {
    if (a.__idx) return a.__idx;
    var m = {};
    a.vocab.forEach(function (v) {
      (v.forms || [v.word]).forEach(function (f) { m[String(f).toLowerCase()] = v; });
    });
    a.__idx = m;
    return m;
  }

  function annotate(text, a) {
    var idx = formIndex(a);
    var out = '', last = 0, m;
    var re = /[A-Za-z][A-Za-z'’\-]*/g;
    while ((m = re.exec(text))) {
      out += esc(text.slice(last, m.index));
      var raw = m[0], base = raw, tail = '';
      var pm = raw.match(/^(.+?)(['’]s)$/);
      if (pm) { base = pm[1]; tail = pm[2]; }
      var hit = idx[base.toLowerCase()];
      if (hit) {
        out += '<button class="w" data-act="word" data-id="' + esc(hit.id) + '">' + esc(base) + '</button>' + esc(tail);
      } else {
        out += esc(raw);
      }
      last = m.index + raw.length;
    }
    out += esc(text.slice(last));
    return out;
  }

  /* 把句子里的目标词包成 <b> */
  function markWord(text, e) {
    var forms = (e.forms || []).concat([e.word]).filter(Boolean)
      .map(String).sort(function (x, y) { return y.length - x.length; });
    var seen = {}, s = String(text);
    forms.forEach(function (f) {
      if (seen[f.toLowerCase()]) return;
      seen[f.toLowerCase()] = 1;
      var re = new RegExp('(^|[^A-Za-z])(' + escapeRe(f) + ')(?![A-Za-z])', 'gi');
      s = s.replace(re, function (_m, pre, w) { return pre + '\u0001' + w + '\u0002'; });
    });
    return esc(s).replace(/\u0001/g, '<b>').replace(/\u0002/g, '</b>');
  }

  /* ============================================================
   * 6. 底部导航 / 顶栏
   * ============================================================ */
  function renderTabbar(active) {
    var due = dueList().length;
    var items = [
      { k: 'home', label: '今日', icon: I.home },
      { k: 'library', label: '文章', icon: I.book },
      { k: 'review', label: '复习', icon: I.review, badge: due },
      { k: 'notebook', label: '本子', icon: I.note }
    ];
    el('tabbar').innerHTML = items.map(function (it) {
      var on = it.k === active ? ' on' : '';
      var badge = it.badge ? '<span class="badge">' + it.badge + '</span>' : '';
      return '<button class="' + on.trim() + '" data-act="nav" data-id="' + it.k + '">' +
        it.icon + '<span>' + it.label + '</span>' + badge + '</button>';
    }).join('');
  }

  function setTopbar(html) { el('topbar').innerHTML = html; }

  /* ============================================================
   * 7. 单词卡（弹层 + 内联共用）
   * ============================================================ */
  function wordBody(e, opts) {
    opts = opts || {};
    var saved = isSaved(e.id);
    var w = state.words[e.id];
    var html = '';

    html += '<div class="wc-head">' +
      '<span class="word">' + esc(e.word) + '</span>' +
      '<span class="ipa">' + esc(e.ipa) + '</span>' +
      '<span class="pos">' + esc(e.pos) + '</span>' +
      '</div>';
    html += '<div class="wc-zh">' + esc(e.zh) + '</div>';
    if (e.sense) html += '<div class="wc-sense">' + esc(e.sense) + '</div>';

    if (e.sent) {
      html += '<div class="wc-block"><h4>它在文章里</h4>' +
        '<div class="quote">' + markWord(e.sent, e) + '</div></div>';
    }

    if (e.morph && e.morph.length) {
      html += '<div class="wc-block"><h4>拆开看</h4><div class="morph">';
      e.morph.forEach(function (m, i) {
        if (i) html += '<span class="plus">+</span>';
        html += '<span class="m"><b>' + esc(m.p) + '</b><span>' + esc(m.g) + '</span></span>';
      });
      html += '</div>';
      if (e.note) html += '<div class="small muted" style="margin-top:8px">' + esc(e.note) + '</div>';
      html += '</div>';
    }

    if (e.colloc && e.colloc.length) {
      html += '<div class="wc-block"><h4>怎么搭</h4><ul class="plain">';
      e.colloc.forEach(function (c) {
        html += '<li><span class="en">' + esc(c.en) + '</span><span class="zh">' + esc(c.zh) + '</span></li>';
      });
      html += '</ul></div>';
    }

    if (e.contrast) {
      html += '<div class="wc-block"><h4>别搞混</h4>' +
        '<div class="contrast"><span class="cw">' + esc(e.contrast.with) + '</span> — ' + esc(e.contrast.diff) + '</div></div>';
    }

    if (e.register) {
      html += '<div class="wc-block"><h4>场合</h4><div class="small muted">' + esc(e.register) + '</div></div>';
    }
    if (e.why) {
      html += '<div class="wc-block"><h4>作者为什么用这个词</h4><div class="small muted">' + esc(e.why) + '</div></div>';
    }

    if (!opts.noActions) {
      html += '<div class="row" style="margin-top:20px;gap:8px;flex-wrap:wrap">';
      html += '<button class="btn sm quiet" data-act="say" data-id="' + esc(e.id) + '">' + I.speaker + ' 读单词</button>';
      html += '<button class="btn sm quiet" data-act="say-sent" data-id="' + esc(e.id) + '">' + I.speaker + ' 读整句</button>';
      html += '<span class="spacer"></span>';
      if (saved) {
        var lvl = w ? w.level : 0;
        html += '<span class="chip acc">已加入 · 第 ' + (lvl + 1) + ' 级</span>';
      } else {
        html += '<button class="btn sm" data-act="save-word" data-id="' + esc(e.id) + '">' + I.plus + ' 加入生词本</button>';
      }
      html += '</div>';
    }
    return html;
  }

  function openWord(id) {
    var e = vocabById[id];
    if (!e) return;
    var root = el('sheet-root');
    root.innerHTML = '<div class="sheet-mask" data-act="close-sheet">' +
      '<div class="sheet" data-stop="1" role="dialog" aria-modal="true">' +
      '<div class="handle"></div>' +
      wordBody(e) +
      '</div></div>';
    document.body.style.overflow = 'hidden';
    var sh = $('.sheet', root);
    if (sh) sh.scrollTop = 0;
  }
  function closeSheet() {
    el('sheet-root').innerHTML = '';
    document.body.style.overflow = '';
  }

  /* ============================================================
   * 8. 首页
   * ============================================================ */
  function greeting() {
    var h = new Date().getHours();
    if (h < 5) return '还没睡';
    if (h < 11) return '早上好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    if (h < 23) return '晚上好';
    return '夜深了';
  }

  function viewHome() {
    var due = dueList();
    var learned = Object.keys(state.words).length;
    var read = ARTS.filter(function (a) { return artDone(a.id); }).length;
    var wrote = state.writing.length;
    var lastBk = (state.meta && state.meta.lastBackup) || 0;
    var daysSince = lastBk ? Math.floor((Date.now() - lastBk) / DAY) : 0;
    var needBk = learned >= 5 && (!lastBk || daysSince >= 7);

    var next = ARTS.filter(function (a) { return !stageDone(a.id, nextStage(a)); });
    var cont = next.length ? next[0] : ARTS[0];

    var h = '';
    h += '<section class="hero"><div class="greet">' + greeting() + '，今天想怎么学？</div>' +
      '<h1 class="big">一天一篇，<br>读 · 听 · 说 · 写</h1>' +
      '<p class="lead">四个动作各走一遍，才算真的读完。</p></section>';

    h += '<div class="statgrid">' +
      '<div class="stat"><b>' + learned + '</b><span>生词本</span></div>' +
      '<div class="stat"><b>' + due.length + '</b><span>待复习</span></div>' +
      '<div class="stat"><b>' + read + '/' + ARTS.length + '</b><span>读完</span></div>' +
      '</div>';

    h += '<h2 class="sect">现在做什么</h2>';

    if (due.length) {
      h += '<div class="card">' +
        '<div class="row"><div style="flex:1"><div style="font-weight:650">复习 ' + due.length + ' 个词</div>' +
        '<div class="small muted" style="margin-top:3px">只考「用出来」，不考「认出来」。约 ' + Math.max(2, Math.ceil(due.length * 0.5)) + ' 分钟。</div></div></div>' +
        '<button class="btn block" style="margin-top:14px" data-act="nav" data-id="review">开始复习</button>' +
        '</div>';
    } else {
      h += '<div class="card">' +
        '<div style="font-weight:650">今天的复习清空了</div>' +
        '<div class="small muted" style="margin-top:3px">去读一篇新的，攒几个词明天再说。</div>' +
        '<button class="btn block ghost" style="margin-top:14px" data-act="nav" data-id="library">挑一篇文章</button>' +
        '</div>';
    }

    var ns = nextStage(cont);
    h += '<div class="card">' +
      '<div class="tiny faint" style="letter-spacing:.08em">继续 · ' + esc(cont.kindLabel) + '</div>' +
      '<div style="font-weight:650;font-size:16px;margin-top:4px;line-height:1.4">' + esc(cont.title) + '</div>' +
      '<div class="small muted" style="margin-top:4px">下一步：' + stageLabel(ns) + '</div>' +
      '<button class="btn block" style="margin-top:14px" data-act="nav" data-id="article/' + cont.id + '/' + ns + '">继续这篇</button>' +
      '</div>';

    h += '<h2 class="sect">怎么用这个工具</h2>' +
      '<div class="card"><div class="steps">' +
      '<div class="li"><p><b>读</b>：点带虚线的词，看它在<em>这句话里</em>到底什么意思，再决定要不要收。</p></div>' +
      '<div class="li"><p><b>听</b>：先听不看原文，抓数字、抓态度；听不清的句子可以听写。</p></div>' +
      '<div class="li"><p><b>说</b>：跟读三句，录下来和原句比，重点是节奏和重音，不是口音。</p></div>' +
      '<div class="li"><p><b>写</b>：用今天的新词写三句，接不上没关系，接上就是你的了。</p></div>' +
      '<div class="li"><p><b>复习</b>：第二天开始，只出产不认读。答得出来才算过。</p></div>' +
      '</div></div>';

    h += '<h2 class="sect">文章</h2>';
    h += ARTS.map(articleCard).join('');

    if (needBk) {
      h += '<div class="card" style="margin-top:14px;border-style:dashed;box-shadow:none">' +
        '<div style="font-weight:650;font-size:14.5px">' +
        (lastBk ? '已经 ' + daysSince + ' 天没备份了' : '还没备份过') + '</div>' +
        '<div class="small muted" style="margin-top:3px">这 ' + learned +
        ' 个词只在这台设备上。复制一串码存起来，换手机才不白学。</div>' +
        '<button class="btn sm ghost" style="margin-top:12px" data-act="backup">去备份</button>' +
        '</div>';
    }

    h += '<hr class="hr">';
    h += '<div class="row" style="justify-content:center;gap:8px;flex-wrap:wrap">' +
      '<button class="btn sm ghost" data-act="help">学习法说明</button>' +
      '<button class="btn sm ghost" data-act="backup">备份与恢复</button>' +
      '</div>';
    h += '<div class="center tiny faint" style="margin:14px 0 4px">数据只存在这台设备上 · 换设备前记得导出备份</div>';

    return h;
  }

  function articleCard(a) {
    var st = artState(a.id);
    var stages = ['read', 'listen', 'speak', 'write'];
    var bars = stages.map(function (k) {
      return '<span class="st ' + (st.stages[k] ? 'done' : '') + '">' + stageLabel(k) + '</span>';
    }).join('');
    var read = artDone(a.id);
    return '<a class="card artcard cardlink" href="#/article/' + a.id + '/' + nextStage(a) + '">' +
      '<span class="kindbar"></span>' +
      '<span style="flex:1;min-width:0">' +
      '<span class="row" style="gap:6px;margin-bottom:6px">' +
      '<span class="chip acc">' + esc(a.kindLabel) + '</span>' +
      '<span class="chip">' + esc(a.level) + '</span>' +
      (read ? '<span class="chip ok">读完</span>' : '') +
      '</span>' +
      '<h3>' + esc(a.title) + '</h3>' +
      '<p>' + esc(a.intro) + '</p>' +
      '<span class="stages">' + bars + '</span>' +
      '</span></a>';
  }

  /* ============================================================
   * 9. 文章页
   * ============================================================ */
  function viewArticle(a, stage) {
    if (cur.artId !== a.id) { cur.artId = a.id; P = { idx: 0, playing: false, reveal: false, gen: 0 }; }
    cur.stage = stage;

    var h = '';
    h += '<div class="arthead">' +
      '<div class="meta"><span class="chip acc">' + esc(a.kindLabel) + '</span><span class="chip">' + esc(a.level) + '</span>' +
      '<span class="chip">' + a.paragraphs.length + ' 段</span></div>' +
      '<h2>' + esc(a.title) + '</h2>' +
      '<div class="zh">' + esc(a.subtitle) + '</div>' +
      '<div class="tip">' + esc(a.tip) + '</div>' +
      '</div>';

    var stages = ['read', 'listen', 'speak', 'write', 'grammar'];
    h += '<div class="stagebar">' + stages.map(function (k) {
      var on = k === stage ? ' on' : '';
      var done = (k !== 'grammar' && stageDone(a.id, k)) ? ' done' : '';
      return '<a class="' + (on + done).trim() + '" href="#/article/' + a.id + '/' + k + '" style="text-decoration:none">' +
        '<span class="dot"></span>' + stageLabel(k) + '</a>';
    }).join('') + '</div>';

    if (stage === 'read') h += viewRead(a);
    else if (stage === 'listen') h += viewListen(a);
    else if (stage === 'speak') h += viewSpeak(a);
    else if (stage === 'write') h += viewWrite(a);
    else if (stage === 'grammar') h += viewGrammar(a);

    return h;
  }

  function viewRead(a) {
    var h = '<div class="prose ' + (a.kind === 'dialogue' ? 'dlg' : '') + '">';
    a.paragraphs.forEach(function (p) {
      h += '<p>' + (p.sp ? '<span class="spk">' + esc(p.sp) + '</span>' : '') + annotate(p.text, a) + '</p>';
    });
    h += '</div>';

    h += '<div class="readerfoot">';
    if (!stageDone(a.id, 'read')) {
      h += '<button class="btn block" data-act="mark" data-id="' + a.id + '" data-k="read">读完了，去听</button>';
    } else {
      h += '<a class="btn block ghost" href="#/article/' + a.id + '/listen" style="text-decoration:none">去「听」</a>';
    }
    h += '<div class="center tiny faint" style="margin-top:14px">带虚线的词可以点 · 共 ' + a.vocab.length + ' 个语境词</div>';
    h += '</div>';
    return h;
  }

  function viewListen(a) {
    var n = a.paragraphs.length;
    var h = '';
    h += '<div class="player">' +
      '<div class="idx" id="p-idx">第 1 / ' + n + ' 句</div>' +
      '<div class="now ' + (P.reveal ? '' : 'hidden-text') + '" id="p-now">' + esc(a.paragraphs[0].text) + '</div>' +
      '<button class="playbtn" id="p-btn" data-act="playpause">' + (P.playing ? I.pause : I.play) + '</button>' +
      '<div class="row" style="justify-content:center;gap:8px;margin-top:10px">' +
      '<button class="btn quiet sm" data-act="sent-prev">上一句</button>' +
      '<button class="btn quiet sm" data-act="reveal">' + (P.reveal ? '隐藏原文' : '看原文') + '</button>' +
      '<button class="btn quiet sm" data-act="sent-next">下一句</button>' +
      '</div>' +
      '</div>';

    h += '<div class="card" style="margin-top:12px">' +
      '<div class="tiny faint" style="letter-spacing:.08em;margin-bottom:8px">听写当前句</div>' +
      '<input type="text" id="dict-input" placeholder="听到什么就打什么，不用管大小写" autocomplete="off" autocapitalize="off" spellcheck="false">' +
      '<div class="row" style="margin-top:10px">' +
      '<button class="btn sm quiet" data-act="dict-check">检查</button>' +
      '<button class="btn sm quiet" data-act="dict-play">重听这句</button>' +
      '</div>' +
      '<div id="dict-out"></div>' +
      '</div>';

    h += '<div class="row" style="margin-top:14px">' +
      '<button class="btn block" data-act="mark" data-id="' + a.id + '" data-k="listen">听完了，去说</button>' +
      '</div>';
    return h;
  }

  function viewSpeak(a) {
    var h = '<div class="small muted" style="margin:4px 0 12px">先听，再跟读，录下来自己听一遍。看清楚冠词和介词有没有丢。</div>';
    h += a.shadow.map(function (s, i) {
      var key = a.id + ':' + i;
      var done = !!artState(a.id).stages['speak_' + i];
      var url = recUrls[key];
      var asr = REC.asrText && REC.key === key ? REC.asrText : (recAsr[key] || '');
      var row = '<div class="shadowrow ' + (done ? 'done' : '') + '">' +
        '<div class="s">' + esc(s) + '</div>' +
        '<div class="tools">' +
        '<button class="btn sm quiet" data-act="shadow-play" data-i="' + i + '">' + I.speaker + ' 听</button>' +
        '<button class="btn sm ' + (REC.active && REC.key === key ? '' : 'quiet') + '" data-act="shadow-rec" data-i="' + i + '">' +
        (REC.active && REC.key === key ? I.stop + ' 停止' : I.mic + ' 跟读') + '</button>';
      if (url) row += '<audio controls src="' + esc(url) + '" style="height:34px;max-width:190px"></audio>';
      if (!done) row += '<button class="btn sm ghost" data-act="shadow-done" data-i="' + i + '">' + I.check + ' 读顺了</button>';
      row += '</div>';
      if (asr) {
        var sc = matchScore(s, asr);
        row += '<div class="asr-out">识别到：<span class="faint">' + esc(asr) + '</span><br>' +
          '相似度 <span class="score" style="color:' + (sc >= 80 ? 'var(--accent)' : sc >= 55 ? 'var(--danger)' : 'var(--danger)') + '">' + sc + '%</span>' +
          (sc < 60 ? ' · 再听一遍原句，注意重读的位置' : sc < 85 ? ' · 已经能听懂了，注意连读' : ' · 很接近了') +
          '</div>';
      }
      row += '</div>';
      return row;
    }).join('');

    var allDone = a.shadow.every(function (_, i) { return artState(a.id).stages['speak_' + i]; });
    h += '<div class="row" style="margin-top:6px"><button class="btn block" data-act="mark" data-id="' + a.id + '" data-k="speak">去写</button></div>';
    return h;
  }
  var recAsr = {};

  function viewWrite(a) {
    var st = artState(a.id);
    var draft = st.draft || '';
    var w = a.writing;
    var h = '';
    h += '<div class="card">' +
      '<div class="tiny faint" style="letter-spacing:.08em">微写作 · 3 句就够</div>' +
      '<div style="font-size:15px;line-height:1.65;margin-top:6px">' + esc(w.prompt) + '</div>' +
      '<div class="small muted" style="margin-top:6px">提示：' + esc(w.hint) + '</div>' +
      '<div class="row wrap" style="gap:6px;margin-top:12px" id="w-chips">' +
      w.mustUse.map(function (x) { return '<span class="chip" data-w="' + esc(x) + '">' + esc(x) + '</span>'; }).join('') +
      '</div>' +
      '<textarea id="w-text" placeholder="写在这里…… 用中文夹英文也行，先写出来比写对重要。">' + esc(draft) + '</textarea>' +
      '<div class="row" style="margin-top:10px">' +
      '<button class="btn sm quiet" data-act="w-check">检查用词</button>' +
      '<button class="btn sm" data-act="w-save" data-id="' + a.id + '">保存</button>' +
      '<span class="spacer"></span>' +
      '<button class="btn sm ghost" data-act="w-model">看范文</button>' +
      '</div>' +
      '<div id="w-out"></div>' +
      '<div id="w-model" style="display:none"><div class="model">' + esc(w.model) + '</div>' +
      '<div class="tiny faint" style="margin-top:8px">范文只用来对照结构，不要背。你的句子有你的细节，那才是能带走的。</div></div>' +
      '</div>';

    var mine = state.writing.filter(function (x) { return x.artId === a.id; });
    if (mine.length) {
      h += '<h2 class="sect">你写过的</h2>';
      mine.slice().reverse().forEach(function (x) {
        h += '<div class="card"><div class="small muted">' + fmtDate(x.at) + ' · 用了 ' + x.used.length + '/' + w.mustUse.length + ' 个词</div>' +
          '<div style="font-family:var(--serif);font-size:15.5px;line-height:1.7;margin-top:6px">' + esc(x.text) + '</div></div>';
      });
    }
    return h;
  }

  /* 把「英文例句 + 中文翻译」拆成两行 */
  function splitDrill(d) {
    var s = String(d);
    var i = s.search(/[\u4e00-\u9fa5]/);
    if (i <= 0) return esc(s);
    return esc(s.slice(0, i).trim()) + '<span class="zh">' + esc(s.slice(i).trim()) + '</span>';
  }

  function viewGrammar(a) {
    var h = '<div class="small muted" style="margin:4px 0 14px">这些语法点都是从上面这篇文章里挑出来的。看不懂就先读原句，再看解释。</div>';
    h += a.grammar.map(function (g, i) {
      return '<div class="card gp">' +
        '<div class="head"><span class="num">0' + (i + 1) + '</span><span class="title">' + esc(g.point) + '</span></div>' +
        '<div class="quote" style="font-family:var(--serif);font-size:16px;line-height:1.75;margin:10px 0;padding-left:12px;border-left:2px solid var(--hl)">' + esc(g.sent) + '</div>' +
        '<div class="explain">' + g.explain + '</div>' +
        '<div class="tiny faint" style="letter-spacing:.08em;margin-bottom:4px">练三个</div>' +
        g.drills.map(function (d) { return '<div class="drill">' + splitDrill(d) + '</div>'; }).join('') +
        '</div>';
    }).join('');
    h += '<div class="center"><a class="btn ghost sm" href="#/article/' + a.id + '/read" style="text-decoration:none">回到文章</a></div>';
    return h;
  }

  /* ============================================================
   * 10. 复习
   * ============================================================ */
  function reviewInit() {
    var q = dueList();
    return { queue: q, i: 0, right: 0, total: q.length, phase: q.length ? 'ask' : 'empty', card: null, requeued: 0 };
  }

  function findSurface(e) {
    var forms = (e.forms || [e.word]).slice().sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < forms.length; i++) {
      var re = new RegExp('\\b' + escapeRe(forms[i]) + '\\b', 'i');
      var m = String(e.sent || '').match(re);
      if (m) return m[0];
    }
    return e.word;
  }

  function makeCard(id) {
    var e = vocabById[id];
    var w = state.words[id] || { level: 0 };
    var lvl = w.level;
    var type = lvl <= 1 ? 'cloze' : (lvl <= 3 ? 'colloc' : 'produce');
    var c = { id: id, e: e, type: type };

    if (type === 'cloze') {
      c.surface = findSurface(e);
      c.q = e.sent || '';
      c.answer = c.surface;
      c.hint = e.zh;
    } else if (type === 'colloc') {
      var col = (e.colloc && e.colloc[0]) ? e.colloc[0] : null;
      if (col && col.en.toLowerCase().indexOf(e.word.toLowerCase()) >= 0) {
        c.q = col.en;
        c.answer = e.word;
        c.hint = col.zh + ' · ' + e.zh;
      } else {
        c.type = 'produce';
        c.q = e.zh;
        c.answer = e.word;
      }
    } else {
      c.q = e.zh;
      c.answer = e.word;
      c.hint = e.pos + ' · ' + (e.sense || '');
    }
    return c;
  }

  function normAnswer(s) {
    return String(s || '').toLowerCase().replace(/[^a-z' -]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function acceptAnswer(c, ans) {
    var a = normAnswer(ans);
    if (!a) return false;
    var forms = (c.e.forms || []).concat([c.e.word]);
    for (var i = 0; i < forms.length; i++) if (normAnswer(forms[i]) === a) return true;
    return false;
  }

  function blankHTML(text, surface) {
    var s = String(text), t = String(surface);
    var i = s.toLowerCase().indexOf(t.toLowerCase());
    if (i < 0) return esc(s);
    var n = clamp(t.length + 2, 5, 14);
    var bar = new Array(n + 1).join('_');
    return esc(s.slice(0, i)) + '<span class="blank">' + bar + '</span>' + esc(s.slice(i + t.length));
  }

  function viewReview() {
    if (!R) R = reviewInit();

    if (R.phase === 'empty') {
      return '<div class="empty"><div class="big">还没有要复习的词</div>' +
        '<div class="small">先读一篇文章，把不认识的词点开、收进生词本。</div>' +
        '<div style="margin-top:18px"><button class="btn" data-act="nav" data-id="library">去挑文章</button></div></div>';
    }
    if (R.phase === 'end') {
      return '<div class="empty"><div class="big">这一轮复习完了</div>' +
        '<div class="small">答对 ' + R.right + ' / ' + R.total + '。答错的词会在明天再出现一次。</div>' +
        '<div style="margin-top:18px" class="row" style="justify-content:center">' +
        '<button class="btn ghost" data-act="nav" data-id="home">回今日</button>' +
        '<button class="btn" data-act="nav" data-id="library">再读一篇</button>' +
        '</div></div>';
    }

    var c = R.card || (R.card = makeCard(R.queue[R.i]));
    var done = R.i;
    var pct = Math.round(done / Math.max(1, R.total) * 100);

    var h = '<div class="reviewwrap">';
    h += '<div class="progressline"><i style="width:' + pct + '%"></i></div>';
    h += '<div class="row" style="margin-bottom:10px"><span class="tiny faint">' + (R.i + 1) + ' / ' + R.total + '</span>' +
      '<span class="spacer"></span><span class="chip">' + (c.type === 'cloze' ? '填原文' : c.type === 'colloc' ? '填搭配' : '中译英') + '</span></div>';

    h += '<div class="reviewcard">';

    if (c.type === 'cloze') {
      h += '<div class="q">' + blankHTML(c.q, c.surface) + '</div>';
      h += '<div class="hint">' + esc(c.hint) + ' · 首字母 ' + esc(c.surface.charAt(0)) + '，' + c.surface.length + ' 个字母</div>';
    } else if (c.type === 'colloc') {
      h += '<div class="q">' + blankHTML(c.q, c.e.word) + '</div>';
      h += '<div class="hint">' + esc(c.hint) + '</div>';
    } else {
      h += '<div class="q" style="font-family:var(--sans);font-size:19px">' + esc(c.q) + '</div>';
      h += '<div class="hint">' + esc(c.hint) + '</div>';
    }

    if (R.phase === 'ask') {
      h += '<div class="answerbox">' +
        '<input type="text" id="rv-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="写下你想到的词">' +
        '<div class="row" style="margin-top:10px">' +
        '<button class="btn sm" data-act="rv-check">检查</button>' +
        '<button class="btn sm quiet" data-act="rv-giveup">想不起来</button>' +
        '<button class="btn sm quiet" data-act="say" data-id="' + esc(c.e.id) + '" style="margin-left:auto">' + I.speaker + '</button>' +
        '</div></div>';
    } else {
      var ok = R.lastOk;
      h += '<div class="verdict ' + (ok ? 'ok' : 'no') + '">' +
        (ok ? '答对了' : '差一点') + ' · 答案是 <span class="ans">' + esc(c.answer) + '</span>' +
        '<div style="margin-top:6px;font-family:var(--serif);font-size:15px;color:var(--ink);opacity:.85">' + markWord(c.e.sent, c.e) + '</div>' +
        '</div>';
      h += '<div class="gradebar">' +
        '<button class="btn quiet" data-act="rv-grade" data-id="forgot">忘了</button>' +
        '<button class="btn quiet" data-act="rv-grade" data-id="hard">有点难</button>' +
        '<button class="btn" data-act="rv-grade" data-id="good">记得</button>' +
        '</div>';
    }
    h += '</div></div>';
    return h;
  }

  /* ============================================================
   * 11. 生词本
   * ============================================================ */
  var nbTab = 'words';

  function viewNotebook() {
    var h = '<div class="hero" style="padding-top:14px"><h1 class="big" style="font-size:23px">我的本子</h1></div>';
    h += '<div class="seg" style="margin-top:14px">' +
      '<button class="' + (nbTab === 'words' ? 'on' : '') + '" data-act="nb-tab" data-id="words">单词 ' + Object.keys(state.words).length + '</button>' +
      '<button class="' + (nbTab === 'writing' ? 'on' : '') + '" data-act="nb-tab" data-id="writing">写作 ' + state.writing.length + '</button>' +
      '</div>';

    if (nbTab === 'words') {
      var ids = Object.keys(state.words).filter(function (id) { return vocabById[id]; });
      if (!ids.length) {
        return h + '<div class="empty"><div class="big">本子还是空的</div><div class="small">阅读时点开一个词，选「加入生词本」。</div></div>';
      }
      ids.sort(function (a, b) { return state.words[b].savedAt - state.words[a].savedAt; });
      var now = Date.now();
      h += '<div class="card" style="padding:4px 12px">';
      ids.forEach(function (id) {
        var e = vocabById[id], w = state.words[id];
        var dots = '';
        for (var i = 0; i < 6; i++) dots += '<i class="' + (i <= w.level ? 'on' : '') + '"></i>';
        var dueTxt = w.due <= now ? '该复习了'
          : (w.due - now > 300 * DAY ? '已掌握' : fmtDate(w.due) + ' 再见');
        h += '<div class="wordrow" data-act="word" data-id="' + esc(id) + '">' +
          '<span class="lvl">' + dots + '</span>' +
          '<span class="mid"><span class="w1">' + esc(e.word) + '</span><span class="w2">' + esc(e.zh) + ' · ' + dueTxt + '</span></span>' +
          '</div>';
      });
      h += '</div>';
      h += '<div class="small muted" style="margin-top:12px">左边六格是熟练度。满了还会按 35 天的间隔继续出现，不会消失。</div>';
    } else {
      if (!state.writing.length) {
        return h + '<div class="empty"><div class="big">还没写过</div><div class="small">在文章页的「写」里，用新词写三句话。</div></div>';
      }
      h += '<div class="card" style="padding:4px 16px">';
      state.writing.slice().reverse().forEach(function (x) {
        var a = artById[x.artId];
        h += '<div class="writeitem">' +
          '<div class="tiny faint">' + fmtDate(x.at) + (a ? ' · ' + esc(a.title) : '') + '</div>' +
          '<div class="wt">' + esc(x.text) + '</div>' +
          '<div class="wm">用到：' + (x.used.length ? x.used.map(esc).join('、') : '（没用上目标词）') + '</div>' +
          '</div>';
      });
      h += '</div>';
    }
    return h;
  }

  /* ============================================================
   * 12. 备份 / 恢复
   * ============================================================ */
  function stamp() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
  }

  function buildBackup() {
    return {
      app: 'context-english',
      v: 1,
      exportedAt: new Date().toISOString(),
      counts: { words: Object.keys(state.words).length, writing: state.writing.length },
      state: state
    };
  }
  window.__buildBackup = buildBackup;

  function exportBackup() {
    var payload = buildBackup();
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '语境英语-备份-' + stamp() + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    toast('已导出 ' + payload.counts.words + ' 个词');
  }

  /* 合并两份进度：词取更熟练的，阶段取并集，写作按 id 去重 */
  function mergeState(a, b) {
    var out = blankState();
    [a, b].forEach(function (src) {
      if (!src) return;
      var ws = src.words || {};
      Object.keys(ws).forEach(function (id) {
        var w = ws[id];
        if (!w) return;
        var cur = out.words[id];
        if (!cur) { out.words[id] = w; return; }
        if (w.level > cur.level) out.words[id] = w;
        else if (w.level === cur.level && (w.due || 0) < (cur.due || 0)) out.words[id] = w;
      });

      var as = src.arts || {};
      Object.keys(as).forEach(function (id) {
        var s = as[id] || {};
        if (!out.arts[id]) out.arts[id] = { stages: {}, draft: '' };
        var dst = out.arts[id];
        var st = s.stages || {};
        Object.keys(st).forEach(function (k) { if (st[k]) dst.stages[k] = true; });
        if ((s.draft || '').length > (dst.draft || '').length) dst.draft = s.draft;
      });

      var wr = src.writing || [];
      wr.forEach(function (x) {
        if (!x || !x.id) return;
        if (!out.writing.some(function (y) { return y.id === x.id; })) out.writing.push(x);
      });
    });
    out.writing.sort(function (x, y) { return (x.at || 0) - (y.at || 0); });
    out.meta.lastBackup = Math.max(
      (a && a.meta && a.meta.lastBackup) || 0,
      (b && b.meta && b.meta.lastBackup) || 0
    );
    return out;
  }
  window.__mergeState = mergeState;

  function importBackup() {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.json,application/json';
    inp.style.position = 'fixed';
    inp.style.left = '-9999px';
    document.body.appendChild(inp);
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      if (!f) { inp.remove(); return; }
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var raw = JSON.parse(String(fr.result));
          applyIncoming(raw && raw.state ? raw.state : raw);
        } catch (e) {
          toast('读不了这个文件：' + (e.message || '格式不对'));
        }
        inp.remove();
      };
      fr.onerror = function () { toast('文件读不出来'); inp.remove(); };
      fr.readAsText(f);
    });
    inp.click();
  }

  function applyIncoming(incoming) {
    if (!incoming || typeof incoming !== 'object' || !incoming.words || typeof incoming.words !== 'object') {
      throw new Error('这不是语境英语的备份');
    }
    var before = Object.keys(state.words).length;
    state = mergeState(state, incoming);
    saveState();
    var after = Object.keys(state.words).length;
    closeSheet();
    toast('已合并：生词 ' + before + ' → ' + after);
    render();
  }

  /* ---------- 备份码：gzip + base64url，一串文本就能搬 ---------- */
  function bytesToB64(bytes) {
    var s = '', CH = 0x8000;
    for (var i = 0; i < bytes.length; i += CH) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    }
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64ToBytes(b64) {
    var s = String(b64).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function pipeThrough(bytes, transform) {
    var stream = new Blob([bytes]).stream().pipeThrough(transform);
    return new Response(stream).arrayBuffer().then(function (buf) { return new Uint8Array(buf); });
  }

  function packBackup() {
    var json = JSON.stringify(buildBackup());
    var bytes = new TextEncoder().encode(json);
    if (typeof CompressionStream === 'function') {
      return pipeThrough(bytes, new CompressionStream('gzip'))
        .then(function (gz) { return 'CE1:G:' + bytesToB64(gz); })
        .catch(function () { return 'CE1:J:' + bytesToB64(bytes); });
    }
    return Promise.resolve('CE1:J:' + bytesToB64(bytes));
  }

  function unpackBackup(str) {
    var s = String(str || '').trim();
    var m = s.match(/^CE1:([GJ]):([A-Za-z0-9\-_]+)/);
    if (!m) {
      // 也接受直接粘进来的 JSON（文件备份的内容）
      return Promise.resolve().then(function () {
        var o = JSON.parse(s);
        return o && o.state ? o.state : o;
      });
    }
    var bytes = b64ToBytes(m[2]);
    if (m[1] === 'J') return Promise.resolve().then(function () { return decode(bytes); });
    if (typeof DecompressionStream !== 'function') {
      return Promise.reject(new Error('这个浏览器不支持解压，改用「从文件恢复」'));
    }
    return pipeThrough(bytes, new DecompressionStream('gzip')).then(decode);
  }
  function decode(bytes) {
    var o = JSON.parse(new TextDecoder().decode(bytes));
    return o && o.state ? o.state : o;
  }
  window.__packBackup = packBackup;
  window.__unpackBackup = unpackBackup;

  function legacyCopy(t) {
    try {
      var ta = document.createElement('textarea');
      ta.value = t;
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }
  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(t).then(
        function () { return true; },
        function () { return legacyCopy(t); }
      );
    }
    return Promise.resolve(legacyCopy(t));
  }

  function markBackedUp() {
    state.meta.lastBackup = Date.now();
    saveState();
  }
  function backupAge() {
    var last = (state.meta && state.meta.lastBackup) || 0;
    if (!last) return '还没备份过';
    var d = Math.floor((Date.now() - last) / DAY);
    if (d <= 0) return '今天备份过';
    if (d === 1) return '昨天备份过';
    return d + ' 天前备份过';
  }
  function setBkOut(msg) { var o = el('bk-out'); if (o) o.textContent = msg; return o; }
  var pendingRestore = null;

  function openBackupSheet() {
    var nw = Object.keys(state.words).length;
    var html = '<div class="sheet-mask" data-act="close-sheet"><div class="sheet">' +
      '<div class="handle"></div>' +
      '<h2 style="font-family:var(--serif);font-size:22px;margin:0 0 6px">备份与恢复</h2>' +
      '<p class="small muted" style="margin:0 0 14px">进度只存在这台设备的浏览器里。备份就是把这串文字存到别处——微信收藏、备忘录、邮件，都行。</p>' +
      '<div class="row"><span class="chip acc">' + nw + ' 个词 · ' + state.writing.length + ' 篇写作</span>' +
      '<span class="spacer"></span><span class="tiny faint">' + backupAge() + '</span></div>' +
      '<div class="row" style="gap:8px;margin-top:14px;flex-wrap:wrap">' +
      '<button class="btn sm" data-act="copy-backup">复制备份码</button>' +
      '<button class="btn sm quiet" data-act="share-backup">分享到…</button>' +
      '<button class="btn sm quiet" data-act="save-file">存成文件</button>' +
      '</div>' +
      '<div class="tiny faint" id="bk-out" style="margin-top:10px;line-height:1.6">' +
      '复制出来是一段以 CE1: 开头的文本，压缩过，几百个词也就几 KB。</div>' +
      '<hr class="hr">' +
      '<div class="tiny faint" style="letter-spacing:.08em;margin-bottom:6px">恢复</div>' +
      '<p class="small muted" style="margin:0 0 10px">把备份码粘在这里。恢复是合并，不会覆盖这台设备已有的词。</p>' +
      '<textarea id="bk-in" style="min-height:96px;font-family:var(--sans);font-size:13px" placeholder="CE1:..."></textarea>' +
      '<div class="row" style="margin-top:10px">' +
      '<button class="btn sm" data-act="restore-text">检查并恢复</button>' +
      '<span class="spacer"></span>' +
      '<button class="btn sm quiet" data-act="restore-file">从文件恢复</button>' +
      '</div>' +
      '<div id="bk-res"></div>' +
      '</div></div>';
    el('sheet-root').innerHTML = html;
    document.body.style.overflow = 'hidden';
  }

  /* ============================================================
   * 12b. 说明弹层
   * ============================================================ */
  function openHelp() {
    var html = '<div class="sheet-mask" data-act="close-sheet"><div class="sheet" data-stop="1">' +
      '<div class="handle"></div>' +
      '<h2 style="font-family:var(--serif);font-size:22px;margin:0 0 6px">这个工具在练什么</h2>' +
      '<p class="small muted" style="margin:0 0 16px">核心不是「背完多少词」，而是把词放进语境里反复用到。一篇文章走四遍：</p>' +
      '<div class="steps">' +
      '<div class="li"><p><b>读</b>：一篇 300 词左右的文章，生词控制在 8–12 个。点虚线词看卡，只收「以后用得上」的，其余跳过。</p></div>' +
      '<div class="li"><p><b>听</b>：先盲听，抓数字和态度。听不清就听写一句，系统会逐词标出你漏了哪个。</p></div>' +
      '<div class="li"><p><b>说</b>：跟读三句。录音只为让你自己听见差别，不评分、不纠口音——重点在节奏和重音。</p></div>' +
      '<div class="li"><p><b>写</b>：用当天的词写三句。写错不要紧，用出来一次胜过认十次。</p></div>' +
      '</div>' +
      '<hr class="hr">' +
      '<div class="small muted">复习是按间隔重复安排的：第 1 天、第 3 天、第 7 天、第 16 天、第 35 天，难度随熟练度提高——从「填原文」到「给中文写英文」。</div>' +
      '<hr class="hr">' +
      '<div class="small muted">数据存在这台设备的浏览器里，不上传、不联网。换设备不会自动同步，用下面的备份搬。</div>' +
      '<div class="tiny faint" style="margin-top:8px">当前：生词 ' + Object.keys(state.words).length +
      ' 个 · 写作 ' + state.writing.length + ' 篇</div>' +
      '<div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap">' +
      '<button class="btn sm quiet" data-act="backup">备份与恢复</button>' +
      '</div>' +
      '<div class="tiny faint" style="margin-top:8px">备份是一串文字，复制到备忘录或微信收藏即可；恢复时粘回来，是合并，不会覆盖这台设备上已有的词。</div>' +
      '<div style="margin-top:20px"><button class="btn sm danger" data-act="clear-data">清除所有学习数据</button></div>' +
      '</div></div>';
    el('sheet-root').innerHTML = html;
    document.body.style.overflow = 'hidden';
  }

  /* ============================================================
   * 13. 渲染
   * ============================================================ */
  function render() {
    var r = parseHash();

    if (r.name !== 'review') R = null;
    if (r.name !== 'article') stopSpeak();

    var view = el('view');
    renderTabbar(r.name === 'article' ? 'library' : r.name);

    if (r.name === 'home') {
      setTopbar('<h1>语境英语</h1><span class="sub">读 · 听 · 说 · 写</span>');
      view.innerHTML = viewHome();
    } else if (r.name === 'library') {
      setTopbar('<h1>文章</h1><span class="sub">' + ARTS.length + ' 篇</span>');
      view.innerHTML = '<div class="hero" style="padding-top:16px"><div class="greet">三种语域，轮着来</div>' +
        '<h1 class="big" style="font-size:23px">选一篇，走四步。</h1></div>' +
        '<div style="margin-top:16px">' + ARTS.map(articleCard).join('') + '</div>';
    } else if (r.name === 'article') {
      var a = artById[r.arg];
      if (!a) { go('/library'); return; }
      var stage = ['read', 'listen', 'speak', 'write', 'grammar'].indexOf(r.sub) >= 0 ? r.sub : 'read';
      setTopbar('<button class="iconbtn" data-act="nav" data-id="library">' + I.back + '</button>' +
        '<h1>' + esc(a.title) + '</h1>');
      view.innerHTML = viewArticle(a, stage);
    } else if (r.name === 'review') {
      setTopbar('<h1>复习</h1>');
      view.innerHTML = viewReview();
    } else if (r.name === 'notebook') {
      setTopbar('<h1>本子</h1>');
      view.innerHTML = viewNotebook();
    } else {
      go('/home');
      return;
    }

    el('topbar').classList.toggle('scrolled', window.scrollY > 4);
    afterRender(r);
  }

  function afterRender(r) {
    if (r.name === 'article' && r.sub === 'listen') syncPlayer();

    if (r.name === 'article' && r.sub === 'write') {
      var ta = el('w-text');
      if (ta) {
        ta.addEventListener('input', function () { onWriteInput(ta); });
        onWriteInput(ta);
      }
    }
    if (r.name === 'review') {
      var inp = el('rv-input');
      if (inp) {
        inp.focus();
        inp.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter') { ev.preventDefault(); doReviewCheck(); }
        });
      }
    }
    if (r.name === 'article' && r.sub === 'listen') {
      var di = el('dict-input');
      if (di) di.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') { ev.preventDefault(); doDictateCheck(); }
      });
    }
  }

  /* ============================================================
   * 14. 播放器 & 听写
   * ============================================================ */
  function currentArt() { return artById[cur.artId]; }

  function syncPlayer() {
    var a = currentArt();
    if (!a) return;
    var idx = clamp(P.idx, 0, a.paragraphs.length - 1);
    var pi = el('p-idx'), pn = el('p-now'), pb = el('p-btn');
    if (pi) pi.textContent = '第 ' + (idx + 1) + ' / ' + a.paragraphs.length + ' 句';
    if (pn) {
      pn.textContent = a.paragraphs[idx].text;
      pn.classList.toggle('hidden-text', !P.reveal);
    }
    if (pb) pb.innerHTML = P.playing ? I.pause : I.play;

    var rv = $('[data-act="reveal"]');
    if (rv) rv.textContent = P.reveal ? '隐藏原文' : '看原文';
    var dn = el('dict-out');
    if (dn && P.dictCheckedIdx !== idx) dn.innerHTML = '';
  }

  function playFrom(i) {
    var a = currentArt();
    if (!a) return;
    if (i >= a.paragraphs.length) {
      P.playing = false; P.idx = a.paragraphs.length - 1; syncPlayer();
      toast('整篇听完了');
      return;
    }
    P.idx = i; P.playing = true;
    var my = ++P.gen;
    syncPlayer();
    speakSeq(a.paragraphs[i].text, function () {
      if (my !== P.gen || !P.playing) return;
      setTimeout(function () { if (my === P.gen && P.playing) playFrom(i + 1); }, 260);
    });
  }

  function togglePlay() {
    if (P.playing) {
      P.playing = false; P.gen++; stopSpeak(); syncPlayer();
    } else {
      playFrom(P.idx);
    }
  }

  function doDictateCheck() {
    var a = currentArt(), inp = el('dict-input'), out = el('dict-out');
    if (!a || !inp || !out) return;
    var target = a.paragraphs[P.idx].text;
    var typed = inp.value.trim();
    if (!typed) { toast('先写点什么'); return; }
    var sc = matchScore(target, typed);
    out.innerHTML = '<div class="dictate-out">' +
      '<div class="tiny faint" style="margin-bottom:6px">你写的 ' + sc + '% 对得上</div>' +
      '<div class="diff">' + diffHTML(target, typed) + '</div>' +
      '<div class="tiny faint" style="margin-top:8px">绿色=对了，红色波浪=漏掉，灰色删除线=多写</div>' +
      '</div>';
    P.dictCheckedIdx = P.idx;
  }

  /* ============================================================
   * 15. 录音
   * ============================================================ */
  async function toggleRecord(artId, i) {
    var key = artId + ':' + i;
    if (REC.active && REC.key === key) { stopRecord(); return; }
    if (REC.active) stopRecord();

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      toast('这个浏览器不支持录音，换个 Chrome / Safari 试试');
      return;
    }
    try {
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      REC.stream = stream;
      REC.chunks = [];
      REC.key = key;
      REC.active = true;
      REC.asrText = '';
      var rec = new MediaRecorder(stream);
      rec.ondataavailable = function (ev) { if (ev.data && ev.data.size) REC.chunks.push(ev.data); };
      rec.onstop = function () {
        try { REC.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
        var blob = new Blob(REC.chunks, { type: REC.chunks[0] ? REC.chunks[0].type : 'audio/webm' });
        if (recUrls[key]) { try { URL.revokeObjectURL(recUrls[key]); } catch (e) {} }
        recUrls[key] = URL.createObjectURL(blob);
        REC.active = false;
        render();
      };
      REC.rec = rec;
      rec.start();

      if (SR) {
        try {
          var asr = new SR();
          asr.lang = 'en-US';
          asr.interimResults = true;
          asr.continuous = false;
          asr.onresult = function (ev) {
            var t = '';
            for (var k = ev.resultIndex; k < ev.results.length; k++) t += ev.results[k][0].transcript + ' ';
            REC.asrText = t.trim();
          };
          asr.onerror = function () {};
          asr.onend = function () { if (REC.asrText) recAsr[key] = REC.asrText; if (!REC.active) render(); };
          asr.start();
          REC.asr = asr;
        } catch (e) { /* 识别不可用就算了 */ }
      }
      render();
    } catch (err) {
      REC.active = false;
      var name = err && err.name;
      if (name === 'NotAllowedError') toast('麦克风被拒绝了，去浏览器设置里打开');
      else if (name === 'NotFoundError') toast('没找到麦克风');
      else toast('打不开麦克风：需要 https 或 localhost');
      render();
    }
  }

  function stopRecord() {
    try { if (REC.rec && REC.rec.state !== 'inactive') REC.rec.stop(); } catch (e) {}
    try { if (REC.asr) REC.asr.stop(); } catch (e) {}
    if (REC.stream) { try { REC.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} }
  }

  /* ============================================================
   * 16. 写作
   * ============================================================ */
  function usedWords(text, must) {
    var low = String(text).toLowerCase();
    return must.filter(function (w) {
      var e = null;
      for (var id in vocabById) if (vocabById[id].word === w) { e = vocabById[id]; break; }
      var forms = e ? (e.forms || []).concat([e.word]) : [w];
      return forms.some(function (f) {
        return new RegExp('\\b' + escapeRe(String(f).toLowerCase()) + '\\b').test(low);
      });
    });
  }

  function onWriteInput(ta) {
    var a = currentArt();
    if (!a) return;
    var st = artState(a.id);
    st.draft = ta.value;
    saveState();

    var used = usedWords(ta.value, a.writing.mustUse);
    $$('#w-chips .chip').forEach(function (ch) {
      var w = ch.getAttribute('data-w');
      ch.classList.toggle('ok', used.indexOf(w) >= 0);
    });
    var words = wordsOf(ta.value).length;
    var out = el('w-out');
    if (out) {
      var missing = a.writing.mustUse.length - used.length;
      out.innerHTML = words < 8 ? '' :
        '<div class="tiny ' + (missing ? 'faint' : '') + '" style="margin-top:10px">' +
        '已写 ' + words + ' 个词' + (missing ? ' · 还差 ' + missing + ' 个目标词' : ' · 目标词都用上了') + '</div>';
    }
  }

  function checkWrite() {
    var a = currentArt(), ta = el('w-text');
    if (!a || !ta) return;
    var txt = ta.value.trim();
    if (!txt) { toast('先写点什么'); return; }
    var used = usedWords(txt, a.writing.mustUse);
    var out = el('w-out');
    var miss = a.writing.mustUse.filter(function (w) { return used.indexOf(w) < 0; });
    var words = wordsOf(txt).length;
    var msg = '<div class="verdict ' + (miss.length ? 'no' : 'ok') + '" style="margin-top:12px">';
    msg += '共 ' + words + ' 个词，用了 ' + used.length + '/' + a.writing.mustUse.length + ' 个目标词。';
    if (miss.length) msg += '<div style="margin-top:4px">还差：' + miss.map(esc).join('、') + '</div>';
    else msg += '<div style="margin-top:4px">三句里把今天的词全用上了，这就是「记住了」。</div>';
    msg += '</div>';
    out.innerHTML = msg;
  }

  function saveWrite() {
    var a = currentArt(), ta = el('w-text');
    if (!a || !ta) return;
    var txt = ta.value.trim();
    if (txt.length < 10) { toast('再多写一点'); return; }
    var used = usedWords(txt, a.writing.mustUse);
    state.writing.push({ id: 'w' + Date.now(), artId: a.id, text: txt, at: Date.now(), used: used });
    artState(a.id).draft = '';
    saveState();
    markStage(a.id, 'write', true);
    toast('保存了 · ' + used.length + '/' + a.writing.mustUse.length + ' 个目标词');
    render();
  }

  /* ============================================================
   * 17. 复习流程
   * ============================================================ */
  function doReviewCheck() {
    var inp = el('rv-input');
    if (!R || !R.card || R.phase !== 'ask') return;
    var ans = inp ? inp.value : '';
    if (!String(ans).trim()) { toast('写一个词，或者点「想不起来」'); return; }
    R.lastOk = acceptAnswer(R.card, ans);
    R.phase = 'done';
    render();
  }

  function doReviewGrade(g) {
    if (!R || !R.card) return;
    if (g === 'good') R.right += 1;
    gradeWord(R.card.id, g);
    if (g === 'forgot') {
      R.queue.push(R.card.id);
      R.total = R.queue.length;
    }
    R.i += 1;
    R.card = null;
    if (R.i >= R.queue.length) R.phase = 'end';
    else R.phase = 'ask';
    render();
  }

  /* ============================================================
   * 18. 事件
   * ============================================================ */
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-act]');
    if (!t) return;
    // 弹层内部点击不穿透
    if (t.classList.contains('sheet-mask') && ev.target.closest('.sheet')) return;
    var act = t.getAttribute('data-act');
    var id = t.getAttribute('data-id');

    switch (act) {
      case 'nav': go('/' + id); break;
      case 'word': openWord(id); break;
      case 'close-sheet': closeSheet(); break;
      case 'help': openHelp(); break;
      case 'backup': openBackupSheet(); break;
      case 'export': exportBackup(); markBackedUp(); break;
      case 'import': importBackup(); break;
      case 'restore-file': importBackup(); break;

      case 'copy-backup': {
        packBackup().then(function (code) {
          return copyText(code).then(function (ok) {
            if (!ok) {
              var box = el('bk-out');
              if (box) {
                box.innerHTML = '<div style="margin-bottom:6px">复制被浏览器拦住了。下面是备份码，长按全选复制：</div>' +
                  '<textarea readonly style="min-height:110px;font-size:12px;font-family:var(--sans);line-height:1.5">' +
                  esc(code) + '</textarea>';
                var ta2 = box.querySelector('textarea');
                if (ta2) { try { ta2.focus(); ta2.select(); } catch (e) {} }
              }
              toast('已选中，长按复制');
              return;
            }
            markBackedUp();
            setBkOut('已复制 · ' + code.length + ' 个字符 · ' + backupAge() +
              '\n贴到微信收藏、备忘录都行，换手机时粘回来。');
            toast('备份码已复制');
          });
        }).catch(function (e) { toast('生成失败：' + e.message); });
        break;
      }

      case 'share-backup': {
        packBackup().then(function (code) {
          if (navigator.share) {
            navigator.share({ title: '语境英语备份', text: code }).then(function () {
              markBackedUp();
              setBkOut('已分享 · ' + code.length + ' 个字符 · ' + backupAge());
            }).catch(function () { /* 用户取消 */ });
          } else {
            return copyText(code).then(function (ok) {
              if (ok) { markBackedUp(); toast('这个浏览器不支持分享，已复制'); }
              else toast('复制失败，用「存成文件」吧');
            });
          }
        }).catch(function (e) { toast('生成失败：' + e.message); });
        break;
      }

      case 'save-file': exportBackup(); markBackedUp(); break;

      case 'restore-text': {
        var ta = el('bk-in');
        var txt = ta ? ta.value.trim() : '';
        if (!txt) { toast('先把备份码粘进来'); break; }
        unpackBackup(txt).then(function (st) {
          var n = Object.keys(st.words || {}).length;
          var w = (st.writing || []).length;
          pendingRestore = st;
          var res = el('bk-res');
          if (res) {
            res.innerHTML = '<div class="verdict ok" style="margin-top:12px">' +
              '备份里：<b>' + n + ' 个词 · ' + w + ' 篇写作</b>。合并不会丢这台设备已有的词。' +
              '<div class="row" style="margin-top:10px;gap:8px">' +
              '<button class="btn sm" data-act="restore-apply">确认合并</button>' +
              '<button class="btn sm quiet" data-act="restore-cancel">取消</button>' +
              '</div></div>';
          }
        }).catch(function (e) { toast('读不了：' + (e.message || '格式不对')); });
        break;
      }

      case 'restore-apply': {
        if (pendingRestore) {
          var st2 = pendingRestore;
          pendingRestore = null;
          applyIncoming(st2);
        }
        break;
      }

      case 'restore-cancel': {
        pendingRestore = null;
        var rr = el('bk-res');
        if (rr) rr.innerHTML = '';
        break;
      }

      case 'say': {
        var e1 = vocabById[id];
        if (e1) speakOnce(e1.word);
        break;
      }
      case 'say-sent': {
        var e2 = vocabById[id];
        if (e2) speakOnce(e2.sent || e2.word);
        break;
      }
      case 'save-word': {
        var e3 = vocabById[id];
        if (!e3) break;
        ensureWord(id);
        saveState();
        toast('加入生词本 · 明天开始复习');
        openWord(id);
        renderTabbar(parseHash().name === 'article' ? 'library' : parseHash().name);
        break;
      }

      case 'mark': {
        markStage(id, t.getAttribute('data-k'), true);
        var nxt = { read: 'listen', listen: 'speak', speak: 'write' }[t.getAttribute('data-k')];
        go('/article/' + id + '/' + (nxt || 'read'));
        break;
      }

      /* ---- 听 ---- */
      case 'playpause': togglePlay(); break;
      case 'reveal': P.reveal = !P.reveal; syncPlayer(); break;
      case 'sent-prev': P.idx = Math.max(0, P.idx - 1); P.playing = false; P.gen++; stopSpeak(); syncPlayer(); break;
      case 'sent-next': P.idx = Math.min(currentArt().paragraphs.length - 1, P.idx + 1); P.playing = false; P.gen++; stopSpeak(); syncPlayer(); break;
      case 'dict-play': speakOnce(currentArt().paragraphs[P.idx].text); break;
      case 'dict-check': doDictateCheck(); break;

      /* ---- 说 ---- */
      case 'shadow-play': {
        var a = currentArt();
        var i = +t.getAttribute('data-i');
        if (a && a.shadow[i]) speakOnce(a.shadow[i], 0.9);
        break;
      }
      case 'shadow-rec': {
        var a2 = currentArt();
        if (a2) toggleRecord(a2.id, +t.getAttribute('data-i'));
        break;
      }
      case 'shadow-done': {
        var a3 = currentArt();
        if (!a3) break;
        var k = 'speak_' + t.getAttribute('data-i');
        artState(a3.id).stages[k] = true;
        saveState();
        var total = a3.shadow.length;
        var got = 0;
        for (var q = 0; q < total; q++) if (artState(a3.id).stages['speak_' + q]) got++;
        if (got >= total) markStage(a3.id, 'speak', true);
        render();
        break;
      }

      /* ---- 写 ---- */
      case 'w-check': checkWrite(); break;
      case 'w-save': saveWrite(); break;
      case 'w-model': {
        var md = el('w-model');
        if (md) { md.style.display = md.style.display === 'none' ? 'block' : 'none'; }
        break;
      }

      /* ---- 复习 ---- */
      case 'rv-check': doReviewCheck(); break;
      case 'rv-giveup': { R.lastOk = false; R.phase = 'done'; render(); break; }
      case 'rv-grade': doReviewGrade(id); break;

      /* ---- 本子 ---- */
      case 'nb-tab': nbTab = id; render(); break;

      case 'clear-data': {
        if (confirm('清除所有生词、进度和写作？这个动作不能撤销。')) {
          state = blankState();
          saveState();
          closeSheet();
          toast('已清空');
          go('/home');
          render();
        }
        break;
      }
    }
  });

  /* 点击遮罩关闭弹层 */
  document.addEventListener('click', function (ev) {
    if (ev.target.classList && ev.target.classList.contains('sheet-mask')) closeSheet();
  });

  window.addEventListener('scroll', function () {
    var tb = el('topbar');
    if (tb) tb.classList.toggle('scrolled', window.scrollY > 4);
  }, { passive: true });

  window.addEventListener('hashchange', function () {
    window.scrollTo(0, 0);
    render();
  });

  /* 键盘：Esc 关弹层 */
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { closeSheet(); }
  });

  /* ============================================================
   * 19. 启动
   * ============================================================ */
  if (!location.hash) location.hash = '/home';
  render();

  /* Service Worker：仅在 https / localhost 下注册 */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();

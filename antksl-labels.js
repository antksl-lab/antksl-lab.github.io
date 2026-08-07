/* ============================================================================
 * ANTKSL — VINYL LABEL ROTATOR (site-covers edition)
 *
 * Что делает:
 * 1) Крутит "яблоко" на пластинке в эстетике советской этикетки.
 * 2) После каждого полного цикла тонарма показывает следующий трек.
 * 3) Берёт названия и обложки с самого сайта, если они уже есть в DOM.
 * 4) Если DOM ничего не дал — использует labels/labels.json.
 * 5) Если и файла нет — берёт встроенный список ваших релизов.
 *
 * Подключение:
 *   <script src="antksl-labels-site-covers.js" defer></script>
 *
 * Ничего в HTML менять не обязательно, если на странице уже есть:
 *   - контейнер этикетки: .deck .label   или .deck .label-slot
 *   - тонарм:            .arm-body       или .tonearm
 * ==========================================================================*/
(function () {
  'use strict';

  var CONFIG = {
    firm: 'ANTKSL',
    subfirm: 'СТУДИЯ ЗВУКОЗАПИСИ',
    city: 'КЕМЕРОВО',
    artistDefault: 'КОНСТАНТИН ЗАХАРОВ',
    speed: '33⅓ ОБ/МИН',
    stereo: 'СТЕРЕО',
    gost: 'ГОСТ 5289-73',
    grade: 'Гр. з. 0—70',
    fallbackReleases: [
      { title: 'The Cherry Orchard', year: '2026', side: '1', num: 'А62—00713' },
      { title: 'Мы встретились случайно', year: '2026', side: '1', num: 'А62—00615' },
      { title: 'Я вернулась к тебе', year: '2026', side: '2', num: 'А62—00608' },
      { title: 'Late-Night Blues', year: '2026', side: '1', num: 'А62—00604' },
      { title: 'Огонь гори', year: '2026', side: '1', num: 'А62—00529' },
      { title: 'Glitch', year: '2026', side: '2', num: 'А62—00512' },
      { title: 'Лунный загар мне подарит ночь', year: '2026', side: '1', num: 'А62—00427' },
      { title: 'Распутная весна', year: '2026', side: '1', num: 'А62—00415' },
      { title: 'Плыли перед взором облака', year: '2026', side: '2', num: 'А62—00330' },
      { title: 'Тургеневская женщина', year: '2026', side: '1', num: 'А62—00318' },
      { title: 'Любимый, где ты?', year: '2026', side: '1', num: 'А62—00225' },
      { title: 'Горсть песка', year: '2026', side: '2', num: 'А62—00211' }
    ],
    palettes: [
      { bg: '#d9c9a3', ink: '#2b1d10', rule: '#8a6a3a', veil: 'rgba(244,234,208,.82)' },
      { bg: '#b8452f', ink: '#fbe7cf', rule: '#f0c99a', veil: 'rgba(141,49,34,.70)' },
      { bg: '#1f4d3d', ink: '#e8dcc0', rule: '#9dbfa8', veil: 'rgba(28,69,56,.72)' },
      { bg: '#1b2b4d', ink: '#e6e0cf', rule: '#93a8cc', veil: 'rgba(27,43,77,.72)' },
      { bg: '#e8dcc0', ink: '#3a2a18', rule: '#a8875a', veil: 'rgba(244,238,225,.83)' },
      { bg: '#5a2740', ink: '#f2dfd2', rule: '#c69bab', veil: 'rgba(86,38,63,.73)' }
    ],
    hostSelectors: [
      '.deck .label',
      '.deck .label-slot',
      '[data-vinyl-label]',
      '.label-slot',
      '.label'
    ],
    armSelectors: [
      '.arm-body',
      '.tonearm',
      '[data-tonearm]'
    ],
    scrapeRoots: [
      '[data-vinyl-item]',
      '[data-release-card]',
      '.release-card',
      '.track-card',
      '.song-card',
      '.album-card',
      '.release',
      '.track',
      '.song',
      '.swiper-slide',
      '.splide__slide',
      'article',
      '.card'
    ],
    titleSelectors: [
      '[data-vinyl-title]',
      '[data-title]',
      '.release-title',
      '.track-title',
      '.song-title',
      '.card-title',
      '.title',
      'h1',
      'h2',
      'h3',
      'h4'
    ],
    artistSelectors: [
      '[data-vinyl-artist]',
      '[data-artist]',
      '.release-artist',
      '.track-artist',
      '.artist'
    ],
    coverSelectors: [
      '[data-vinyl-cover]',
      'img[data-cover]',
      'img.cover',
      'img.release-cover',
      'img.track-cover',
      'img'
    ]
  };

  var measureCanvas = document.createElement('canvas');
  var measureCtx = measureCanvas.getContext('2d');
  var state = { idx: 0, host: null, items: [], mode: 'fallback' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[<>&"]/g, function (c) {
      return { '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;' }[c];
    });
  }

  function q(selectors, root) {
    root = root || document;
    for (var i = 0; i < selectors.length; i++) {
      var el = root.querySelector(selectors[i]);
      if (el) return el;
    }
    return null;
  }

  function qa(selectors, root) {
    root = root || document;
    var out = [];
    var seen = new Set();
    selectors.forEach(function (sel) {
      root.querySelectorAll(sel).forEach(function (el) {
        if (!seen.has(el)) {
          seen.add(el);
          out.push(el);
        }
      });
    });
    return out;
  }

  function pickAttr(el, names) {
    if (!el) return '';
    for (var i = 0; i < names.length; i++) {
      var v = el.getAttribute(names[i]);
      if (v) return v.trim();
    }
    return '';
  }

  function cleanText(s) {
    return String(s || '')
      .replace(/\s+/g, ' ')
      .replace(/^[·•\-\s]+|[·•\-\s]+$/g, '')
      .trim();
  }

  function getTitleFromRoot(root) {
    var own = pickAttr(root, ['data-vinyl-title', 'data-title', 'aria-label', 'title']);
    if (own) return cleanText(own);
    var el = q(CONFIG.titleSelectors, root);
    if (el) {
      var t = cleanText(el.textContent || '');
      if (t) return t;
    }
    var img = q(CONFIG.coverSelectors, root);
    if (img) {
      var alt = cleanText(img.getAttribute('alt') || '');
      if (alt && alt.length > 2) return alt;
    }
    return '';
  }

  function getArtistFromRoot(root) {
    var own = pickAttr(root, ['data-vinyl-artist', 'data-artist']);
    if (own) return cleanText(own);
    var el = q(CONFIG.artistSelectors, root);
    if (el) return cleanText(el.textContent || '');
    return '';
  }

  function getCoverFromRoot(root) {
    var own = pickAttr(root, ['data-vinyl-cover']);
    if (own) return own;
    var node = q(CONFIG.coverSelectors, root);
    if (!node) return '';
    if (node.matches('[data-vinyl-cover]')) return pickAttr(node, ['data-vinyl-cover']);
    return node.currentSrc || node.src || pickAttr(node, ['data-src', 'data-lazy-src', 'src']) || '';
  }

  function isUsefulTitle(title) {
    if (!title) return false;
    if (title.length < 2 || title.length > 140) return false;
    var low = title.toLowerCase();
    var bad = [
      'слушать', 'подробнее', 'купить', 'читать', 'скачать', 'play', 'listen',
      'open', 'spotify', 'music', 'youtube', 'presave', 'pre-save'
    ];
    for (var i = 0; i < bad.length; i++) if (low === bad[i]) return false;
    return true;
  }

  function discoverSiteItems() {
    var roots = qa(CONFIG.scrapeRoots);
    var found = [];
    var seen = new Set();

    roots.forEach(function (root) {
      var title = getTitleFromRoot(root);
      var cover = getCoverFromRoot(root);
      var artist = getArtistFromRoot(root);
      if (!isUsefulTitle(title)) return;
      if (!cover && !artist && root.children.length < 2) return;

      var key = (title + '|' + cover).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      found.push({
        title: title,
        cover: cover || '',
        artist: artist || CONFIG.artistDefault,
        year: root.getAttribute('data-year') || '2026',
        side: root.getAttribute('data-side') || ((found.length % 2) ? '2' : '1'),
        num: root.getAttribute('data-num') || ('А62—' + String(200 + found.length).padStart(5, '0'))
      });
    });

    return found;
  }

  function normalizeJsonItems(list) {
    return list.map(function (x, i) {
      if (typeof x === 'string') {
        return {
          title: x.replace(/\.[a-z0-9]+$/i, ''),
          cover: 'labels/' + x,
          artist: CONFIG.artistDefault,
          year: '2026',
          side: (i % 2 ? '2' : '1'),
          num: 'А62—' + String(300 + i).padStart(5, '0')
        };
      }
      return {
        title: cleanText(x.title || x.name || ('Трек ' + (i + 1))),
        cover: x.src ? (x.src.indexOf('/') >= 0 ? x.src : 'labels/' + x.src) : '',
        artist: cleanText(x.artist || CONFIG.artistDefault),
        year: cleanText(x.year || '2026'),
        side: cleanText(x.side || (i % 2 ? '2' : '1')),
        num: cleanText(x.num || ('А62—' + String(300 + i).padStart(5, '0')))
      };
    }).filter(function (x) { return isUsefulTitle(x.title); });
  }

  function splitWords(text) {
    return cleanText(text).split(/\s+/).filter(Boolean);
  }

  function measureWidth(text, size, family, weight, letterSpacing) {
    family = family || 'Georgia';
    weight = weight || '700';
    letterSpacing = Number(letterSpacing || 0);
    measureCtx.font = weight + ' ' + size + 'px ' + family;
    return measureCtx.measureText(text).width + Math.max(0, text.length - 1) * letterSpacing;
  }

  function composeLines(words, parts, start, prefix, out) {
    if (parts === 1) {
      out.push(prefix.concat([words.slice(start).join(' ')]));
      return;
    }
    for (var i = start + 1; i <= words.length - parts + 1; i++) {
      composeLines(words, parts - 1, i, prefix.concat([words.slice(start, i).join(' ')]), out);
    }
  }

  function bestLines(text, maxLines, maxWidth, startSize, minSize, family, weight, letterSpacing) {
    var words = splitWords(text.toUpperCase());
    if (!words.length) return { size: startSize, lines: [''] };

    for (var size = startSize; size >= minSize; size -= 1) {
      for (var linesCount = 1; linesCount <= maxLines; linesCount++) {
        var all = [];
        composeLines(words, linesCount, 0, [], all);
        var best = null;

        all.forEach(function (lines) {
          var widths = lines.map(function (line) {
            return measureWidth(line, size, family, weight, letterSpacing);
          });
          var maxLine = Math.max.apply(Math, widths);
          if (maxLine <= maxWidth) {
            var minLine = Math.min.apply(Math, widths);
            var score = maxLine + (maxLine - minLine) * 0.12 + linesCount * 4;
            if (!best || score < best.score) best = { size: size, lines: lines, score: score };
          }
        });

        if (best) return best;
      }
    }

    return { size: minSize, lines: [words.join(' ')] };
  }

  function fitLine(text, size, maxWidth, family, weight, letterSpacing) {
    var w = measureWidth(text, size, family, weight, letterSpacing);
    return { textLength: w > maxWidth ? maxWidth : 0 };
  }

  function drawLabel(item, palette, uniqueId) {
    var hasCover = !!item.cover;
    var titleBlock = bestLines(item.title, 3, 540, 54, 26, 'Georgia', '700', 0.7);
    var titleLineHeight = titleBlock.size * 1.04;
    var titleCenterY = hasCover ? 400 : 410;
    var titleStartY = titleCenterY - ((titleBlock.lines.length - 1) * titleLineHeight / 2);
    var artistText = (item.artist || CONFIG.artistDefault).toUpperCase();
    var artistFit = fitLine(artistText, 24, 560, 'Arial', '600', 3.4);

    var svg = '';
    svg += '<svg class="label-art" viewBox="0 0 1000 1000" aria-hidden="true">';
    svg += '<defs>';
    svg += '<clipPath id="clip-' + uniqueId + '"><circle cx="500" cy="500" r="500"/></clipPath>';
    svg += '<path id="top-' + uniqueId + '" d="M120,485 A380,380 0 0 1 880,485"/>';
    svg += '<path id="bot-' + uniqueId + '" d="M150,525 A350,350 0 0 0 850,525"/>';
    svg += '</defs>';
    svg += '<g clip-path="url(#clip-' + uniqueId + ')">';

    if (hasCover) {
      svg += '<image href="' + esc(item.cover) + '" x="0" y="0" width="1000" height="1000" preserveAspectRatio="xMidYMid slice"/>';
      svg += '<circle cx="500" cy="500" r="500" fill="' + palette.veil + '"/>';
    } else {
      svg += '<circle cx="500" cy="500" r="500" fill="' + palette.bg + '"/>';
    }

    svg += '<circle cx="500" cy="500" r="488" fill="none" stroke="rgba(0,0,0,.24)" stroke-width="14"/>';
    svg += '<circle cx="500" cy="500" r="456" fill="none" stroke="' + palette.rule + '" stroke-width="5" opacity=".9"/>';
    svg += '<circle cx="500" cy="500" r="437" fill="none" stroke="' + palette.rule + '" stroke-width="2" opacity=".55"/>';

    svg += '<text fill="' + palette.ink + '" font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="700" letter-spacing="8">';
    svg += '<textPath href="#top-' + uniqueId + '" startOffset="50%" text-anchor="middle">' + esc(CONFIG.firm) + '</textPath>';
    svg += '</text>';

    svg += '<text fill="' + palette.ink + '" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="700" letter-spacing="4">';
    svg += '<textPath href="#bot-' + uniqueId + '" startOffset="50%" text-anchor="middle">' + esc(CONFIG.subfirm + ' · ' + CONFIG.city) + '</textPath>';
    svg += '</text>';

    svg += '<text x="500" y="208" fill="' + palette.ink + '" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="42" font-weight="700" letter-spacing="14">ANTKSL</text>';
    svg += '<text x="500" y="246" fill="' + palette.ink + '" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="18" font-weight="600" letter-spacing="5">СТУДИЙНАЯ АРХИВНАЯ СЕРИЯ</text>';
    svg += '<line x1="255" y1="282" x2="745" y2="282" stroke="' + palette.rule + '" stroke-width="3"/>';

    svg += '<text x="500" y="320" fill="' + palette.ink + '" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="24" font-weight="600" letter-spacing="3.2"';
    if (artistFit.textLength) svg += ' textLength="' + artistFit.textLength + '" lengthAdjust="spacingAndGlyphs"';
    svg += '>' + esc(artistText) + '</text>';

    if (hasCover) {
      svg += '<rect x="405" y="336" width="190" height="190" rx="6" fill="rgba(255,255,255,.12)" stroke="' + palette.rule + '" stroke-width="2"/>';
      svg += '<image href="' + esc(item.cover) + '" x="415" y="346" width="170" height="170" preserveAspectRatio="xMidYMid slice"/>';
      svg += '<rect x="352" y="540" width="296" height="104" rx="8" fill="' + palette.bg + '" fill-opacity=".88" stroke="' + palette.rule + '" stroke-width="1.5"/>';
    }

    titleBlock.lines.forEach(function (line, i) {
      var y = titleStartY + i * titleLineHeight + (hasCover ? 150 : 0);
      if (hasCover) y = 575 + i * titleLineHeight;
      var fit = fitLine(line, titleBlock.size, hasCover ? 260 : 560, 'Georgia', '700', titleBlock.size >= 38 ? 0.7 : 0.4);
      svg += '<text x="500" y="' + y.toFixed(1) + '" fill="' + palette.ink + '" text-anchor="middle" font-family="Georgia,Times New Roman,serif" font-style="italic" font-size="' + titleBlock.size + '" font-weight="700"';
      if (fit.textLength) svg += ' textLength="' + fit.textLength.toFixed(1) + '" lengthAdjust="spacingAndGlyphs"';
      svg += '>' + esc(line) + '</text>';
    });

    var holeY = hasCover ? 690 : 580;
    svg += '<circle cx="500" cy="' + holeY + '" r="39" fill="#090704"/>';
    svg += '<circle cx="500" cy="' + holeY + '" r="51" fill="none" stroke="' + palette.rule + '" stroke-width="2" opacity=".65"/>';

    var ruleY = hasCover ? 754 : 644;
    var metaY1 = hasCover ? 815 : 705;
    var metaY2 = metaY1 + 33;
    var metaY3 = metaY2 + 34;

    svg += '<line x1="248" y1="' + ruleY + '" x2="752" y2="' + ruleY + '" stroke="' + palette.rule + '" stroke-width="2"/>';

    svg += '<text x="245" y="' + metaY1 + '" fill="' + palette.ink + '" text-anchor="middle" font-family="Courier New,monospace" font-size="22" font-weight="700" letter-spacing="2">' + esc(CONFIG.gost) + '</text>';
    svg += '<text x="245" y="' + metaY2 + '" fill="' + palette.ink + '" text-anchor="middle" font-family="Courier New,monospace" font-size="20" letter-spacing="1.5">' + esc(item.num || '') + '</text>';
    svg += '<text x="245" y="' + metaY3 + '" fill="' + palette.ink + '" text-anchor="middle" font-family="Courier New,monospace" font-size="20" letter-spacing="1.5">' + esc(CONFIG.speed) + '</text>';

    svg += '<text x="755" y="' + metaY1 + '" fill="' + palette.ink + '" text-anchor="middle" font-family="Courier New,monospace" font-size="22" font-weight="700" letter-spacing="2">' + esc((item.side || '1') + ' СТОРОНА') + '</text>';
    svg += '<text x="755" y="' + metaY2 + '" fill="' + palette.ink + '" text-anchor="middle" font-family="Courier New,monospace" font-size="20" letter-spacing="1.5">' + esc(CONFIG.grade) + '</text>';
    svg += '<text x="755" y="' + metaY3 + '" fill="' + palette.ink + '" text-anchor="middle" font-family="Courier New,monospace" font-size="20" letter-spacing="1.5">' + esc(item.year || '2026') + '</text>';

    svg += '</g></svg>';
    return svg;
  }

  function ensureStyles() {
    if (document.getElementById('antksl-label-styles')) return;
    var css = document.createElement('style');
    css.id = 'antksl-label-styles';
    css.textContent =
      '.label,.label-slot,[data-vinyl-label]{position:relative;overflow:hidden;border-radius:50%;background:none!important}' +
      '.label-art{display:block;width:100%;height:100%}' +
      '.spindle{position:absolute;left:50%;top:50%;width:9%;height:9%;transform:translate(-50%,-50%);border-radius:50%;background:#0a0907;box-shadow:0 0 0 2px rgba(255,255,255,.08) inset,0 0 0 1px rgba(0,0,0,.4)}' +
      '.lbl-swap{animation:antkslLblIn .45s ease both}' +
      '@keyframes antkslLblIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}' +
      '@media(prefers-reduced-motion:reduce){.lbl-swap{animation:none}}';
    document.head.appendChild(css);
  }

  function getHost() { return q(CONFIG.hostSelectors); }
  function getArm() { return q(CONFIG.armSelectors); }

  function render(i) {
    if (!state.host || !state.items.length) return;
    var item = state.items[i % state.items.length];
    var palette = CONFIG.palettes[i % CONFIG.palettes.length];
    state.host.innerHTML = drawLabel(item, palette, 'u' + i + '-' + Date.now());
    var sp = document.createElement('span');
    sp.className = 'spindle';
    state.host.appendChild(sp);
    state.host.setAttribute('aria-label', 'На проигрывателе: ' + item.title);
    state.host.classList.remove('lbl-swap');
    void state.host.offsetWidth;
    state.host.classList.add('lbl-swap');
  }

  function next() {
    state.idx = (state.idx + 1) % state.items.length;
    render(state.idx);
  }

  function bindEvents() {
    var arm = getArm();
    if (arm) {
      arm.addEventListener('animationiteration', next);
    } else {
      setInterval(next, 26000);
    }

    var deck = state.host && state.host.closest('.deck');
    if (deck) {
      deck.style.cursor = 'pointer';
      deck.addEventListener('click', next);
    } else if (state.host) {
      state.host.style.cursor = 'pointer';
      state.host.addEventListener('click', next);
    }
  }

  function setItems(items, mode) {
    if (!items || !items.length) return false;
    state.items = items;
    state.mode = mode || 'fallback';
    render(state.idx);
    return true;
  }

  function fallbackItems() {
    return CONFIG.fallbackReleases.map(function (x) {
      return {
        title: x.title,
        cover: '',
        artist: CONFIG.artistDefault,
        year: x.year,
        side: x.side,
        num: x.num
      };
    });
  }

  function boot() {
    ensureStyles();
    state.host = getHost();
    if (!state.host) return;

    if (Array.isArray(window.ANTKSL_LABELS) && window.ANTKSL_LABELS.length) {
      if (setItems(normalizeJsonItems(window.ANTKSL_LABELS), 'window')) {
        bindEvents();
        return;
      }
    }

    var scraped = discoverSiteItems();
    if (scraped.length) {
      setItems(scraped, 'dom');
      bindEvents();
      return;
    }

    fetch('labels/labels.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data && Array.isArray(data.labels) && data.labels.length) {
          setItems(normalizeJsonItems(data.labels), 'json');
        } else {
          setItems(fallbackItems(), 'fallback');
        }
        bindEvents();
      })
      .catch(function () {
        setItems(fallbackItems(), 'fallback');
        bindEvents();
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

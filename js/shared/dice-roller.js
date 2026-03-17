/**
 * DICE ROLLER — dice-roller.js
 * Botões octógonos com linhas de conexão SVG entre eles.
 *
 * Dependências: dice-roller.html + dice-roller.css
 */

(function () {
  'use strict';

  // ── Definição das formas e cores ─────────────────────────────────────────
  const DICE = {
    d4:   { sides: 4,   fill: '#a8d8b8', stroke: '#3a8c5c', points: '20,3 37,35 3,35' },
    d6:   { sides: 6,   fill: '#f5c842', stroke: '#8a6a05', points: '7,7 33,7 33,33 7,33' },
    d8:   { sides: 8,   fill: '#2dd4a0', stroke: '#0a7a5a', points: '20,2 34,20 20,38 6,20' },
    d10:  { sides: 10,  fill: '#2196d4', stroke: '#0d5080', points: '20,10 37,20 20,30 3,20' },
    d12:  { sides: 12,  fill: '#e8447a', stroke: '#8a1040', points: '20,4 36,16 30,34 10,34 4,16' },
    d20:  { sides: 20,  fill: '#8b5cf6', stroke: '#4a1a9a', points: '20,3 35,11 35,29 20,37 5,29 5,11' },
    d100: { sides: 100, fill: '#f5891c', stroke: '#8a4a00', points: '20,4 31,9 36,20 31,31 20,36 9,31 4,20 9,9' },
  };

  // ── Gera SVG da forma geométrica ─────────────────────────────────────────
  function makeSVG(type, size, alpha) {
    alpha = (alpha !== undefined) ? alpha : 1;
    const d = DICE[type];
    if (!d) return '';
    const fill = alpha < 1 ? hexToRgba(d.fill, alpha) : d.fill;
    return (
      `<svg viewBox="0 0 40 40" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">` +
      `<polygon points="${d.points}" fill="${fill}" stroke="${d.stroke}" stroke-width="1.5" stroke-linejoin="round"/>` +
      `</svg>`
    );
  }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ── Estado ───────────────────────────────────────────────────────────────
  let selectedType = 'd20';
  let qty = 1;

  // ── Injeta SVGs nos botões ───────────────────────────────────────────────
  function initButtonShapes() {
    document.querySelectorAll('#diceType .die-btn').forEach(btn => {
      const type = btn.dataset.label;
      if (!type || !DICE[type]) return;
      const size = type === 'd20' ? 36 : 22;
      const span = btn.querySelector('span');
      const tmp  = document.createElement('div');
      tmp.innerHTML = makeSVG(type, size);
      btn.insertBefore(tmp.firstChild, span);
    });
  }

  // ── Estado vazio: hexágono d20 como placeholder ──────────────────────────
  function initEmptyShape() {
    const wrap = document.getElementById('emptyShapeWrap');
    if (wrap) wrap.innerHTML = makeSVG('d20', 40, 0.5);
  }

  // ── Seleção de dado ──────────────────────────────────────────────────────
  function initDieButtons() {
    document.querySelectorAll('#diceType .die-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#diceType .die-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedType = btn.dataset.label;
      });
    });
  }

  // ── Linhas de conexão entre botões ──────────────────────────────────────
  //
  //  Conexões no losango:
  //    d6  ↔ d4, d6  ↔ d8
  //    d4  ↔ d20, d8 ↔ d20
  //    d20 ↔ d10, d20 ↔ d12
  //    d10 ↔ d100, d12 ↔ d100

  const CONNECTIONS = [
    ['d6',  'd4'],  ['d6',  'd8'],
    ['d4',  'd20'], ['d8',  'd20'],
    ['d4',  'd10'], ['d8',  'd12'],
    ['d20', 'd10'], ['d20', 'd12'],
    ['d10', 'd100'],['d12', 'd100'],
  ];

  function drawConnections() {
    const container = document.getElementById('diceType');
    if (!container) return;

    const existing = document.getElementById('diceConnectionLines');
    if (existing) existing.remove();

    const cRect = container.getBoundingClientRect();
    if (cRect.width === 0 || cRect.height === 0) return;

    const ns  = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.id = 'diceConnectionLines';
    svg.setAttribute('width',  cRect.width  + 'px');
    svg.setAttribute('height', cRect.height + 'px');
    svg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:0;overflow:visible;';

    CONNECTIONS.forEach(function(pair) {
      var a = pair[0], b = pair[1];
      var btnA = container.querySelector('[data-label="' + a + '"]');
      var btnB = container.querySelector('[data-label="' + b + '"]');
      if (!btnA || !btnB) return;

      var rA = btnA.getBoundingClientRect();
      var rB = btnB.getBoundingClientRect();

      var x1 = (rA.left + rA.width  / 2 - cRect.left).toFixed(1);
      var y1 = (rA.top  + rA.height / 2 - cRect.top ).toFixed(1);
      var x2 = (rB.left + rB.width  / 2 - cRect.left).toFixed(1);
      var y2 = (rB.top  + rB.height / 2 - cRect.top ).toFixed(1);

      var line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', 'rgba(201,169,110,0.5)');
      line.setAttribute('stroke-width', '1.2');
      line.setAttribute('stroke-dasharray', '3 4');
      svg.appendChild(line);
    });

    container.insertBefore(svg, container.firstChild);
  }

  // ── Spinner de quantidade ────────────────────────────────────────────────
  function initQtySpinner() {
    const display = document.getElementById('diceQty');
    document.getElementById('qtyDown').addEventListener('click', () => {
      if (qty > 1)  { qty--; display.textContent = qty; }
    });
    document.getElementById('qtyUp').addEventListener('click', () => {
      if (qty < 16) { qty++; display.textContent = qty; }
    });
  }

  // ── Rolar dados ──────────────────────────────────────────────────────────
  function roll() {
    const btn     = document.getElementById('rollDiceBtn');
    const overlay = document.getElementById('rollingOverlay');
    const list    = document.getElementById('resultsList');
    const summary = document.getElementById('resultsSummary');
    const empty   = document.getElementById('emptyState');

    btn.disabled          = true;
    empty.style.display   = 'none';
    list.innerHTML        = '';
    summary.style.display = 'none';

    // tremida nos wrappers
    document.querySelectorAll('#diceType .die-oct-wrap').forEach(w => {
      w.classList.remove('shake');
      void w.offsetWidth;
      w.classList.add('shake');
    });

    // overlay: dados girando
    overlay.innerHTML = '';
    const count = Math.min(qty, 5);
    for (let i = 0; i < count; i++) {
      const wrap = document.createElement('div');
      wrap.className = 'tumbling-die';
      wrap.style.setProperty('--dur', (0.35 + Math.random() * 0.3) + 's');
      wrap.style.animationDelay = (i * 0.07) + 's';
      wrap.innerHTML = makeSVG(selectedType, 40);
      overlay.appendChild(wrap);
    }
    overlay.classList.add('active');

    const rollDuration = 560 + Math.random() * 340;

    setTimeout(() => {
      overlay.classList.remove('active');

      const cfg   = DICE[selectedType];
      const rolls = Array.from({ length: qty }, () => Math.ceil(Math.random() * cfg.sides));
      const total = rolls.reduce((a, b) => a + b, 0);

      rolls.forEach((val, i) => {
        setTimeout(() => {
          const el = document.createElement('div');
          el.className = 'result-die'
            + (val === cfg.sides ? ' is-max' : '')
            + (val === 1         ? ' is-min' : '');

          el.innerHTML = makeSVG(selectedType, 46);

          const label = document.createElement('div');
          label.className   = 'die-val';
          label.textContent = val;
          el.appendChild(label);
          list.appendChild(el);

          if (i === rolls.length - 1) {
            setTimeout(() => {
              document.getElementById('resultsTotal').textContent    = total;
              document.getElementById('resultsBreakdown').textContent =
                rolls.length > 1 ? '(' + rolls.join(' + ') + ')' : '';
              summary.style.display = 'flex';
            }, 200);
          }
        }, i * 110);
      });

      btn.disabled = false;
    }, rollDuration);
  }

  // ── Limpar ───────────────────────────────────────────────────────────────
  function clearResults() {
    document.getElementById('resultsList').innerHTML        = '';
    document.getElementById('resultsSummary').style.display = 'none';
    document.getElementById('emptyState').style.display    = 'flex';
  }

  // ── Modal: abrir / fechar ────────────────────────────────────────────────
  function openModal() {
    document.getElementById('diceModal').setAttribute('aria-hidden', 'false');
    // 100ms garante que o modal saiu do display:none e o layout está calculado
    setTimeout(drawConnections, 100);
  }

  function closeModal() {
    document.getElementById('diceModal').setAttribute('aria-hidden', 'true');
  }

  window.openDiceModal  = openModal;
  window.closeDiceModal = closeModal;

  function initModal() {
    const modal    = document.getElementById('diceModal');
    const openBtn  = document.getElementById('openDiceBtn');
    const closeBtn = document.getElementById('closeDiceBtn');

    if (openBtn)  openBtn.addEventListener('click', e => { e.preventDefault(); openModal(); });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal)    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    // redesenha as linhas se a janela for redimensionada com o modal aberto
    window.addEventListener('resize', () => {
      const m = document.getElementById('diceModal');
      if (m && m.getAttribute('aria-hidden') === 'false') drawConnections();
    });
  }

  // ── Bootstrap ────────────────────────────────────────────────────────────
  function init() {
    initButtonShapes();
    initEmptyShape();
    initDieButtons();
    initQtySpinner();
    initModal();

    document.getElementById('rollDiceBtn') .addEventListener('click', roll);
    document.getElementById('clearDiceBtn').addEventListener('click', clearResults);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
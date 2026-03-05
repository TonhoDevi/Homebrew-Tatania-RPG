// ========================================
// COMPÊNDIO DE RAÇAS — v2
// Arquivo: js/compendium/compendium.js
// ========================================

// =============================================
// ESTADO
// =============================================
const STATE = {
    categoria: '',        // '', 'global', 'tribal', 'mistica', 'sobrenatural'
    search:    '',
    tamanho:   '',
    sort:      'default', // 'default','az','za','categoria','tamanho'
    view:      'grid',    // 'grid' | 'list'
};

const CAT_LABELS = {
    global:       '🌍 Global',
    tribal:       '🌿 Tribal',
    mistica:      '✨ Mística',
    sobrenatural: '🌙 Sobrenatural',
};

const TAMANHO_LABELS = {
    pequeno: 'Pequeno',
    medio:   'Médio',
    grande:  'Grande',
};

// =============================================
// INICIALIZAÇÃO
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('racasGrid')) return;

    preencherContadores();
    bindFiltros();
    render();
});

// =============================================
// CONTADORES DO HEADER / ABAS
// =============================================
function preencherContadores() {
    const total = RACAS_DATA.length;
    const porCat = {};
    RACAS_DATA.forEach(r => { porCat[r.categoria] = (porCat[r.categoria] || 0) + 1; });

    setEl('totalRacas',             total);
    setEl('countGlobal',            porCat.global       || 0);
    setEl('countTribal',            porCat.tribal       || 0);
    setEl('countMistica',           porCat.mistica      || 0);
    setEl('countSobrenatural',      porCat.sobrenatural || 0);
    setEl('tab-count-all',          total);
    setEl('tab-count-global',       porCat.global       || 0);
    setEl('tab-count-tribal',       porCat.tribal       || 0);
    setEl('tab-count-mistica',      porCat.mistica      || 0);
    setEl('tab-count-sobrenatural', porCat.sobrenatural || 0);
}

// =============================================
// BINDING DOS CONTROLES
// =============================================
function bindFiltros() {
    // Busca
    const searchInput = document.getElementById('searchRace');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            STATE.search = e.target.value.trim();
            render();
            updateActiveTags();
        });
    }

    // Tamanho
    const sizeSelect = document.getElementById('filterSize');
    if (sizeSelect) {
        sizeSelect.addEventListener('change', e => {
            STATE.tamanho = e.target.value;
            render();
            updateActiveTags();
        });
    }

    // Ordenação
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', e => {
            STATE.sort = e.target.value;
            render();
        });
    }

    // Abas de categoria
    document.querySelectorAll('.cat-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            STATE.categoria = btn.dataset.cat;
            render();
            updateActiveTags();
        });
    });

    // Abas do modal (delegação)
    const modalTabs = document.getElementById('modalTabs');
    if (modalTabs) {
        modalTabs.addEventListener('click', e => {
            const tab = e.target.closest('.modal-tab');
            if (!tab) return;
            openModalTab(tab.dataset.tab);
        });
    }

    // Fechar modal com ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeRacaModal();
    });

    // Fechar ao clicar fora
    const overlay = document.getElementById('racaModal');
    if (overlay) {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeRacaModal();
        });
    }
}

// =============================================
// FILTRAR E ORDENAR
// =============================================
function getFiltered() {
    let list = [...RACAS_DATA];

    // Categoria
    if (STATE.categoria) {
        list = list.filter(r => r.categoria === STATE.categoria);
    }

    // Tamanho
    if (STATE.tamanho) {
        list = list.filter(r => r.tamanho === STATE.tamanho);
    }

    // Busca: nome + descrição + traços + habilidades
    if (STATE.search) {
        const q = STATE.search.toLowerCase();
        list = list.filter(r => {
            if (r.nome.toLowerCase().includes(q))        return true;
            if (r.descricao.toLowerCase().includes(q))   return true;
            if (r.tracos.some(t => t.toLowerCase().includes(q)))  return true;
            if (r.habilidades.some(h =>
                h.nome.toLowerCase().includes(q) ||
                h.descricao.toLowerCase().includes(q)
            )) return true;
            return false;
        });
    }

    // Ordenação
    const ORDEM_CAT = ['global', 'tribal', 'mistica', 'sobrenatural'];
    const ORDEM_TAM = ['pequeno', 'medio', 'grande'];

    switch (STATE.sort) {
        case 'az':        list.sort((a, b) => a.nome.localeCompare(b.nome, 'pt')); break;
        case 'za':        list.sort((a, b) => b.nome.localeCompare(a.nome, 'pt')); break;
        case 'categoria': list.sort((a, b) => ORDEM_CAT.indexOf(a.categoria) - ORDEM_CAT.indexOf(b.categoria)); break;
        case 'tamanho':   list.sort((a, b) => ORDEM_TAM.indexOf(a.tamanho) - ORDEM_TAM.indexOf(b.tamanho)); break;
        default: break; // ordem do array original
    }

    return list;
}

// =============================================
// RENDERIZAR GRID
// =============================================
function render() {
    const grid  = document.getElementById('racasGrid');
    const count = document.getElementById('resultsCount');
    if (!grid) return;

    const lista = getFiltered();

    // Atualiza contador
    if (count) {
        count.innerHTML = `Mostrando <strong>${lista.length}</strong> de <strong>${RACAS_DATA.length}</strong> raças`;
    }

    // Limpa
    grid.innerHTML = '';

    // Modo de visualização
    grid.classList.toggle('list-view', STATE.view === 'list');

    if (lista.length === 0) {
        grid.innerHTML = `
            <div class="no-results" style="grid-column:1/-1">
                <span class="no-results-icon">🗝️</span>
                Nenhuma raça encontrada para os filtros selecionados.
            </div>`;
        return;
    }

    lista.forEach((raca, i) => {
        const globalIdx = RACAS_DATA.indexOf(raca);
        const card = document.createElement('div');
        card.className = 'raca-card-v2';
        card.dataset.cat = raca.categoria;
        card.style.animationDelay = `${Math.min(i * 0.04, 0.5)}s`;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Ver detalhes de ${raca.nome}`);

        const tamLabel  = TAMANHO_LABELS[raca.tamanho]    || raca.tamanho;
        const catLabel  = CAT_LABELS[raca.categoria]       || raca.categoria;

        card.innerHTML = `
            <div class="card-image-wrap">
                <img src="${raca.imagem}" alt="${raca.nome}"
                     onerror="this.src='/assets/races/placeholder.jpg'">
                <div class="card-image-overlay"></div>
                <span class="card-cat-badge">${catLabel}</span>
            </div>
            <div class="card-body">
                <h3 class="card-name">${raca.nome}</h3>
                <div class="card-stats">
                    <span class="stat-chip">📏 ${tamLabel}</span>
                    <span class="stat-chip">👣 ${raca.deslocamento}</span>
                    <span class="stat-chip">⚔ ${raca.habilidades.length} hab.</span>
                </div>
                <p class="card-desc">${raca.descricao}</p>
                <div class="card-footer">
                    <button class="card-btn">Ver Detalhes →</button>
                </div>
            </div>`;

        card.addEventListener('click', () => showRacaDetails(globalIdx));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showRacaDetails(globalIdx);
            }
        });

        grid.appendChild(card);
    });
}

// =============================================
// TOGGLE DE VISUALIZAÇÃO
// =============================================
function setView(mode) {
    STATE.view = mode;
    document.getElementById('viewGrid')?.classList.toggle('active', mode === 'grid');
    document.getElementById('viewList')?.classList.toggle('active', mode === 'list');
    render();
}

// =============================================
// TAGS DE FILTROS ATIVOS
// =============================================
function updateActiveTags() {
    const container = document.getElementById('activeFilters');
    if (!container) return;
    container.innerHTML = '';

    const tags = [];

    if (STATE.search) {
        tags.push({
            label: `🔍 "${STATE.search}"`,
            clear: () => {
                STATE.search = '';
                const el = document.getElementById('searchRace');
                if (el) el.value = '';
                render();
                updateActiveTags();
            }
        });
    }

    if (STATE.tamanho) {
        tags.push({
            label: `📏 ${TAMANHO_LABELS[STATE.tamanho] || STATE.tamanho}`,
            clear: () => {
                STATE.tamanho = '';
                const el = document.getElementById('filterSize');
                if (el) el.value = '';
                render();
                updateActiveTags();
            }
        });
    }

    tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'filter-tag';
        span.innerHTML = `${tag.label} <button class="filter-tag-remove" title="Remover filtro">✕</button>`;
        span.querySelector('button').addEventListener('click', tag.clear);
        container.appendChild(span);
    });

    // Botão limpar tudo
    if (tags.length > 1) {
        const btn = document.createElement('button');
        btn.className = 'clear-filters-btn';
        btn.textContent = 'Limpar tudo';
        btn.addEventListener('click', clearAllFilters);
        container.appendChild(btn);
    }
}

function clearAllFilters() {
    STATE.search   = '';
    STATE.tamanho  = '';

    const search = document.getElementById('searchRace');
    const size   = document.getElementById('filterSize');
    if (search) search.value = '';
    if (size)   size.value   = '';

    render();
    updateActiveTags();
}

// =============================================
// MODAL — ABRIR / FECHAR / ABAS
// =============================================
function showRacaDetails(index) {
    const raca   = RACAS_DATA[index];
    if (!raca) return;
    const modal  = document.getElementById('racaModal');
    const catLabel = CAT_LABELS[raca.categoria] || raca.categoria;

    // Hero
    setElProp('modalHeroImg', 'src', raca.imagem);
    setElProp('modalHeroImg', 'alt', raca.nome);
    setEl('modalHeroName', raca.nome);

    // Badge colorido
    const badge = document.getElementById('modalHeroBadge');
    if (badge) {
        badge.textContent = catLabel;
        badge.className = 'modal-hero-badge';
        badge.setAttribute('data-cat', raca.categoria);
        // reutiliza os seletores do CSS
        const el = document.querySelector('.raca-card-v2');
        const badgeStyles = {
            global:       { bg: 'rgba(46,107,78,.2)',   border: '#2e6b4e', color: '#5fbd8e' },
            tribal:       { bg: 'rgba(122,58,20,.2)',   border: '#7a3a14', color: '#d48040' },
            mistica:      { bg: 'rgba(74,40,120,.2)',   border: '#4a2878', color: '#a070e8' },
            sobrenatural: { bg: 'rgba(139,48,72,.2)',   border: '#8b3048', color: '#e07090' },
        }[raca.categoria] || { bg: 'transparent', border: '#6b4c1e', color: '#c9a84c' };
        badge.style.cssText = `background:${badgeStyles.bg};border:1px solid ${badgeStyles.border};color:${badgeStyles.color}`;
    }

    // Quick stats
    setEl('qsTamanho',     capitalize(raca.tamanho));
    setEl('qsDeslocamento', raca.deslocamento);
    setEl('qsCategoria',   catLabel);
    setEl('qsHabilidades', raca.habilidades.length + ' especiais');

    // Aba: geral
    setEl('modalDescricao', raca.descricao);

    // Aba: traços
    const tracosEl = document.getElementById('modalTracos');
    if (tracosEl) {
        tracosEl.innerHTML = raca.tracos.map(t => `
            <li class="traco-item">
                <span class="traco-bullet">◆</span>
                <span>${t}</span>
            </li>`).join('');
    }

    // Aba: habilidades
    const habsEl = document.getElementById('modalHabilidades');
    if (habsEl) {
        habsEl.innerHTML = raca.habilidades.map(h => `
            <div class="habilidade-card">
                <div class="hab-nome">${h.nome}</div>
                <p class="hab-desc">${h.descricao}</p>
            </div>`).join('');
    }

    // Volta para a aba geral
    openModalTab('geral');

    // Abre o overlay
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeRacaModal() {
    const modal = document.getElementById('racaModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

function openModalTab(tabId) {
    document.querySelectorAll('.modal-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });

    // Volta o scroll do body do modal ao topo
    const body = document.getElementById('modalBody');
    if (body) body.scrollTop = 0;
}

// =============================================
// UTILITÁRIOS
// =============================================
function setEl(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setElProp(id, prop, val) {
    const el = document.getElementById(id);
    if (el) el[prop] = val;
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
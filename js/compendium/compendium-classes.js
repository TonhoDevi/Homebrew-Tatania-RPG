// =============================================
// COMPÊNDIO DE CLASSES — SCRIPT
// Arquivo: js/compendium/compendium-classes.js
// Contém toda a lógica anteriormente embutida em compendium-classes.html
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    bindFilters();
    render();
});

function getFiltered() {
    const q    = document.getElementById('searchClass').value.toLowerCase().trim();
    const dif  = document.getElementById('filterDificuldade').value;
    const role = document.getElementById('filterRole').value;

    return CLASSES_DATA.filter(c => {
        if (dif  && c.dificuldade !== dif)  return false;
        if (role && !c.papeis.includes(role)) return false;
        if (q) {
            const haystack = [
                c.nome, c.descricao,
                ...c.habilidadesDestaque,
                ...c.subclasses.map(s => s.nome + ' ' + s.descricao),
                ...c.papeis,
            ].join(' ').toLowerCase();
            if (!haystack.includes(q)) return false;
        }
        return true;
    });
}

function render() {
    const grid = document.getElementById('classesGrid');
    const bar  = document.getElementById('resultsBar');
    const lista = getFiltered();

    bar.innerHTML = `Mostrando <strong>${lista.length}</strong> de <strong>${CLASSES_DATA.length}</strong> classes`;
    grid.innerHTML = '';

    if (!lista.length) {
        grid.innerHTML = `<div class="no-classes">⚗️ Nenhuma classe encontrada para esses filtros.</div>`;
        return;
    }

    lista.forEach((cls, i) => {
        const difClass = {
            'Básico': 'dif-basico',
            'Intermediário': 'dif-intermediario',
            'Avançado': 'dif-avancado',
        }[cls.dificuldade] || 'dif-intermediario';

        const a = document.createElement('a');
        a.href = cls.pagina;
        a.className = 'class-card';
        a.style.animationDelay = `${i * 0.07}s`;
        a.style.setProperty('--cls-cor', cls.cor);
        a.setAttribute('aria-label', `Ver classe ${cls.nome}`);
        // Linha lateral colorida
        a.style.setProperty('--after-bg', cls.cor);

        a.innerHTML = `
            <div class="card-banner">
                <img src="${cls.imagem}" alt="${cls.nome}"
                     onerror="this.src='/assets/class/placeholder.jpg'">
                <div class="banner-overlay"></div>
                <span class="banner-dado">d${cls.dadoDeVida.replace('d','')}</span>
                <span class="banner-dificuldade ${difClass}">${cls.dificuldade}</span>
            </div>
            <div class="card-body">
                <div class="class-header">
                    <span class="class-icone">${cls.icone}</span>
                    <div class="class-titulo">
                        <h2 class="class-nome">${cls.nome}</h2>
                        <span class="class-subtitulo">${cls.subtitulo}</span>
                    </div>
                </div>
                <p class="class-desc">${cls.descricao}</p>
                <div class="class-stats">
                    <div class="class-stat">
                        <span class="stat-lbl">Dado de Vida</span>
                        <span class="stat-val">${cls.dadoDeVida} / nível</span>
                    </div>
                    <div class="class-stat">
                        <span class="stat-lbl">Atributo Chave</span>
                        <span class="stat-val">${cls.atributoChave}</span>
                    </div>
                    <div class="class-stat">
                        <span class="stat-lbl">Resistências</span>
                        <span class="stat-val">${cls.resistencias}</span>
                    </div>
                    <div class="class-stat">
                        <span class="stat-lbl">Armadura</span>
                        <span class="stat-val">${cls.armadura}</span>
                    </div>
                </div>
                <div class="class-roles">
                    ${cls.papeis.map(p => `<span class="role-pill">${p}</span>`).join('')}
                </div>
                <div class="subclasses-preview">
                    <div class="sub-label">Arquétipos disponíveis</div>
                    <div class="sub-pills">
                        ${cls.subclasses.map(s =>
                            `<span class="sub-pill">${s.icone} ${s.nome}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="card-cta">
                    Ver classe completa <span class="cta-arrow">→</span>
                </div>
            </div>`;

        // Linha lateral CSS (via inline style trick)
        a.style.borderLeft = `4px solid ${cls.cor}`;

        grid.appendChild(a);
    });
}

function bindFilters() {
    ['searchClass','filterDificuldade','filterRole'].forEach(id => {
        document.getElementById(id)?.addEventListener('input',  render);
        document.getElementById(id)?.addEventListener('change', render);
    });
}

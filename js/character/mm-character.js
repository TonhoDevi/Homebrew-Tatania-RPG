/**
 * mm-character.js
 * Lógica da Ficha de Mutantes & Malfeitores 3ª Edição
 */

'use strict';

// ─────────────────────────────────────────────
//  CONSTANTES — Perícias base do sistema
// ─────────────────────────────────────────────
const MM_SKILLS = [
    { id: 'acrobacia',       label: 'Acrobacia',          attr: 'atAgilidade' },
    { id: 'atletismo',       label: 'Atletismo',           attr: 'atForca'     },
    { id: 'combateCC',       label: 'Combate Corp. a Corp.',attr: 'atLuta'     },
    { id: 'combateDist',     label: 'Combate à Distância', attr: 'atDestreza' },
    { id: 'conducao',        label: 'Condução',            attr: 'atDestreza' },
    { id: 'enganacao',       label: 'Enganação',           attr: 'atPresenca' },
    { id: 'especialidade',   label: 'Especialidade',       attr: 'atIntelecto'},
    { id: 'escavacao',       label: 'Escavação',           attr: 'atForca'    },
    { id: 'furtividade',     label: 'Furtividade',         attr: 'atAgilidade'},
    { id: 'intuicao',        label: 'Intuição',            attr: 'atPercepao' },
    { id: 'intimidacao',     label: 'Intimidação',         attr: 'atPresenca' },
    { id: 'investigacao',    label: 'Investigação',        attr: 'atIntelecto'},
    { id: 'magia',           label: 'Magia',               attr: 'atIntelecto'},
    { id: 'medicinal',       label: 'Medicinal',           attr: 'atIntelecto'},
    { id: 'mecanismos',      label: 'Mecanismos',          attr: 'atIntelecto'},
    { id: 'musica',          label: 'Música',              attr: 'atPresenca' },
    { id: 'navegacao',       label: 'Navegação',           attr: 'atIntelecto'},
    { id: 'ocultismo',       label: 'Ocultismo',           attr: 'atIntelecto'},
    { id: 'percepcao',       label: 'Percepção',           attr: 'atPercepao' },
    { id: 'persuasao',       label: 'Persuasão',           attr: 'atPresenca' },
    { id: 'pilotagem',       label: 'Pilotagem',           attr: 'atDestreza' },
    { id: 'prestidigitacao', label: 'Prestidigitação',     attr: 'atDestreza' },
    { id: 'sutil',           label: 'Sutil',               attr: 'atAgilidade'},
    { id: 'tecnologia',      label: 'Tecnologia',          attr: 'atIntelecto'},
    { id: 'tratamento',      label: 'Tratamento',          attr: 'atIntelecto'},
    { id: 'veiculos',        label: 'Veículos',            attr: 'atDestreza' },
];

// ─────────────────────────────────────────────
//  ESTADO DA FICHA
// ─────────────────────────────────────────────
const MM_STORAGE_KEY = 'mm_character_active';
const MM_LIST_KEY    = 'mm_character_list';

let mmSaveTimer = null;

// ─────────────────────────────────────────────
//  UTILITÁRIOS
// ─────────────────────────────────────────────
function mmVal(id)    { return parseInt(document.getElementById(id)?.value) || 0; }
function mmSet(id, v) { const el = document.getElementById(id); if (el) el.value = v; }
function mmFmt(n)     { return n >= 0 ? `+${n}` : `${n}`; }

function mmSign(id) {
    // Exibe o valor como string com sinal no campo
    const el = document.getElementById(id);
    if (!el) return;
    const v = parseInt(el.value) || 0;
    el.value = v >= 0 ? `+${v}` : `${v}`;
}

// ─────────────────────────────────────────────
//  CÁLCULOS PRINCIPAIS
// ─────────────────────────────────────────────
function mmCalculateAll() {
    // --- Atributos: rank = modificador no M&M ---
    const attrs = ['Forca','Vigor','Agilidade','Destreza','Luta','Intelecto','Percepao','Presenca'];
    attrs.forEach(a => {
        const rank = mmVal(`at${a}`);
        const displayEl = document.getElementById(`display-mod${a}`);
        if (displayEl) displayEl.textContent = mmFmt(rank);
    });

    // --- Defesas (novo sistema) ---
    // Esquiva: Agilidade + ranks (CA de D&D)
    // Resistência Física: 10 + ranks
    // Resistência Mental: 10 + ranks
    // Resistência Elemental: 10 + ranks

    const agl = mmVal('atAgilidade');
    const esquivaRanks = mmVal('defEsquivaRanks');
    const esquivaMisc = mmVal('defEsquivaMisc');
    const esquivaTotal = agl + esquivaRanks + esquivaMisc;
    const defEsquivaEl = document.getElementById('display-defEsquivaTotal');
    if (defEsquivaEl) defEsquivaEl.textContent = mmFmt(esquivaTotal);

    // Resistências - base 10 + ranks
    const defFisicaRanks = mmVal('defFisicaRanks');
    const defFisicaMisc = mmVal('defFisicaMisc');
    const defFisica = 10 + defFisicaRanks + defFisicaMisc;
    const defFisicaEl = document.getElementById('display-defFisica');
    if (defFisicaEl) defFisicaEl.textContent = defFisica;

    const defMentalRanks = mmVal('defMentalRanks');
    const defMentalMisc = mmVal('defMentalMisc');
    const defMental = 10 + defMentalRanks + defMentalMisc;
    const defMentalEl = document.getElementById('display-defMental');
    if (defMentalEl) defMentalEl.textContent = defMental;

    const defElementalRanks = mmVal('defElementalRanks');
    const defElementalMisc = mmVal('defElementalMisc');
    const defElemental = 10 + defElementalRanks + defElementalMisc;
    const defElementalEl = document.getElementById('display-defElemental');
    if (defElementalEl) defElementalEl.textContent = defElemental;

    let totalDefRanks = esquivaRanks + defFisicaRanks + defMentalRanks + defElementalRanks;

    // --- Vida Máxima (Vigor + Vitalidade) ---
    const vigor = mmVal('atVigor');
    const vitalidade = mmVal('vitalidade');
    const vidaMaximaCalculada = Math.max(1, (vigor || 0) * 5 + (vitalidade || 0) * 5 + 10);
    mmSet('display-vidaMaxima', vidaMaximaCalculada);
    mmSet('vidaMaxima', vidaMaximaCalculada);

    // --- Combate ---
    const luta = mmVal('atLuta');
    const dest = mmVal('atDestreza');
    const exCC   = mmVal('extraBonusCC');
    const exDist = mmVal('extraBonusDist');
    const displayInit = document.getElementById('display-iniciativa');
    if (displayInit) displayInit.textContent = mmFmt(agl);
    const displayCC = document.getElementById('display-bonusCorpoCorpo');
    if (displayCC) displayCC.textContent = mmFmt(luta + exCC);
    const displayDist = document.getElementById('display-bonusDistancia');
    if (displayDist) displayDist.textContent = mmFmt(dest + exDist);

    // --- Perícias: total = atributo + ranks ---
    MM_SKILLS.forEach(s => {
        const attrVal = mmVal(s.attr);
        const ranksEl = document.getElementById(`skill_ranks_${s.id}`);
        const totalEl = document.getElementById(`skill_total_${s.id}`);
        if (!ranksEl || !totalEl) return;
        const ranks = parseInt(ranksEl.value) || 0;
        totalEl.value = attrVal + ranks;
    });

    // Extras de especialidade
    document.querySelectorAll('.mm-extra-skill-row').forEach(row => {
        const attrSel = row.querySelector('.mm-extra-skill-attr');
        const ranksIn = row.querySelector('.mm-extra-skill-ranks');
        const totalIn = row.querySelector('.mm-extra-skill-total');
        if (!attrSel || !ranksIn || !totalIn) return;
        const attrVal = mmVal(attrSel.value);
        const ranks   = parseInt(ranksIn.value) || 0;
        totalIn.value = attrVal + ranks;
    });

    // --- Pontos ---
    mmCalculatePoints(totalDefRanks);
    
    // --- Atualizar displays ---
    mmUpdateDisplays();
}

function mmCalculatePoints(totalDefRanks) {
    const np = mmVal('nivelPoder');
    const ptLimit = np * 15;
    const displayLimit = document.getElementById('display-ptLimit');
    if (displayLimit) displayLimit.textContent = ptLimit;
    mmSet('ptLimit', ptLimit);

    // Atributos: soma de todos os ranks × 2
    const attrFields = ['atForca','atVigor','atAgilidade','atDestreza','atLuta','atIntelecto','atPercepao','atPresenca'];
    const sumAttrs = attrFields.reduce((acc, f) => acc + mmVal(f), 0);
    const ptAttrs = sumAttrs * 2;
    mmSet('ptAtributos', ptAttrs);
    const displayAttrs = document.getElementById('display-ptAtributos');
    if (displayAttrs) displayAttrs.textContent = ptAttrs;

    // Defesas: soma dos ranks adicionados pelo usuário
    mmSet('ptDefesas', totalDefRanks);
    const displayDefesas = document.getElementById('display-ptDefesas');
    if (displayDefesas) displayDefesas.textContent = totalDefRanks;

    // Perícias: total de ranks / 2 (arredondado para cima)
    let totalSkillRanks = 0;
    MM_SKILLS.forEach(s => {
        const el = document.getElementById(`skill_ranks_${s.id}`);
        if (el) totalSkillRanks += parseInt(el.value) || 0;
    });
    document.querySelectorAll('.mm-extra-skill-ranks').forEach(el => {
        totalSkillRanks += parseInt(el.value) || 0;
    });
    const ptSkills = Math.ceil(totalSkillRanks / 2);
    mmSet('ptPericias', ptSkills);
    const displaySkills = document.getElementById('display-ptPericias');
    if (displaySkills) displaySkills.textContent = ptSkills;

    // Vantagens: contagem de itens
    const vantCount = document.querySelectorAll('.mm-advantage-row').length;
    mmSet('ptVantagens', vantCount);
    const displayVant = document.getElementById('display-ptVantagens');
    if (displayVant) displayVant.textContent = vantCount;

    // Poderes: soma dos campos de custo
    let ptPow = 0;
    document.querySelectorAll('.mm-power-cost').forEach(el => {
        ptPow += parseInt(el.value) || 0;
    });
    mmSet('ptPoderes', ptPow);
    const displayPow = document.getElementById('display-ptPoderes');
    if (displayPow) displayPow.textContent = ptPow;

    const gasto = ptAttrs + totalDefRanks + ptSkills + vantCount + ptPow;
    mmSet('ptGasto', gasto);
    const displayGasto = document.getElementById('display-ptGasto');
    if (displayGasto) displayGasto.textContent = gasto;

    const restante = ptLimit - gasto;
    mmSet('ptRestante', restante);
    const displayRestante = document.getElementById('display-ptRestante');
    if (displayRestante) displayRestante.textContent = restante;
}

// ─────────────────────────────────────────────
//  ATAQUES
// ─────────────────────────────────────────────
let mmAttacks = [];

function mmAddAttack(data = {}) {
    const id = Date.now() + Math.random();
    mmAttacks.push({ id, ...data });
    mmRenderAttacks();
    mmAutoSave();
}

function mmRemoveAttack(id) {
    mmAttacks = mmAttacks.filter(a => a.id !== id);
    mmRenderAttacks();
    mmAutoSave();
}

function mmRenderAttacks() {
    const list = document.getElementById('mmAttackList');
    if (!list) return;
    list.innerHTML = '';
    mmAttacks.forEach(atk => {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr 2fr auto;gap:6px;margin-bottom:6px;align-items:center;';
        row.innerHTML = `
            <input type="text" placeholder="Soco, Raio de Fogo..." value="${atk.nome || ''}"
                oninput="mmAttacks.find(a=>a.id==${atk.id}).nome=this.value; mmAutoSave()">
            <input type="number" placeholder="+0" value="${atk.bonus || ''}"
                oninput="mmAttacks.find(a=>a.id==${atk.id}).bonus=this.value; mmAutoSave()"
                style="text-align:center;">
            <input type="text" placeholder="Corpo/Dist." value="${atk.alcance || ''}"
                oninput="mmAttacks.find(a=>a.id==${atk.id}).alcance=this.value; mmAutoSave()">
            <input type="text" placeholder="Dano X / CD X Resistência..." value="${atk.efeito || ''}"
                oninput="mmAttacks.find(a=>a.id==${atk.id}).efeito=this.value; mmAutoSave()">
            <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8em;"
                onclick="mmRemoveAttack(${atk.id})">✕</button>
        `;
        list.appendChild(row);
    });
}

// ─────────────────────────────────────────────
//  PODERES
// ─────────────────────────────────────────────
let mmPowers = [];

function mmAddPower(data = {}) {
    const id = Date.now() + Math.random();
    mmPowers.push({ id, ...data });
    mmRenderPowers();
    mmAutoSave();
}

function mmRemovePower(id) {
    mmPowers = mmPowers.filter(p => p.id !== id);
    mmRenderPowers();
    mmCalculateAll();
    mmAutoSave();
}

function mmRenderPowers() {
    const list = document.getElementById('mmPowersList');
    if (!list) return;
    list.innerHTML = '';
    mmPowers.forEach(pw => {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 0.7fr 3fr auto;gap:6px;margin-bottom:6px;align-items:center;';
        row.innerHTML = `
            <input type="text" placeholder="Visão de Raio-X, Voo..." value="${pw.nome || ''}"
                oninput="mmPowers.find(p=>p.id==${pw.id}).nome=this.value; mmAutoSave()">
            <input type="number" placeholder="10" value="${pw.rank || ''}" min="1"
                oninput="mmPowers.find(p=>p.id==${pw.id}).rank=this.value; mmAutoSave()"
                style="text-align:center;">
            <input type="number" placeholder="0" value="${pw.custo || ''}" min="0"
                class="mm-power-cost"
                oninput="mmPowers.find(p=>p.id==${pw.id}).custo=this.value; mmCalculatePoints(mmCurrentDefRanks()); mmAutoSave()"
                style="text-align:center;">
            <input type="text" placeholder="Descritores, extras, limitações..." value="${pw.desc || ''}"
                oninput="mmPowers.find(p=>p.id==${pw.id}).desc=this.value; mmAutoSave()">
            <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8em;"
                onclick="mmRemovePower(${pw.id})">✕</button>
        `;
        list.appendChild(row);
    });
}

// Helper para obter total de ranks de defesa atual (sem recalcular tudo)
function mmCurrentDefRanks() {
    return ['defEsquivaRanks','defFisicaRanks','defMentalRanks','defElementalRanks']
        .reduce((acc, id) => acc + mmVal(id), 0);
}

// ─────────────────────────────────────────────
//  SINCRONIZAR DISPLAYS
// ─────────────────────────────────────────────
function mmUpdateDisplays() {
    // Atualizar displays de informações básicas
    const setDisplay = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    
    setDisplay('display-nomeHeroi', document.getElementById('nomeHeroi')?.value || '-');
    setDisplay('display-identidade', document.getElementById('identidade')?.value || '-');
    setDisplay('display-nomeJogador', document.getElementById('nomeJogador')?.value || '-');
    setDisplay('display-grupo', document.getElementById('grupo')?.value || '-');
    setDisplay('display-base', document.getElementById('base')?.value || '-');
    setDisplay('display-origem', document.getElementById('origem')?.value || '-');
    
    // Atualizar displays de valores
    const np = mmVal('nivelPoder');
    const vitalidade = mmVal('vitalidade');
    const vidaAtual = mmVal('vidaAtual');
    
    setDisplay('display-nivelPoder', np);
    setDisplay('display-pontosHeroicos', mmVal('pontosHeroicos'));
    setDisplay('display-xp', mmVal('xp'));
    setDisplay('display-vitalidade', vitalidade);
    setDisplay('display-vidaAtual', vidaAtual);
}
let mmEquip = [];

function mmAddEquip(data = {}) {
    const id = Date.now() + Math.random();
    mmEquip.push({ id, ...data });
    mmRenderEquip();
    mmAutoSave();
}

function mmRemoveEquip(id) {
    mmEquip = mmEquip.filter(e => e.id !== id);
    mmRenderEquip();
    mmAutoSave();
}

function mmRenderEquip() {
    const list = document.getElementById('mmEquipList');
    if (!list) return;
    list.innerHTML = '';
    mmEquip.forEach(eq => {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:2fr 0.8fr 3fr auto;gap:6px;margin-bottom:6px;align-items:center;';
        row.innerHTML = `
            <input type="text" placeholder="Pistola, Armadura..." value="${eq.nome || ''}"
                oninput="mmEquip.find(e=>e.id==${eq.id}).nome=this.value; mmAutoSave()">
            <input type="number" placeholder="1" value="${eq.ep || ''}" min="0"
                oninput="mmEquip.find(e=>e.id==${eq.id}).ep=this.value; mmAutoSave()"
                style="text-align:center;">
            <input type="text" placeholder="Dano, Bônus de Proteção..." value="${eq.props || ''}"
                oninput="mmEquip.find(e=>e.id==${eq.id}).props=this.value; mmAutoSave()">
            <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8em;"
                onclick="mmRemoveEquip(${eq.id})">✕</button>
        `;
        list.appendChild(row);
    });
}

// ─────────────────────────────────────────────
//  VANTAGENS
// ─────────────────────────────────────────────
let mmAdvantages = [];

function mmAddAdvantage(data = {}) {
    const id = Date.now() + Math.random();
    mmAdvantages.push({ id, ...data });
    mmRenderAdvantages();
    mmAutoSave();
}

function mmRemoveAdvantage(id) {
    mmAdvantages = mmAdvantages.filter(a => a.id !== id);
    mmRenderAdvantages();
    mmCalculateAll();
    mmAutoSave();
}

function mmRenderAdvantages() {
    const list = document.getElementById('mmAdvantagesList');
    if (!list) return;
    list.innerHTML = '';
    mmAdvantages.forEach(adv => {
        const row = document.createElement('div');
        row.className = 'mm-advantage-row';
        row.style.cssText = 'display:grid;grid-template-columns:2fr 3fr auto;gap:6px;margin-bottom:6px;align-items:center;';
        row.innerHTML = `
            <input type="text" placeholder="Ataque Poderoso, Esquiva..." value="${adv.nome || ''}"
                oninput="mmAdvantages.find(a=>a.id==${adv.id}).nome=this.value; mmAutoSave()">
            <input type="text" placeholder="Descrição / Ranks..." value="${adv.desc || ''}"
                oninput="mmAdvantages.find(a=>a.id==${adv.id}).desc=this.value; mmAutoSave()">
            <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8em;"
                onclick="mmRemoveAdvantage(${adv.id})">✕</button>
        `;
        list.appendChild(row);
    });
    mmCalculatePoints(mmCurrentDefRanks());
}

// ─────────────────────────────────────────────
//  PERÍCIAS EXTRAS (Especializações)
// ─────────────────────────────────────────────
let mmExtraSkills = [];

function mmAddExtraSkill(data = {}) {
    const id = Date.now() + Math.random();
    mmExtraSkills.push({ id, ...data });
    mmRenderExtraSkills();
    mmAutoSave();
}

function mmRemoveExtraSkill(id) {
    mmExtraSkills = mmExtraSkills.filter(e => e.id !== id);
    mmRenderExtraSkills();
    mmCalculateAll();
    mmAutoSave();
}

function mmRenderExtraSkills() {
    const list = document.getElementById('mmExtraSkillsList');
    if (!list) return;
    list.innerHTML = '';
    mmExtraSkills.forEach(es => {
        const attrOptions = [
            'atForca','atVigor','atAgilidade','atDestreza','atLuta','atIntelecto','atPercepao','atPresenca'
        ].map(a => {
            const label = a.replace('at','');
            return `<option value="${a}" ${es.attr === a ? 'selected' : ''}>${label}</option>`;
        }).join('');

        const row = document.createElement('div');
        row.className = 'mm-extra-skill-row';
        row.style.cssText = 'display:grid;grid-template-columns:2.5fr 0.8fr 0.8fr 0.8fr auto;gap:6px;margin-bottom:6px;align-items:center;';
        row.innerHTML = `
            <input type="text" placeholder="Especialidade (Ciências), Combate (Espada)..." value="${es.nome || ''}"
                oninput="mmExtraSkills.find(e=>e.id==${es.id}).nome=this.value; mmAutoSave()">
            <select class="mm-extra-skill-attr"
                onchange="mmExtraSkills.find(e=>e.id==${es.id}).attr=this.value; mmCalculateAll(); mmAutoSave()">
                ${attrOptions}
            </select>
            <input type="number" class="mm-extra-skill-ranks" placeholder="0" value="${es.ranks || 0}" min="0"
                oninput="mmExtraSkills.find(e=>e.id==${es.id}).ranks=this.value; mmCalculateAll(); mmAutoSave()"
                style="text-align:center;">
            <input type="number" class="mm-extra-skill-total" readonly value="0"
                style="background:var(--cor12);font-weight:700;color:var(--cor19);text-align:center;">
            <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8em;"
                onclick="mmRemoveExtraSkill(${es.id})">✕</button>
        `;
        list.appendChild(row);
    });
    mmCalculateAll();
}

// ─────────────────────────────────────────────
//  COMPLICAÇÕES
// ─────────────────────────────────────────────
let mmComplications = [];

const MM_COMPLICATION_TYPES = [
    'Motivação', 'Inimigo', 'Identidade', 'Relacionamento',
    'Poder Problemático', 'Responsabilidade', 'Reputação', 'Outro'
];

function mmAddComplication(data = {}) {
    const id = Date.now() + Math.random();
    mmComplications.push({ id, ...data });
    mmRenderComplications();
    mmAutoSave();
}

function mmRemoveComplication(id) {
    mmComplications = mmComplications.filter(c => c.id !== id);
    mmRenderComplications();
    mmAutoSave();
}

function mmRenderComplications() {
    const list = document.getElementById('mmComplicationsList');
    if (!list) return;
    list.innerHTML = '';
    mmComplications.forEach(c => {
        const typeOptions = MM_COMPLICATION_TYPES.map(t =>
            `<option value="${t}" ${c.tipo === t ? 'selected' : ''}>${t}</option>`
        ).join('');

        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:1fr 3fr auto;gap:8px;margin-bottom:8px;align-items:start;';
        row.innerHTML = `
            <select onchange="mmComplications.find(c=>c.id==${c.id}).tipo=this.value; mmAutoSave()">
                ${typeOptions}
            </select>
            <textarea placeholder="Descreva a complicação..." rows="2"
                style="resize:vertical;"
                oninput="mmComplications.find(c=>c.id==${c.id}).desc=this.value; mmAutoSave()">${c.desc || ''}</textarea>
            <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8em;align-self:center;"
                onclick="mmRemoveComplication(${c.id})">✕</button>
        `;
        list.appendChild(row);
    });
}

// ─────────────────────────────────────────────
//  ALIADOS / CONHECIDOS
// ─────────────────────────────────────────────
let mmIndividuals = [];

function mmAddIndividual(data = {}) {
    const id = Date.now() + Math.random();
    mmIndividuals.push({ id, ...data });
    mmRenderIndividuals();
    mmAutoSave();
}

function mmRemoveIndividual(id) {
    mmIndividuals = mmIndividuals.filter(i => i.id !== id);
    mmRenderIndividuals();
    mmAutoSave();
}

function mmRenderIndividuals() {
    const list = document.getElementById('mmIndividualsList');
    if (!list) return;
    list.innerHTML = '';
    mmIndividuals.forEach(ind => {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:1.5fr 1fr 3fr auto;gap:8px;margin-bottom:8px;align-items:center;';
        row.innerHTML = `
            <input type="text" placeholder="Nome" value="${ind.nome || ''}"
                oninput="mmIndividuals.find(i=>i.id==${ind.id}).nome=this.value; mmAutoSave()">
            <input type="text" placeholder="Aliado / Rival / NPC" value="${ind.relacao || ''}"
                oninput="mmIndividuals.find(i=>i.id==${ind.id}).relacao=this.value; mmAutoSave()">
            <input type="text" placeholder="Notas..." value="${ind.notas || ''}"
                oninput="mmIndividuals.find(i=>i.id==${ind.id}).notas=this.value; mmAutoSave()">
            <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8em;"
                onclick="mmRemoveIndividual(${ind.id})">✕</button>
        `;
        list.appendChild(row);
    });
}

// ─────────────────────────────────────────────
//  RENDERIZAÇÃO DAS PERÍCIAS BASE
// ─────────────────────────────────────────────
function mmRenderBaseSkills() {
    const list = document.getElementById('mmSkillsList');
    if (!list) return;
    list.innerHTML = '';
    MM_SKILLS.forEach(s => {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:2.5fr 0.8fr 0.8fr 0.8fr;gap:6px;margin-bottom:5px;align-items:center;';
        row.innerHTML = `
            <label style="font-size:0.85em;font-weight:600;">${s.label}</label>
            <input type="number" id="skill_base_${s.id}" readonly value="0"
                style="background:var(--cor12);font-weight:700;color:var(--cor19);text-align:center;padding:3px;border-radius:4px;">
            <input type="number" id="skill_ranks_${s.id}" value="0" min="0"
                oninput="mmCalculateAll(); mmAutoSave()"
                style="text-align:center;padding:3px;border-radius:4px;">
            <input type="number" id="skill_total_${s.id}" readonly value="0"
                style="background:var(--cor12);font-weight:700;color:var(--cor19);text-align:center;padding:3px;border-radius:4px;">
        `;
        list.appendChild(row);
    });
}

// Sincroniza os campos de base das perícias com os atributos atuais
function mmSyncSkillBases() {
    MM_SKILLS.forEach(s => {
        const baseEl = document.getElementById(`skill_base_${s.id}`);
        if (baseEl) baseEl.value = mmVal(s.attr);
    });
}

// ─────────────────────────────────────────────
//  IMAGEM DO PERSONAGEM
// ─────────────────────────────────────────────
function mmSetupImageUpload() {
    const upload = document.getElementById('imageUpload');
    if (!upload) return;
    upload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (ev) {
            const img = document.getElementById('characterImage');
            const placeholder = document.getElementById('imagePlaceholder');
            const removeBtn = document.getElementById('removeImageBtn');
            if (img) { img.src = ev.target.result; img.style.display = 'block'; }
            if (placeholder) placeholder.style.display = 'none';
            if (removeBtn) removeBtn.style.display = 'inline-block';
            mmAutoSave();
        };
        reader.readAsDataURL(file);
    });

    const preview = document.getElementById('imagePreview');
    if (preview) {
        preview.addEventListener('click', function () {
            upload.click();
        });
    }
}

function mmRemoveImage() {
    const img = document.getElementById('characterImage');
    const placeholder = document.getElementById('imagePlaceholder');
    const removeBtn = document.getElementById('removeImageBtn');
    if (img) { img.src = ''; img.style.display = 'none'; }
    if (placeholder) placeholder.style.display = 'flex';
    if (removeBtn) removeBtn.style.display = 'none';
    mmAutoSave();
}

// ─────────────────────────────────────────────
//  SALVAR / CARREGAR
// ─────────────────────────────────────────────
function mmCollectData() {
    const img = document.getElementById('characterImage');
    const data = {
        // Info básica
        nomeHeroi: document.getElementById('nomeHeroi')?.value || '',
        identidade: document.getElementById('identidade')?.value || '',
        nomeJogador: document.getElementById('nomeJogador')?.value || '',
        grupo: document.getElementById('grupo')?.value || '',
        base: document.getElementById('base')?.value || '',
        origem: document.getElementById('origem')?.value || '',
        nivelPoder: mmVal('nivelPoder'),
        pontosHeroicos: mmVal('pontosHeroicos'),
        xp: mmVal('xp'),

        // Vitalidade e Vida
        vitalidade: mmVal('vitalidade'),
        vidaMaxima: mmVal('vidaMaxima'),
        vidaAtual: mmVal('vidaAtual'),

        // Atributos
        atForca: mmVal('atForca'),
        atVigor: mmVal('atVigor'),
        atAgilidade: mmVal('atAgilidade'),
        atDestreza: mmVal('atDestreza'),
        atLuta: mmVal('atLuta'),
        atIntelecto: mmVal('atIntelecto'),
        atPercepao: mmVal('atPercepao'),
        atPresenca: mmVal('atPresenca'),

        // Defesas (novo sistema)
        defEsquivaRanks: mmVal('defEsquivaRanks'),   defEsquivaMisc: mmVal('defEsquivaMisc'),
        defFisicaRanks: mmVal('defFisicaRanks'),     defFisicaMisc: mmVal('defFisicaMisc'),
        defMentalRanks: mmVal('defMentalRanks'),     defMentalMisc: mmVal('defMentalMisc'),
        defElementalRanks: mmVal('defElementalRanks'), defElementalMisc: mmVal('defElementalMisc'),

        // Combate extras
        extraBonusCC: mmVal('extraBonusCC'),
        extraBonusDist: mmVal('extraBonusDist'),

        // Perícias base
        skills: {},
        extraSkills: mmExtraSkills,

        // Listas dinâmicas
        attacks: mmAttacks,
        powers: mmPowers,
        equip: mmEquip,
        advantages: mmAdvantages,
        complications: mmComplications,
        individuals: mmIndividuals,

        // Textos
        mmIdiomas: document.getElementById('mmIdiomas')?.value || '',
        mmVeiculosQG: document.getElementById('mmVeiculosQG')?.value || '',

        // Descrição
        idade: document.getElementById('idade')?.value || '',
        altura: document.getElementById('altura')?.value || '',
        peso: document.getElementById('peso')?.value || '',
        olhos: document.getElementById('olhos')?.value || '',
        cabelo: document.getElementById('cabelo')?.value || '',
        genero: document.getElementById('genero')?.value || '',
        aparencia: document.getElementById('aparencia')?.value || '',
        personalidade: document.getElementById('personalidade')?.value || '',
        motivacao: document.getElementById('motivacao')?.value || '',
        historia: document.getElementById('historia')?.value || '',
        anotacoes: document.getElementById('anotacoes')?.value || '',

        // Imagem
        characterImage: img?.src && img.src !== window.location.href ? img.src : '',
    };

    MM_SKILLS.forEach(s => {
        const el = document.getElementById(`skill_ranks_${s.id}`);
        if (el) data.skills[s.id] = parseInt(el.value) || 0;
    });

    return data;
}

function mmApplyData(data) {
    if (!data) return;

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };

    setVal('nomeHeroi',     data.nomeHeroi);
    setVal('identidade',    data.identidade);
    setVal('nomeJogador',   data.nomeJogador);
    setVal('grupo',         data.grupo);
    setVal('base',          data.base);
    setVal('origem',        data.origem);
    setVal('nivelPoder',    data.nivelPoder ?? 10);
    setVal('pontosHeroicos',data.pontosHeroicos ?? 1);
    setVal('xp',            data.xp ?? 0);

    // Vitalidade e Vida
    setVal('vitalidade',  data.vitalidade ?? 0);
    setVal('vidaMaxima',  data.vidaMaxima ?? 10);
    setVal('vidaAtual',   data.vidaAtual ?? 10);

    setVal('atForca',     data.atForca ?? 0);
    setVal('atVigor',     data.atVigor ?? 0);
    setVal('atAgilidade', data.atAgilidade ?? 0);
    setVal('atDestreza',  data.atDestreza ?? 0);
    setVal('atLuta',      data.atLuta ?? 0);
    setVal('atIntelecto', data.atIntelecto ?? 0);
    setVal('atPercepao',  data.atPercepao ?? 0);
    setVal('atPresenca',  data.atPresenca ?? 0);

    // Defesas (novo sistema)
    setVal('defEsquivaRanks',  data.defEsquivaRanks ?? 0);  setVal('defEsquivaMisc',  data.defEsquivaMisc ?? 0);
    setVal('defFisicaRanks',   data.defFisicaRanks ?? 0);   setVal('defFisicaMisc',   data.defFisicaMisc ?? 0);
    setVal('defMentalRanks',   data.defMentalRanks ?? 0);   setVal('defMentalMisc',   data.defMentalMisc ?? 0);
    setVal('defElementalRanks',data.defElementalRanks ?? 0); setVal('defElementalMisc',data.defElementalMisc ?? 0);

    // Combate compatibilidade com sistema antigo (se existir)
    if (data.defFortRanks !== undefined) setVal('defMentalRanks', data.defFortRanks);
    if (data.defFortMisc !== undefined) setVal('defMentalMisc', data.defFortMisc);
    if (data.defApararRanks !== undefined) setVal('defFisicaRanks', data.defApararRanks);
    if (data.defApararMisc !== undefined) setVal('defFisicaMisc', data.defApararMisc);
    if (data.defResistRanks !== undefined) setVal('defElementalRanks', data.defResistRanks);
    if (data.defResistMisc !== undefined) setVal('defElementalMisc', data.defResistMisc);

    setVal('extraBonusCC',   data.extraBonusCC ?? 0);
    setVal('extraBonusDist', data.extraBonusDist ?? 0);

    // Perícias base
    if (data.skills) {
        MM_SKILLS.forEach(s => {
            const el = document.getElementById(`skill_ranks_${s.id}`);
            if (el) el.value = data.skills[s.id] ?? 0;
        });
    }

    // Extras
    mmExtraSkills = data.extraSkills || [];
    mmRenderExtraSkills();

    // Listas
    mmAttacks      = data.attacks      || [];
    mmPowers       = data.powers       || [];
    mmEquip        = data.equip        || [];
    mmAdvantages   = data.advantages   || [];
    mmComplications= data.complications|| [];
    mmIndividuals  = data.individuals  || [];

    mmRenderAttacks();
    mmRenderPowers();
    mmRenderEquip();
    mmRenderAdvantages();
    mmRenderComplications();
    mmRenderIndividuals();

    // Textos
    setVal('mmIdiomas',    data.mmIdiomas);
    setVal('mmVeiculosQG', data.mmVeiculosQG);
    setVal('idade',        data.idade);
    setVal('altura',       data.altura);
    setVal('peso',         data.peso);
    setVal('olhos',        data.olhos);
    setVal('cabelo',       data.cabelo);
    setVal('genero',       data.genero);
    setVal('aparencia',    data.aparencia);
    setVal('personalidade',data.personalidade);
    setVal('motivacao',    data.motivacao);
    setVal('historia',     data.historia);
    setVal('anotacoes',    data.anotacoes);

    // Imagem
    if (data.characterImage) {
        const img = document.getElementById('characterImage');
        const placeholder = document.getElementById('imagePlaceholder');
        const removeBtn = document.getElementById('removeImageBtn');
        if (img) { img.src = data.characterImage; img.style.display = 'block'; }
        if (placeholder) placeholder.style.display = 'none';
        if (removeBtn) removeBtn.style.display = 'inline-block';
    }

    mmCalculateAll();
}

function mmSave() {
    const data = mmCollectData();
    localStorage.setItem(MM_STORAGE_KEY, JSON.stringify(data));

    // Lista de fichas salvas
    let list = JSON.parse(localStorage.getItem(MM_LIST_KEY) || '[]');
    const nome = data.nomeHeroi || 'Herói sem nome';
    const idx  = list.findIndex(c => c.nome === nome);
    const entry = { nome, timestamp: Date.now(), data };
    if (idx >= 0) list[idx] = entry; else list.push(entry);
    localStorage.setItem(MM_LIST_KEY, JSON.stringify(list));

    const ind = document.getElementById('saveIndicator');
    if (ind) { ind.style.opacity = '1'; setTimeout(() => ind.style.opacity = '0', 2000); }
}

function mmAutoSave() {
    clearTimeout(mmSaveTimer);
    mmSaveTimer = setTimeout(mmSave, 800);
}

function mmLoad() {
    const raw = localStorage.getItem(MM_STORAGE_KEY);
    if (raw) {
        try { mmApplyData(JSON.parse(raw)); } catch (e) { console.warn('Erro ao carregar ficha M&M', e); }
    } else {
        mmCalculateAll();
    }
}

function mmNewSheet() {
    if (!confirm('Criar nova ficha? Os dados não salvos serão perdidos.')) return;
    localStorage.removeItem(MM_STORAGE_KEY);
    mmAttacks = []; mmPowers = []; mmEquip = []; mmAdvantages = [];
    mmComplications = []; mmIndividuals = []; mmExtraSkills = [];
    mmApplyData({});
    document.querySelectorAll('input:not([readonly]), textarea, select').forEach(el => {
        if (el.type === 'number') el.value = el.getAttribute('value') || 0;
        else if (el.tagName === 'SELECT') el.selectedIndex = 0;
        else if (el.tagName !== 'BUTTON') el.value = '';
    });
    mmCalculateAll();
}

// ─────────────────────────────────────────────
//  EXPORT / IMPORT JSON
// ─────────────────────────────────────────────
function mmExportJSON() {
    const data = mmCollectData();
    const nome = data.nomeHeroi?.replace(/\s+/g, '_') || 'heroi';
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `mm_${nome}.json`; a.click();
    URL.revokeObjectURL(url);
}

function mmImportJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            mmApplyData(data);
            mmSave();
        } catch (err) {
            alert('Erro ao importar ficha. Verifique o arquivo JSON.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ─────────────────────────────────────────────
//  MODAL DE CARREGAR
// ─────────────────────────────────────────────
function mmShowLoadModal() {
    const modal = document.getElementById('loadModal');
    const listEl = document.getElementById('mmCharacterList');
    if (!modal || !listEl) return;

    const list = JSON.parse(localStorage.getItem(MM_LIST_KEY) || '[]');
    listEl.innerHTML = '';

    if (!list.length) {
        listEl.innerHTML = '<p style="text-align:center;opacity:0.6;">Nenhuma ficha salva.</p>';
    } else {
        list.slice().reverse().forEach(entry => {
            const date = new Date(entry.timestamp).toLocaleString('pt-BR');
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--cor10,#ccc);gap:8px;';
            row.innerHTML = `
                <div>
                    <strong>${entry.nome}</strong>
                    <div style="font-size:0.75em;opacity:0.6;">${date}</div>
                </div>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-secondary" onclick="mmLoadEntry('${entry.nome}')">Carregar</button>
                    <button class="btn btn-danger" onclick="mmDeleteEntry('${entry.nome}')">Excluir</button>
                </div>
            `;
            listEl.appendChild(row);
        });
    }

    modal.style.display = 'flex';
}

function mmHideLoadModal() {
    const modal = document.getElementById('loadModal');
    if (modal) modal.style.display = 'none';
}

function mmLoadEntry(nome) {
    const list = JSON.parse(localStorage.getItem(MM_LIST_KEY) || '[]');
    const entry = list.find(c => c.nome === nome);
    if (!entry) return;
    mmApplyData(entry.data);
    localStorage.setItem(MM_STORAGE_KEY, JSON.stringify(entry.data));
    mmHideLoadModal();
}

function mmDeleteEntry(nome) {
    if (!confirm(`Excluir a ficha "${nome}"?`)) return;
    let list = JSON.parse(localStorage.getItem(MM_LIST_KEY) || '[]');
    list = list.filter(c => c.nome !== nome);
    localStorage.setItem(MM_LIST_KEY, JSON.stringify(list));
    mmShowLoadModal();
}

// ─────────────────────────────────────────────
//  SISTEMA DE ABAS (compatível com o projeto)
// ─────────────────────────────────────────────
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');
    const idx = parseInt(tabId.replace('tab','')) - 1;
    const btns = document.querySelectorAll('.tab-btn');
    if (btns[idx]) btns[idx].classList.add('active');
}

// ─────────────────────────────────────────────
//  DARK MODE
// ─────────────────────────────────────────────
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('mm_darkMode', document.body.classList.contains('dark-mode'));
}

// ─────────────────────────────────────────────
//  INICIALIZAÇÃO
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    // Renderiza as perícias base na aba 2
    mmRenderBaseSkills();

    // Carrega ficha salva
    mmLoad();

    // Configura upload de imagem
    mmSetupImageUpload();

    // Dark mode
    if (localStorage.getItem('mm_darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        const cb = document.getElementById('toggleDarkMode');
        if (cb) cb.checked = true;
    }

    // Fecha modal ao clicar fora
    window.addEventListener('click', function (e) {
        const modal = document.getElementById('loadModal');
        if (modal && e.target === modal) mmHideLoadModal();
    });
});
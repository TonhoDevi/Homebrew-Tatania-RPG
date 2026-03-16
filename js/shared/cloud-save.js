// ═══════════════════════════════════════════════════════════════
//  cloud-save.js  —  Templo de Tatânea
//  Múltiplas fichas por usuário (máximo 5 no total)
//  Coloque em: js/shared/cloud-save.js
// ═══════════════════════════════════════════════════════════════

const LIMITE_FICHAS = 5;

// ── ID DA FICHA ATIVA ────────────────────────────────────────────
function getActiveSheetId(tipo)     { return sessionStorage.getItem('activeSheet_' + tipo) || null; }
function setActiveSheetId(tipo, id) { sessionStorage.setItem('activeSheet_' + tipo, id); }
function clearActiveSheetId(tipo)   { sessionStorage.removeItem('activeSheet_' + tipo); }

// ── SALVAR FICHA NA NUVEM ────────────────────────────────────────
async function cloudSave(tipo, dados, nome) {
    const user = await getUser();
    if (!user) return { error: 'Nao autenticado' };

    const nomeFinal = (nome || 'Sem nome').trim() || 'Sem nome';
    const activeId  = getActiveSheetId(tipo);

    if (activeId) {
        // UPDATE — ficha já existe, só atualiza
        const result = await sb.from('fichas')
            .update({ nome: nomeFinal, dados })
            .eq('id', activeId)
            .eq('user_id', user.id)
            .select().single();
        return result;
    }

    // INSERT — verifica o limite antes de criar
    const { count } = await sb.from('fichas')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

    if (count >= LIMITE_FICHAS) {
        showSaveIndicator('Limite de ' + LIMITE_FICHAS + ' fichas atingido!', true);
        return { error: 'limite_atingido' };
    }

    const result = await sb.from('fichas')
        .insert({ user_id: user.id, tipo, nome: nomeFinal, dados })
        .select().single();

    if (result.data && result.data.id) {
        setActiveSheetId(tipo, result.data.id);
    }
    return result;
}

// ── CARREGAR FICHA ESPECÍFICA ────────────────────────────────────
async function cloudLoad(tipo) {
    const user = await getUser();
    if (!user) return null;
    const activeId = getActiveSheetId(tipo);
    if (!activeId) return null;
    const { data, error } = await sb.from('fichas')
        .select('*').eq('id', activeId).eq('user_id', user.id).single();
    if (error || !data) return null;
    return data.dados;
}

// ── LISTAR TODAS AS FICHAS ───────────────────────────────────────
async function cloudListAll(tipo) {
    const user = await getUser();
    if (!user) return [];
    let query = sb.from('fichas')
        .select('id, tipo, nome, atualizado_em')
        .eq('user_id', user.id)
        .order('atualizado_em', { ascending: false });
    if (tipo) query = query.eq('tipo', tipo);
    const { data, error } = await query;
    if (error) return [];
    return data || [];
}

// ── CONTAR FICHAS DO USUÁRIO ─────────────────────────────────────
async function cloudCount() {
    const user = await getUser();
    if (!user) return 0;
    const { count } = await sb.from('fichas')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
    return count || 0;
}

// ── VERIFICAR SE PODE CRIAR NOVA ─────────────────────────────────
async function cloudPodeCriarNova() {
    const total = await cloudCount();
    return total < LIMITE_FICHAS;
}

// ── DELETAR FICHA ────────────────────────────────────────────────
async function cloudDelete(tipo, id) {
    const user = await getUser();
    if (!user) return;
    const targetId = id || getActiveSheetId(tipo);
    if (!targetId) return;
    await sb.from('fichas').delete().eq('id', targetId).eq('user_id', user.id);
    if (!id || id === getActiveSheetId(tipo)) clearActiveSheetId(tipo);
}

// ── NOVA FICHA / ABRIR FICHA ─────────────────────────────────────
async function cloudNewSheet(tipo) {
    const pode = await cloudPodeCriarNova();
    if (!pode) {
        alert('Voce ja tem ' + LIMITE_FICHAS + ' fichas salvas.\nExclua uma antes de criar outra.');
        return false;
    }
    clearActiveSheetId(tipo);
    return true;
}

function cloudOpenSheet(tipo, id) { setActiveSheetId(tipo, id); }

// ── INDICADOR VISUAL ─────────────────────────────────────────────
function showSaveIndicator(msg, isError) {
    msg = msg || 'Salvo na nuvem';
    const el = document.getElementById('saveIndicator');
    if (!el) return;
    el.textContent = msg;
    el.style.background = isError ? 'rgba(180,40,40,0.85)' : '';
    el.classList.add('show');
    clearTimeout(el._timeout);
    el._timeout = setTimeout(function() {
        el.classList.remove('show');
        el.textContent = 'Salvo automaticamente';
        el.style.background = '';
    }, 2500);
}
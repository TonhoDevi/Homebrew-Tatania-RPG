// ═══════════════════════════════════════════════════════════════
//  cloud-save.js  —  Templo de Tatânea
//  Coloque em: js/shared/cloud-save.js
//
//  Depende de: supabase-auth.js (carregado antes deste)
// ═══════════════════════════════════════════════════════════════

// ── SALVAR FICHA NA NUVEM ────────────────────────────────────────
// tipo: 'dnd' ou 'mem'
// dados: objeto JS com toda a ficha
// nome: nome do personagem (aparece na lista)
async function cloudSave(tipo, dados, nome) {
    const user = await getUser();
    if (!user) return { error: 'Não autenticado' };

    // Garante que o nome nunca fica vazio
    const nomeFinal = (nome || 'Sem nome').trim() || 'Sem nome';

    // Verifica se já existe uma ficha desse tipo para o usuário
    const { data: existing } = await sb
        .from('fichas')
        .select('id')
        .eq('user_id', user.id)
        .eq('tipo', tipo)
        .maybeSingle();

    let result;

    if (existing) {
        // UPDATE — atualiza a ficha existente
        result = await sb
            .from('fichas')
            .update({ nome: nomeFinal, dados })
            .eq('id', existing.id)
            .select()
            .single();
    } else {
        // INSERT — primeira vez salvando
        result = await sb
            .from('fichas')
            .insert({ user_id: user.id, tipo, nome: nomeFinal, dados })
            .select()
            .single();
    }

    return result;
}

// ── CARREGAR FICHA DA NUVEM ──────────────────────────────────────
async function cloudLoad(tipo) {
    const user = await getUser();
    if (!user) return null;

    const { data, error } = await sb
        .from('fichas')
        .select('*')
        .eq('user_id', user.id)
        .eq('tipo', tipo)
        .maybeSingle();

    if (error || !data) return null;
    return data.dados;
}

// ── LISTAR TODAS AS FICHAS DO USUÁRIO ────────────────────────────
async function cloudListAll() {
    const user = await getUser();
    if (!user) return [];

    const { data, error } = await sb
        .from('fichas')
        .select('id, tipo, nome, atualizado_em')
        .eq('user_id', user.id)
        .order('atualizado_em', { ascending: false });

    if (error) return [];
    return data || [];
}

// ── DELETAR FICHA ────────────────────────────────────────────────
async function cloudDelete(tipo) {
    const user = await getUser();
    if (!user) return;

    await sb
        .from('fichas')
        .delete()
        .eq('user_id', user.id)
        .eq('tipo', tipo);
}

// ── INDICADOR VISUAL DE SAVE ─────────────────────────────────────
function showSaveIndicator(msg = '✓ Salvo na nuvem', isError = false) {
    const el = document.getElementById('saveIndicator');
    if (!el) return;
    el.textContent = msg;
    el.style.background = isError ? 'rgba(180,40,40,0.85)' : '';
    el.classList.add('show');
    clearTimeout(el._timeout);
    el._timeout = setTimeout(() => el.classList.remove('show'), 2500);
}
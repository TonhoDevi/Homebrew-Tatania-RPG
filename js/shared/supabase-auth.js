// ═══════════════════════════════════════════════════════════════
//  supabase-auth.js  —  Templo de Tatânea
//  Coloque este arquivo em: js/shared/supabase-auth.js
// ═══════════════════════════════════════════════════════════════

// ── 1. SUAS CHAVES DO SUPABASE ───────────────────────────────────
//  ⚠️  Substitua SUA_ANON_KEY pela chave "anon public" do Supabase
//     Settings → API → anon public
// ────────────────────────────────────────────────────────────────
const SUPABASE_URL  = 'https://mqremvyprwuzqnsmwfqt.supabase.co';
const SUPABASE_ANON = 'sb_publishable_OThvjoIRCIZsWoiEaEMj9w_dXEo4KvOeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcmVtdnlwcnd1enFuc213ZnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjM3NzcsImV4cCI6MjA4OTIzOTc3N30.KFlQBzw9sZo4GtSyqRK5s2PKXbeahsozaiT1z_mz3qA';   // ← troque aqui

// ── 2. CLIENTE SUPABASE (via CDN, sem npm) ───────────────────────
//  O CDN é carregado pelo HTML antes deste script.
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── 3. HELPERS DE SESSÃO ─────────────────────────────────────────

/** Retorna o usuário logado ou null */
async function getUser() {
    const { data: { user } } = await sb.auth.getUser();
    return user;
}

/** Redireciona para login se não estiver logado */
async function requireAuth() {
    const user = await getUser();
    if (!user) {
        // salva a página atual para redirecionar depois do login
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = '/html/auth/login.html';
    }
    return user;
}

/** Desloga e volta para o início */
async function signOut() {
    await sb.auth.signOut();
    window.location.href = '/index.html';
}

// ── 4. NAVBAR DINÂMICA ───────────────────────────────────────────
//  Injeta o botão de usuário/login na navbar automaticamente
async function initAuthNavbar() {
    const user = await getUser();
    const menu = document.querySelector('.navbar-menu');
    if (!menu) return;

    // Remove item anterior de auth se já existir (evita duplicatas)
    menu.querySelector('.nav-auth-item')?.remove();

    const li = document.createElement('li');
    li.className = 'nav-auth-item';

    if (user) {
        // Mostra o nome do usuário + botão sair
        const email = user.email || '';
        const username = email.split('@')[0];
        li.innerHTML = `
            <div class="nav-user-badge">
                <span class="nav-user-name">⚔️ ${username}</span>
                <button class="nav-signout-btn" onclick="signOut()">Sair</button>
            </div>`;
    } else {
        li.innerHTML = `<a href="/html/auth/login.html" class="nav-login-link">🔑 Entrar</a>`;
    }

    menu.appendChild(li);
}

// ── 5. CSS INJETADO PARA A NAVBAR ────────────────────────────────
(function injectNavAuthCSS() {
    if (document.getElementById('nav-auth-css')) return;
    const style = document.createElement('style');
    style.id = 'nav-auth-css';
    style.textContent = `
        .nav-user-badge {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .nav-user-name {
            font-family: 'Cinzel', serif;
            font-size: 0.78rem;
            color: #dfc170;
            letter-spacing: 0.06em;
        }
        .nav-signout-btn {
            font-family: 'Cinzel', serif;
            font-size: 0.7rem;
            letter-spacing: 0.08em;
            padding: 4px 10px;
            background: rgba(200,60,60,0.15);
            border: 1px solid rgba(200,60,60,0.35);
            border-radius: 2px;
            color: #e07070;
            cursor: pointer;
            transition: background 0.2s;
        }
        .nav-signout-btn:hover {
            background: rgba(200,60,60,0.28);
        }
        .nav-login-link {
            font-family: 'Cinzel', serif !important;
            font-size: 0.78rem !important;
            color: #dfc170 !important;
            letter-spacing: 0.08em;
            padding: 4px 12px;
            border: 1px solid rgba(200,160,60,0.35);
            border-radius: 2px;
            transition: border-color 0.2s, background 0.2s;
        }
        .nav-login-link:hover {
            background: rgba(200,160,60,0.12);
            border-color: rgba(200,160,60,0.6);
        }
    `;
    document.head.appendChild(style);
})();

// ── 6. AUTO-INIT ─────────────────────────────────────────────────
//  Quando o DOM estiver pronto, injeta a navbar
document.addEventListener('DOMContentLoaded', initAuthNavbar);
// ========================================
// NAVBAR - COMPARTILHADO
// Usado em todas as páginas
// ========================================

function toggleNavbar() {
    const menu = document.querySelector('.navbar-menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// Fechar menu ao clicar fora (mobile)
document.addEventListener('click', function(e) {
    const menu = document.querySelector('.navbar-menu');
    const toggle = document.querySelector('.navbar-toggle');
    
    if (menu && toggle && menu.classList.contains('active')) {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            menu.classList.remove('active');
        }
    }
});
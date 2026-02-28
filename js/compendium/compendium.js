// ========================================
// COMPÊNDIO DE RAÇAS
// Arquivo: js/compendium/compendium.js
// ========================================

// ========================================
// RENDERIZAR RAÇAS
// ========================================
function renderRacas(racasToRender = RACAS_DATA) {
    const grid = document.getElementById('racasGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (racasToRender.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--cor8); grid-column: 1/-1;">Nenhuma raça encontrada.</p>';
        return;
    }
    
    racasToRender.forEach((raca, index) => {
        const card = document.createElement('div');
        card.className = 'raca-card';
        card.onclick = () => showRacaDetails(index);
        card.innerHTML = `
            <img src="${raca.imagem}" alt="${raca.nome}" class="raca-image">
            <div class="raca-info">
                <h3>${raca.nome}</h3>
                <p class="raca-size">📏 Tamanho: ${capitalizeFirst(raca.tamanho)}</p>
                <p class="raca-speed">👣 Deslocamento: ${raca.deslocamento}</p>
                <p class="raca-preview">${raca.descricao}</p>
                <button class="btn btn-secondary btn-small">Ver Detalhes →</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ========================================
// MOSTRAR DETALHES DA RAÇA
// ========================================
function showRacaDetails(index) {
    const raca = RACAS_DATA[index];
    const modal = document.getElementById('racaModal');
    const details = document.getElementById('racaDetails');
    
    details.innerHTML = `
        <h2>${raca.nome}</h2>
        <img src="${raca.imagem}" alt="${raca.nome}" style="max-width: 400px; margin: 20px auto; display: block; border: 3px solid var(--cor11);">
        
        <div style="margin-bottom: 20px;">
            <h3>Descrição</h3>
            <p>${raca.descricao}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3>Traços Raciais</h3>
            <ul>
                ${raca.tracos.map(traco => `<li>${traco}</li>`).join('')}
            </ul>
        </div>
        
        <div>
            <h3>Habilidades Especiais</h3>
            ${raca.habilidades.map(hab => `
                <div style="margin-bottom: 15px; padding: 15px; background: rgba(0,0,0,0.3); border-left: 4px solid var(--cor3);">
                    <h4 style="color: var(--cor3);">${hab.nome}</h4>
                    <p>${hab.descricao}</p>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.classList.add('active');
}

function closeRacaModal() {
    document.getElementById('racaModal').classList.remove('active');
}

// ========================================
// FILTROS E BUSCA
// ========================================
function filterRacas() {
    const search = document.getElementById('searchRace').value.toLowerCase();
    const sizeFilter = document.getElementById('filterSize').value;
    
    const filtered = RACAS_DATA.filter(raca => {
        const matchSearch = raca.nome.toLowerCase().includes(search) || 
                          raca.descricao.toLowerCase().includes(search);
        const matchSize = !sizeFilter || raca.tamanho === sizeFilter;
        
        return matchSearch && matchSize;
    });
    
    renderRacas(filtered);
}

// ========================================
// UTILITÁRIOS
// ========================================
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de compêndio
    if (document.getElementById('racasGrid')) {
        renderRacas();
        
        // Adicionar event listeners
        const searchInput = document.getElementById('searchRace');
        const sizeFilter = document.getElementById('filterSize');
        
        if (searchInput) searchInput.addEventListener('input', filterRacas);
        if (sizeFilter) sizeFilter.addEventListener('change', filterRacas);
    }
});
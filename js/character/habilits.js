// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
// lista de habilidades/ características do personagem
let abilities = [];

// ========================================
// GERENCIAMENTO DE HABILIDADES
// ========================================
function renderAbilities() {
    const list = document.getElementById('abilitiesList');
    if (!list) return;

    list.innerHTML = '';

    abilities.forEach((item, index) => {
        const div = document.createElement('div');
        // usamos as mesmas classes de "individuals" para aproveitar o CSS existente
        div.className = 'individuals-unit';
        div.innerHTML = `
            <div class="individuals-unit-header">
                <input
                    type="text"
                    placeholder="Nome da habilidade"
                    value="${item.nome}"
                    oninput="updateAbility(${index}, 'nome', this.value)"
                    onclick="event.stopPropagation()"
                >
                <input
                    type="number"
                    class="ability-uses"
                    placeholder="Usos"
                    value="${item.usos || ''}"
                    oninput="updateAbility(${index}, 'usos', this.value)"
                    onclick="event.stopPropagation()"
                    style="width: 60px; margin-left: 10px;"
                >
                <button
                    class="individuals-unit-expand ${item.expanded ? 'active' : ''}"
                    onclick="toggleAbilityDescription(${index})"
                >
                    ▼
                </button>
            </div>
            <div class="individuals-unit-description ${item.expanded ? 'active' : ''}" id="abilityDesc${index}">
                <div class="individuals-unit-description-content">
                    <textarea
                        placeholder="Descrição da habilidade..."
                        oninput="updateAbility(${index}, 'descricao', this.value)"
                    >${item.descricao || ''}</textarea>
                </div>
                <div class="individuals-unit-actions">
                    <button class="delete-btn" onclick="removeAbility(${index})">✕ Excluir Habilidade</button>
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}

function addAbility() {
    abilities.push({
        nome: '',
        usos: '',
        descricao: '',
        expanded: false
    });
    renderAbilities();
    autoSave();
}

function updateAbility(index, field, value) {
    abilities[index][field] = value;
    autoSave();
}

function removeAbility(index) {
    if (confirm('Deseja excluir esta habilidade?')) {
        abilities.splice(index, 1);
        renderAbilities();
        autoSave();
    }
}

function toggleAbilityDescription(index) {
    abilities[index].expanded = !abilities[index].expanded;
    renderAbilities();
}
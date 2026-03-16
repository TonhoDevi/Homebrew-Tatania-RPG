// ============================================
// DADOS DAS CLASSES — D&D 5e Homebrew
// Arquivo: js/compendium/data-classes.js
// ============================================

const CLASSES_DATA = [
    {
        id: 'ladino',
        nome: 'Ladino',
        subtitulo: 'Versão Épico',
        pagina: '/html/class/class-ladino.html',
        //imagem: 'img/classes/ladino.jpg',
        icone: '🗡️',
        cor: '#4a7a8c',        // cor temática para o card
        dadoDeVida: 'd6',
        atributoChave: 'Destreza',
        armadura: 'Armaduras leves',
        armas: 'Armas simples, bestas de mão, espadas longas, rapieiras, espadas curtas',
        ferramentas: 'Ferramentas de ladrão',
        resistencias: 'Destreza, Inteligência',
        pericias: 'Escolha quatro: Acrobacia, Atletismo, Atuação, Enganação, Furtividade, Intimidação, Intuição, Investigação, Percepção, Persuasão e Prestidigitação',
        descricao: 'Ladinos contam com perícia, furtividade e as vulnerabilidades dos inimigos para obter vantagem em qualquer situação. Mestres da astúcia, eles preferem um ataque preciso a uma barragem de força bruta.',
        papeis: ['Dano', 'Furtividade', 'Suporte', 'Exploração'],
        dificuldade: 'Intermediário',
        subclasses: [
            { nome: 'Assassino',  icone: '💀', descricao: 'Arte da morte, veneno e disfarce' },
            { nome: 'Inquisidor', icone: '🔍', descricao: 'Detecção de mentiras e combate intuitivo' },
            { nome: 'Ladrão',     icone: '🔑', descricao: 'Roubo, escalada e itens mágicos' },
            { nome: 'Saqueador',  icone: '🏹', descricao: 'Sobrevivência, emboscadas e mobilidade' },
        ],
        habilidadesDestaque: ['Ataque Furtivo', 'Ação Ardilosa', 'Evasão', 'Golpe de Sorte'],
    },
    // Adicione mais classes aqui conforme forem criadas
];
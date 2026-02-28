// ========================================
// DADOS DAS RAÇAS HOMEBREW
// ========================================
const RACAS_DATA = [
    {
        nome: "Elfo das Sombras",
        tamanho: "medio",
        deslocamento: "35 pés",
        imagem: "https://via.placeholder.com/300x400/1a0000/dcc70a?text=Elfo+das+Sombras",
        descricao: "Elfos que vivem nas profundezas das florestas sombrias, mestres da furtividade e magia arcana.",
        tracos: [
            "+2 Destreza, +1 Inteligência",
            "Visão no Escuro (120 pés)",
            "Furtividade Aprimorada",
            "Resistência a Encantamento"
        ],
        habilidades: [
            {
                nome: "Passos Sombrios",
                descricao: "Uma vez por descanso curto, pode se teleportar 60 pés para um espaço escuro que possa ver."
            },
            {
                nome: "Magia das Sombras",
                descricao: "Conhece o truque Ilusão Menor. Ao atingir o 3º nível, pode conjurar Invisibilidade uma vez por dia."
            }
        ]
    },
    {
        nome: "Anão de Ferro",
        tamanho: "medio",
        deslocamento: "25 pés",
        imagem: "https://via.placeholder.com/300x400/1a0000/ebdd18?text=Anao+de+Ferro",
        descricao: "Descendentes de ferreiros lendários, possuem pele metálica e resistência sobre-humana.",
        tracos: [
            "+2 Constituição, +1 Força",
            "Visão no Escuro (60 pés)",
            "Pele de Ferro (CA +1)",
            "Resistência a Veneno"
        ],
        habilidades: [
            {
                nome: "Corpo de Ferro",
                descricao: "Resistência a dano de armas não-mágicas."
            },
            {
                nome: "Forjado em Batalha",
                descricao: "Proficiência com armaduras pesadas e armas de guerra."
            }
        ]
    },
    {
        nome: "Meio-Dragão",
        tamanho: "medio",
        deslocamento: "30 pés",
        imagem: "https://via.placeholder.com/300x400/1a0000/ff0000?text=Meio-Dragao",
        descricao: "Descendentes de dragões e humanoides, possuem escamas e poder dracônico.",
        tracos: [
            "+2 Força, +1 Carisma",
            "Visão no Escuro (60 pés)",
            "Resistência a Dano (escolha um tipo)",
            "Arma de Sopro"
        ],
        habilidades: [
            {
                nome: "Sopro Dracônico",
                descricao: "Pode usar uma ação para exalar energia destrutiva. CD 8 + bônus de proficiência + modificador de Constituição."
            },
            {
                nome: "Presença Aterrorizante",
                descricao: "No 5º nível, pode usar uma ação para forçar criaturas próximas a fazer um teste de resistência de Sabedoria ou ficar amedrontadas."
            }
        ]
    }
];
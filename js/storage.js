function defaultState() {
  // Treino focado em vôlei, força, potência, impulsão e físico atlético.
  return {
    version: 1,

    settings: {
      goalWeight: 82,
      activeWorkoutId: null
    },

    workouts: [
      {
        id: uid("workout"),
        name: "Impulsão + Pernas",
        day: "Segunda-feira",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        exercises: [
          {
            id: uid("ex"),
            name: "Agachamento com mochila",
            sets: 3,
            reps: "8-12",
            weight: 0,
            notes: "Use uma mochila com carga que permita executar todas as repetições com boa técnica."
          },
          {
            id: uid("ex"),
            name: "Afundo",
            sets: 3,
            reps: "8 por perna",
            weight: 0,
            notes: "Mantenha joelho e pé alinhados."
          },
          {
            id: uid("ex"),
            name: "Passada + salto",
            sets: 3,
            reps: "3-4 por perna",
            weight: 0,
            notes: "Explosão máxima. Priorize qualidade do salto."
          },
          {
            id: uid("ex"),
            name: "Salto vertical",
            sets: 4,
            reps: "3-4",
            weight: 0,
            notes: "Salte o mais alto possível e descanse bem entre as séries."
          },
          {
            id: uid("ex"),
            name: "Ponte de glúteo",
            sets: 3,
            reps: "12-15",
            weight: 0,
            notes: "Contraia bem os glúteos no topo."
          },
          {
            id: uid("ex"),
            name: "Panturrilha em pé",
            sets: 3,
            reps: "15-20",
            weight: 0,
            notes: "Movimento completo e controlado."
          },
          {
            id: uid("ex"),
            name: "Prancha",
            sets: 3,
            reps: "30-45s",
            weight: 0,
            notes: "Mantenha o abdômen contraído."
          }
        ]
      },

      {
        id: uid("workout"),
        name: "Superior + Estabilidade",
        day: "Terça-feira",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        exercises: [
          {
            id: uid("ex"),
            name: "Flexão de braço",
            sets: 3,
            reps: "8-15",
            weight: 0,
            notes: "Pare antes de perder a técnica."
          },
          {
            id: uid("ex"),
            name: "Remada com mochila",
            sets: 4,
            reps: "8-15",
            weight: 0,
            notes: "Puxe controlando o movimento e mantenha as costas firmes."
          },
          {
            id: uid("ex"),
            name: "Flexão pike",
            sets: 3,
            reps: "6-12",
            weight: 0,
            notes: "Foco nos ombros."
          },
          {
            id: uid("ex"),
            name: "Elevação lateral",
            sets: 3,
            reps: "12-15",
            weight: 0,
            notes: "Pode utilizar garrafas ou objetos leves."
          },
          {
            id: uid("ex"),
            name: "Prancha lateral",
            sets: 3,
            reps: "20-40s por lado",
            weight: 0,
            notes: "Mantenha quadril alinhado."
          },
          {
            id: uid("ex"),
            name: "Dead bug",
            sets: 3,
            reps: "8-12 por lado",
            weight: 0,
            notes: "Movimento lento e controlado."
          }
        ]
      },

      {
        id: uid("workout"),
        name: "Técnica de Vôlei + Mobilidade",
        day: "Quarta-feira",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        exercises: [
          {
            id: uid("ex"),
            name: "Toque",
            sets: 4,
            reps: "3-5 min",
            weight: 0,
            notes: "Trabalhe controle e precisão."
          },
          {
            id: uid("ex"),
            name: "Manchete",
            sets: 4,
            reps: "3-5 min",
            weight: 0,
            notes: "Foco na plataforma dos braços."
          },
          {
            id: uid("ex"),
            name: "Deslocamento lateral",
            sets: 4,
            reps: "20-30s",
            weight: 0,
            notes: "Movimente-se rápido mantendo posição baixa."
          },
          {
            id: uid("ex"),
            name: "Aproximação de ataque",
            sets: 4,
            reps: "5-8",
            weight: 0,
            notes: "Treine a passada de ataque com técnica."
          },
          {
            id: uid("ex"),
            name: "Salto de ataque",
            sets: 3,
            reps: "5",
            weight: 0,
            notes: "Não faça saltos cansado. Priorize qualidade."
          },
          {
            id: uid("ex"),
            name: "Mobilidade de tornozelo",
            sets: 2,
            reps: "30-45s por lado",
            weight: 0,
            notes: "Movimento confortável, sem dor."
          },
          {
            id: uid("ex"),
            name: "Mobilidade de quadril",
            sets: 2,
            reps: "30-45s por lado",
            weight: 0,
            notes: "Movimento controlado."
          },
          {
            id: uid("ex"),
            name: "Mobilidade de ombros",
            sets: 2,
            reps: "30-45s",
            weight: 0,
            notes: "Sem forçar a articulação."
          }
        ]
      },

      {
        id: uid("workout"),
        name: "Potência + Pernas",
        day: "Quinta-feira",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        exercises: [
          {
            id: uid("ex"),
            name: "Agachamento com mochila",
            sets: 3,
            reps: "6-10",
            weight: 0,
            notes: "Use uma carga maior que na segunda somente se a técnica estiver perfeita."
          },
          {
            id: uid("ex"),
            name: "Salto horizontal",
            sets: 4,
            reps: "3",
            weight: 0,
            notes: "Explosão máxima. Descanse bastante entre as séries."
          },
          {
            id: uid("ex"),
            name: "Salto vertical com contramovimento",
            sets: 4,
            reps: "3",
            weight: 0,
            notes: "Tente atingir a maior altura possível."
          },
          {
            id: uid("ex"),
            name: "Afundo búlgaro",
            sets: 3,
            reps: "6-10 por perna",
            weight: 0,
            notes: "Controle a descida."
          },
          {
            id: uid("ex"),
            name: "Panturrilha unilateral",
            sets: 3,
            reps: "12-15 por lado",
            weight: 0,
            notes: "Amplitude completa."
          },
          {
            id: uid("ex"),
            name: "Pogos",
            sets: 3,
            reps: "10-15",
            weight: 0,
            notes: "Saltos rápidos e baixos usando principalmente o tornozelo."
          }
        ]
      },

      {
        id: uid("workout"),
        name: "Full Body Atlético",
        day: "Sexta-feira",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        exercises: [
          {
            id: uid("ex"),
            name: "Agachamento",
            sets: 3,
            reps: "8-12",
            weight: 0,
            notes: "Carga moderada."
          },
          {
            id: uid("ex"),
            name: "Flexão",
            sets: 3,
            reps: "8-15",
            weight: 0,
            notes: "Boa técnica em todas as repetições."
          },
          {
            id: uid("ex"),
            name: "Remada com mochila",
            sets: 3,
            reps: "8-15",
            weight: 0,
            notes: "Controle a descida."
          },
          {
            id: uid("ex"),
            name: "Afundo",
            sets: 3,
            reps: "8 por perna",
            weight: 0,
            notes: "Mantenha estabilidade."
          },
          {
            id: uid("ex"),
            name: "Flexão pike",
            sets: 3,
            reps: "6-12",
            weight: 0,
            notes: "Foco nos ombros."
          },
          {
            id: uid("ex"),
            name: "Prancha",
            sets: 3,
            reps: "30-45s",
            weight: 0,
            notes: "Core firme."
          }
        ]
      },

      {
        id: uid("workout"),
        name: "Vôlei + Saltos",
        day: "Sábado",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        exercises: [
          {
            id: uid("ex"),
            name: "Aquecimento dinâmico",
            sets: 1,
            reps: "8-10 min",
            weight: 0,
            notes: "Corrida leve, mobilidade e movimentos específicos do vôlei."
          },
          {
            id: uid("ex"),
            name: "Deslocamentos de vôlei",
            sets: 4,
            reps: "20-30s",
            weight: 0,
            notes: "Movimentos rápidos e controlados."
          },
          {
            id: uid("ex"),
            name: "Salto de ataque",
            sets: 4,
            reps: "3-5",
            weight: 0,
            notes: "Foque na aproximação e no tempo do salto."
          },
          {
            id: uid("ex"),
            name: "Salto de bloqueio",
            sets: 4,
            reps: "3-5",
            weight: 0,
            notes: "Treine reação rápida e aterrissagem estável."
          },
          {
            id: uid("ex"),
            name: "Sprints curtos",
            sets: 5,
            reps: "10-20m",
            weight: 0,
            notes: "Velocidade máxima com recuperação completa."
          },
          {
            id: uid("ex"),
            name: "Treino livre de vôlei",
            sets: 1,
            reps: "30-60 min",
            weight: 0,
            notes: "Priorize fundamentos e situações reais de jogo."
          }
        ]
      },

      {
        id: uid("workout"),
        name: "Descanso + Recuperação",
        day: "Domingo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        exercises: [
          {
            id: uid("ex"),
            name: "Caminhada leve",
            sets: 1,
            reps: "15-30 min",
            weight: 0,
            notes: "Opcional. Ritmo confortável."
          },
          {
            id: uid("ex"),
            name: "Mobilidade geral",
            sets: 1,
            reps: "10-15 min",
            weight: 0,
            notes: "Movimentos leves, sem dor."
          }
        ]
      }
    ],

    history: [],

    weights: [
      {
        id: uid("weight"),
        date: todayISO(),
        value: 84.2
      }
    ],

    jumps: [
      {
        id: uid("jump"),
        date: todayISO(),
        type: "Salto vertical",
        value: 58,
        unit: "cm",
        notes: "Primeira referência."
      }
    ]
  };
}

(function () {
  "use strict";

  // Camada unica de persistencia: todo o app le e grava apenas neste objeto em LocalStorage.
  var STORAGE_KEY = "forgefit_state_v1";

  function uid(prefix) {
    return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function defaultState() {
    // Dados iniciais reais permitem usar o app imediatamente, sem telas vazias artificiais.
    return {
      version: 1,
      settings: {
        goalWeight: 82,
        activeWorkoutId: null
      },
      workouts: [
        {
          id: uid("workout"),
          name: "Push - Peito, Ombro e Triceps",
          day: "Segunda-feira",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          exercises: [
            { id: uid("ex"), name: "Supino reto", sets: 4, reps: "8-10", weight: 70, notes: "Aumentar carga quando completar 10 reps em todas as series." },
            { id: uid("ex"), name: "Desenvolvimento militar", sets: 3, reps: "8-10", weight: 42, notes: "Manter tronco firme." },
            { id: uid("ex"), name: "Supino inclinado com halteres", sets: 3, reps: "10-12", weight: 24, notes: "" },
            { id: uid("ex"), name: "Elevacao lateral", sets: 4, reps: "12-15", weight: 10, notes: "Controle total na descida." },
            { id: uid("ex"), name: "Triceps corda", sets: 3, reps: "12-15", weight: 35, notes: "" }
          ]
        },
        {
          id: uid("workout"),
          name: "Pull - Costas e Biceps",
          day: "Quarta-feira",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          exercises: [
            { id: uid("ex"), name: "Barra fixa", sets: 4, reps: "6-10", weight: 0, notes: "Registrar carga adicional quando usar." },
            { id: uid("ex"), name: "Remada curvada", sets: 4, reps: "8-10", weight: 60, notes: "" },
            { id: uid("ex"), name: "Puxada alta", sets: 3, reps: "10-12", weight: 55, notes: "" },
            { id: uid("ex"), name: "Face pull", sets: 3, reps: "12-15", weight: 25, notes: "Foco em escapulas." },
            { id: uid("ex"), name: "Rosca direta", sets: 3, reps: "10-12", weight: 28, notes: "" }
          ]
        },
        {
          id: uid("workout"),
          name: "Legs - Forca e Impulsao",
          day: "Sexta-feira",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          exercises: [
            { id: uid("ex"), name: "Agachamento livre", sets: 5, reps: "5", weight: 100, notes: "Aquecimento progressivo antes das series validas." },
            { id: uid("ex"), name: "Levantamento terra romeno", sets: 4, reps: "8", weight: 90, notes: "" },
            { id: uid("ex"), name: "Leg press", sets: 3, reps: "10-12", weight: 180, notes: "" },
            { id: uid("ex"), name: "Box Jump", sets: 4, reps: "5", weight: 0, notes: "Explosao maxima, descanso completo." },
            { id: uid("ex"), name: "Panturrilha em pe", sets: 4, reps: "12-15", weight: 60, notes: "" }
          ]
        }
      ],
      history: [],
      weights: [
        { id: uid("weight"), date: todayISO(), value: 84.2 }
      ],
      jumps: [
        { id: uid("jump"), date: todayISO(), type: "Salto vertical", value: 58, unit: "cm", notes: "Primeira referencia." }
      ]
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        var seeded = defaultState();
        save(seeded);
        return seeded;
      }
      var parsed = JSON.parse(raw);
      return normalize(parsed);
    } catch (error) {
      console.error("Falha ao carregar dados locais.", error);
      var fallback = defaultState();
      save(fallback);
      return fallback;
    }
  }

  function normalize(state) {
    var base = defaultState();
    var safe = state && typeof state === "object" ? state : {};
    return {
      version: 1,
      settings: Object.assign({}, base.settings, safe.settings || {}),
      workouts: Array.isArray(safe.workouts) ? safe.workouts : base.workouts,
      history: Array.isArray(safe.history) ? safe.history : [],
      weights: Array.isArray(safe.weights) ? safe.weights : [],
      jumps: Array.isArray(safe.jumps) ? safe.jumps : []
    };
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getState() {
    return clone(load());
  }

  function setState(nextState) {
    var normalized = normalize(nextState);
    save(normalized);
    window.dispatchEvent(new CustomEvent("forgefit:statechange", { detail: clone(normalized) }));
    return clone(normalized);
  }

  function update(mutator) {
    var state = load();
    mutator(state);
    return setState(state);
  }

  window.StorageService = {
    uid: uid,
    todayISO: todayISO,
    getState: getState,
    setState: setState,
    update: update
  };
})();

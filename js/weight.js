(function () {
  "use strict";

  // Controle de peso separado para alimentar dashboard e graficos sem duplicar calculos.
  function all() {
    return window.StorageService.getState().weights.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
  }

  function add(value, date) {
    var clean = {
      id: window.StorageService.uid("weight"),
      value: Number(value),
      date: date || window.StorageService.todayISO()
    };
    window.StorageService.update(function (state) {
      state.weights.push(clean);
    });
    return clean;
  }

  function remove(id) {
    window.StorageService.update(function (state) {
      state.weights = state.weights.filter(function (entry) {
        return entry.id !== id;
      });
    });
  }

  function latest() {
    var entries = all();
    return entries[entries.length - 1] || null;
  }

  function setGoal(value) {
    window.StorageService.update(function (state) {
      state.settings.goalWeight = value ? Number(value) : null;
    });
  }

  function goal() {
    return window.StorageService.getState().settings.goalWeight;
  }

  function chartPoints() {
    return all().map(function (entry) {
      return {
        label: new Date(entry.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        value: Number(entry.value)
      };
    });
  }

  window.WeightService = {
    all: all,
    add: add,
    remove: remove,
    latest: latest,
    setGoal: setGoal,
    goal: goal,
    chartPoints: chartPoints
  };
})();

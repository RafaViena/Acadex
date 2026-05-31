(function () {
  "use strict";

  // Modulo dedicado aos registros de impulsao e potencia.
  function all() {
    return window.StorageService.getState().jumps.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
  }

  function add(input) {
    var entry = {
      id: window.StorageService.uid("jump"),
      date: input.date || window.StorageService.todayISO(),
      type: input.type,
      value: Number(input.value),
      unit: input.unit || "cm",
      notes: String(input.notes || "").trim()
    };
    window.StorageService.update(function (state) {
      state.jumps.push(entry);
    });
    return entry;
  }

  function remove(id) {
    window.StorageService.update(function (state) {
      state.jumps = state.jumps.filter(function (entry) {
        return entry.id !== id;
      });
    });
  }

  window.JumpService = {
    all: all,
    add: add,
    remove: remove
  };
})();

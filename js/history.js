(function () {
  "use strict";

  // Historico guarda snapshots dos exercicios para preservar as cargas usadas na data.
  function all() {
    return window.StorageService.getState().history.sort(function (a, b) {
      return new Date(b.finishedAt) - new Date(a.finishedAt);
    });
  }

  function addSession(session) {
    var entry = {
      id: window.StorageService.uid("history"),
      workoutId: session.workoutId,
      workoutName: session.workoutName,
      startedAt: session.startedAt,
      finishedAt: session.finishedAt || new Date().toISOString(),
      durationSeconds: Math.max(0, Number(session.durationSeconds || 0)),
      exercises: (session.exercises || []).map(function (exercise) {
        return {
          name: exercise.name,
          sets: Number(exercise.sets || 0),
          reps: String(exercise.reps || ""),
          weight: Number(exercise.weight || 0),
          notes: exercise.notes || ""
        };
      })
    };

    window.StorageService.update(function (state) {
      state.history.push(entry);
    });
    return entry;
  }

  function clear() {
    window.StorageService.update(function (state) {
      state.history = [];
    });
  }

  function totalDurationSeconds() {
    return all().reduce(function (sum, entry) {
      return sum + Number(entry.durationSeconds || 0);
    }, 0);
  }

  function streakDays() {
    // Sequencia considera dias corridos com pelo menos um treino finalizado.
    var dates = all().map(function (entry) {
      return entry.finishedAt.slice(0, 10);
    });
    var unique = Array.from(new Set(dates));
    var cursor = new Date();
    var streak = 0;

    while (unique.indexOf(cursor.toISOString().slice(0, 10)) >= 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function sessionsByWeek(limit) {
    var map = {};
    all().forEach(function (entry) {
      var date = new Date(entry.finishedAt);
      var year = date.getFullYear();
      var firstDay = new Date(year, 0, 1);
      var dayNumber = Math.floor((date - firstDay) / 86400000) + 1;
      var week = Math.ceil((dayNumber + firstDay.getDay()) / 7);
      var key = year + "-S" + String(week).padStart(2, "0");
      map[key] = (map[key] || 0) + 1;
    });

    return Object.keys(map).sort().slice(-(limit || 8)).map(function (key) {
      return { label: key, value: map[key] };
    });
  }

  function loadProgress() {
    var points = [];
    all().slice().reverse().forEach(function (entry) {
      var total = entry.exercises.reduce(function (sum, exercise) {
        return sum + (Number(exercise.sets || 0) * Number(exercise.weight || 0));
      }, 0);
      points.push({
        label: new Date(entry.finishedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        value: total
      });
    });
    return points.slice(-12);
  }

  window.HistoryService = {
    all: all,
    addSession: addSession,
    clear: clear,
    totalDurationSeconds: totalDurationSeconds,
    streakDays: streakDays,
    sessionsByWeek: sessionsByWeek,
    loadProgress: loadProgress
  };
})();

(function () {
  "use strict";

  // Regras de CRUD dos treinos ficam isoladas da interface para simplificar manutencao.
  function all() {
    return window.StorageService.getState().workouts;
  }

  function find(id) {
    return all().find(function (workout) {
      return workout.id === id;
    }) || null;
  }

  function exerciseFromInput(exercise) {
    return {
      id: exercise.id || window.StorageService.uid("ex"),
      name: String(exercise.name || "").trim(),
      sets: Number(exercise.sets || 0),
      reps: String(exercise.reps || "").trim(),
      weight: Number(exercise.weight || 0),
      notes: String(exercise.notes || "").trim()
    };
  }

  function sanitizeWorkout(input) {
    // Remove exercicios incompletos e normaliza numeros antes de salvar.
    var exercises = (input.exercises || [])
      .map(exerciseFromInput)
      .filter(function (exercise) {
        return exercise.name && exercise.sets > 0 && exercise.reps;
      });

    return {
      id: input.id || window.StorageService.uid("workout"),
      name: String(input.name || "").trim(),
      day: input.day || "Todos os dias",
      exercises: exercises
    };
  }

  function create(input) {
    var clean = sanitizeWorkout(input);
    clean.createdAt = new Date().toISOString();
    clean.updatedAt = clean.createdAt;

    window.StorageService.update(function (state) {
      state.workouts.push(clean);
      if (!state.settings.activeWorkoutId) {
        state.settings.activeWorkoutId = clean.id;
      }
    });
    return clean;
  }

  function update(id, input) {
    var clean = sanitizeWorkout(Object.assign({}, input, { id: id }));
    clean.updatedAt = new Date().toISOString();

    window.StorageService.update(function (state) {
      var index = state.workouts.findIndex(function (workout) {
        return workout.id === id;
      });
      if (index >= 0) {
        clean.createdAt = state.workouts[index].createdAt || clean.updatedAt;
        state.workouts[index] = clean;
      }
    });
    return clean;
  }

  function remove(id) {
    window.StorageService.update(function (state) {
      state.workouts = state.workouts.filter(function (workout) {
        return workout.id !== id;
      });
      if (state.settings.activeWorkoutId === id) {
        state.settings.activeWorkoutId = state.workouts[0] ? state.workouts[0].id : null;
      }
    });
  }

  function duplicate(id) {
    var original = find(id);
    if (!original) {
      return null;
    }
    return create({
      name: original.name + " (copia)",
      day: original.day,
      exercises: original.exercises.map(function (exercise) {
        return Object.assign({}, exercise, { id: window.StorageService.uid("ex") });
      })
    });
  }

  function setActive(id) {
    window.StorageService.update(function (state) {
      state.settings.activeWorkoutId = id;
    });
  }

  function getTodayWorkout() {
    var state = window.StorageService.getState();
    var dayName = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(new Date());
    dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    var exact = state.workouts.find(function (workout) {
      return workout.day === dayName;
    });
    var active = state.workouts.find(function (workout) {
      return workout.id === state.settings.activeWorkoutId;
    });
    return exact || active || state.workouts[0] || null;
  }

  window.WorkoutService = {
    all: all,
    find: find,
    create: create,
    update: update,
    remove: remove,
    duplicate: duplicate,
    setActive: setActive,
    getTodayWorkout: getTodayWorkout
  };
})();

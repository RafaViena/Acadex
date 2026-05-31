(function () {
  "use strict";

  // app.js orquestra a interface; os dados e regras ficam nos demais arquivos js.
  var charts = {};
  var activeSession = null;
  var sessionStartedAt = null;
  var stopwatch = null;
  var restTimer = null;

  function $(selector) {
    return document.querySelector(selector);
  }

  function $all(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function dateLabel(value, withTime) {
    if (!value) {
      return "--";
    }
    var date = value.length === 10 ? new Date(value + "T00:00:00") : new Date(value);
    var options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: withTime ? "2-digit" : undefined,
      minute: withTime ? "2-digit" : undefined
    };
    return withTime ? date.toLocaleString("pt-BR", options) : date.toLocaleDateString("pt-BR", options);
  }

  function showToast(message) {
    var toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timeoutId);
    showToast.timeoutId = setTimeout(function () {
      toast.classList.remove("show");
    }, 2600);
  }

  function moneylessKg(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: Number(value) % 1 ? 1 : 0,
      maximumFractionDigits: 1
    }) + " kg";
  }

  function renderAll() {
    renderTodayLabel();
    renderDashboard();
    renderWorkoutOptions();
    renderWorkouts();
    renderSession();
    renderHistory();
    renderWeight();
    renderJump();
    renderCharts();
  }

  function renderTodayLabel() {
    $("#todayLabel").textContent = new Intl.DateTimeFormat("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short"
    }).format(new Date());
  }

  function renderDashboard() {
    var state = window.StorageService.getState();
    var latestWeight = window.WeightService.latest();
    var goalWeight = window.WeightService.goal();
    var todayWorkout = window.WorkoutService.getTodayWorkout();
    var history = window.HistoryService.all();
    var last = history[0];
    var totalHours = window.HistoryService.totalDurationSeconds() / 3600;

    $("#metricCurrentWeight").textContent = latestWeight ? moneylessKg(latestWeight.value) : "-- kg";
    $("#metricWeightTrend").textContent = latestWeight ? "Atualizado em " + dateLabel(latestWeight.date, false) : "Sem registros";
    $("#metricGoalWeight").textContent = goalWeight ? moneylessKg(goalWeight) : "-- kg";
    $("#metricGoalGap").textContent = latestWeight && goalWeight
      ? Math.abs(latestWeight.value - goalWeight).toFixed(1).replace(".", ",") + " kg ate a meta"
      : "Defina uma meta";
    $("#metricTodayWorkout").textContent = todayWorkout ? todayWorkout.name : "--";
    $("#metricTodayWorkoutInfo").textContent = todayWorkout
      ? todayWorkout.exercises.length + " exercicios - " + todayWorkout.day
      : "Crie sua rotina";
    $("#metricStreak").textContent = window.HistoryService.streakDays();
    $("#metricTotalWorkouts").textContent = history.length;
    $("#metricHours").textContent = totalHours.toFixed(totalHours >= 10 ? 0 : 1).replace(".", ",") + "h";
    $("#metricLastWorkout").textContent = last ? last.workoutName : "Nenhum treino finalizado";
    $("#metricLastWorkoutDate").textContent = last ? dateLabel(last.finishedAt, true) : "Finalize um treino para registrar";
    $("#availableWorkoutCount").textContent = state.workouts.length + (state.workouts.length === 1 ? " treino" : " treinos");
  }

  function renderWorkoutOptions() {
    var state = window.StorageService.getState();
    var select = $("#activeWorkoutSelect");
    var activeId = state.settings.activeWorkoutId || (state.workouts[0] && state.workouts[0].id);

    select.innerHTML = state.workouts.map(function (workout) {
      return "<option value=\"" + escapeHtml(workout.id) + "\"" + (workout.id === activeId ? " selected" : "") + ">" +
        escapeHtml(workout.name) + "</option>";
    }).join("");

    if (!state.workouts.length) {
      select.innerHTML = "<option value=\"\">Crie um treino primeiro</option>";
    }
  }

  function renderWorkouts() {
    var workouts = window.WorkoutService.all();
    var target = $("#workoutList");

    if (!workouts.length) {
      target.innerHTML = "<div class=\"empty-state\">Nenhum treino criado ainda.</div>";
      return;
    }

    target.innerHTML = workouts.map(function (workout) {
      var totalSets = workout.exercises.reduce(function (sum, exercise) {
        return sum + Number(exercise.sets || 0);
      }, 0);
      return [
        "<article class=\"workout-card\">",
        "  <div class=\"card-header\">",
        "    <div>",
        "      <h3>" + escapeHtml(workout.name) + "</h3>",
        "      <p>" + escapeHtml(workout.day) + " - " + workout.exercises.length + " exercicios</p>",
        "    </div>",
        "    <span class=\"tag\">" + totalSets + " series</span>",
        "  </div>",
        "  <div class=\"tag-row\">" + workout.exercises.slice(0, 6).map(function (exercise) {
          return "<span class=\"tag\">" + escapeHtml(exercise.name) + " - " + escapeHtml(exercise.reps) + "</span>";
        }).join("") + "</div>",
        "  <div class=\"card-actions\">",
        "    <button class=\"primary-button\" type=\"button\" data-action=\"start-workout\" data-id=\"" + escapeHtml(workout.id) + "\">Iniciar</button>",
        "    <button class=\"secondary-button\" type=\"button\" data-action=\"edit-workout\" data-id=\"" + escapeHtml(workout.id) + "\">Editar</button>",
        "    <button class=\"secondary-button\" type=\"button\" data-action=\"duplicate-workout\" data-id=\"" + escapeHtml(workout.id) + "\">Duplicar</button>",
        "    <button class=\"danger-button\" type=\"button\" data-action=\"delete-workout\" data-id=\"" + escapeHtml(workout.id) + "\">Excluir</button>",
        "  </div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderSession() {
    var status = $("#sessionStatus");
    if (!activeSession) {
      $("#activeWorkoutName").textContent = "Nenhum treino selecionado";
      $("#activeExerciseCount").textContent = "0 exercicios";
      $("#activeExerciseList").innerHTML = "<div class=\"empty-state\">Escolha um treino no dashboard ou na aba Treinos para executar.</div>";
      $("#sessionTimer").textContent = "00:00:00";
      status.textContent = "Parado";
      status.className = "status-badge";
      return;
    }

    $("#activeWorkoutName").textContent = activeSession.name;
    $("#activeExerciseCount").textContent = activeSession.exercises.length + " exercicios";
    status.textContent = stopwatch && stopwatch.running ? "Rodando" : "Pausado";
    status.className = "status-badge " + (stopwatch && stopwatch.running ? "running" : "paused");

    $("#activeExerciseList").innerHTML = activeSession.exercises.map(function (exercise, index) {
      return [
        "<article class=\"exercise-run\">",
        "  <h4>" + (index + 1) + ". " + escapeHtml(exercise.name) + "</h4>",
        "  <div class=\"exercise-tags\">",
        "    <span class=\"tag\">" + escapeHtml(exercise.sets) + " series</span>",
        "    <span class=\"tag\">" + escapeHtml(exercise.reps) + " reps</span>",
        "    <span class=\"tag\">" + moneylessKg(exercise.weight) + "</span>",
        "  </div>",
        exercise.notes ? "  <p>" + escapeHtml(exercise.notes) + "</p>" : "",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderHistory() {
    var history = window.HistoryService.all();
    var target = $("#historyList");

    if (!history.length) {
      target.innerHTML = "<div class=\"empty-state\">Seu historico aparecera aqui quando finalizar treinos.</div>";
      return;
    }

    target.innerHTML = history.map(function (entry) {
      var weights = entry.exercises
        .filter(function (exercise) { return Number(exercise.weight) > 0; })
        .map(function (exercise) { return escapeHtml(exercise.name) + ": " + moneylessKg(exercise.weight); })
        .join(" | ");

      return [
        "<article class=\"history-card\">",
        "  <div class=\"card-header\">",
        "    <div>",
        "      <h3>" + escapeHtml(entry.workoutName) + "</h3>",
        "      <p>" + dateLabel(entry.finishedAt, true) + "</p>",
        "    </div>",
        "    <span class=\"tag\">" + window.TimerService.formatDuration(entry.durationSeconds) + "</span>",
        "  </div>",
        "  <div class=\"tag-row\">",
        "    <span class=\"tag\">" + entry.exercises.length + " exercicios</span>",
        "    <span class=\"tag\">" + escapeHtml(weights || "Sem carga registrada") + "</span>",
        "  </div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderWeight() {
    var entries = window.WeightService.all().slice().reverse();
    var latest = window.WeightService.latest();
    var goal = window.WeightService.goal();
    var target = $("#weightList");

    $("#weightDateInput").value = $("#weightDateInput").value || window.StorageService.todayISO();
    $("#weightInput").value = "";
    $("#goalWeightInput").value = goal || "";

    if (!entries.length) {
      target.innerHTML = "<div class=\"empty-state\">Registre seu peso para acompanhar a evolucao.</div>";
    } else {
      target.innerHTML = entries.map(function (entry) {
        return [
          "<article class=\"weight-card\">",
          "  <div class=\"card-header\">",
          "    <div>",
          "      <h3>" + moneylessKg(entry.value) + "</h3>",
          "      <p>" + dateLabel(entry.date, false) + "</p>",
          "    </div>",
          "    <button class=\"danger-button\" type=\"button\" data-action=\"delete-weight\" data-id=\"" + escapeHtml(entry.id) + "\">Excluir</button>",
          "  </div>",
          "</article>"
        ].join("");
      }).join("");
    }

    if (latest) {
      $("#weightInput").placeholder = latest.value;
    }
  }

  function renderJump() {
    var entries = window.JumpService.all();
    var target = $("#jumpList");
    $("#jumpDateInput").value = $("#jumpDateInput").value || window.StorageService.todayISO();

    if (!entries.length) {
      target.innerHTML = "<div class=\"empty-state\">Registre salto vertical, box jump, pliometria ou agachamento explosivo.</div>";
      return;
    }

    target.innerHTML = entries.map(function (entry) {
      return [
        "<article class=\"jump-card\">",
        "  <div class=\"card-header\">",
        "    <div>",
        "      <h3>" + escapeHtml(entry.type) + " - " + escapeHtml(entry.value) + " " + escapeHtml(entry.unit) + "</h3>",
        "      <p>" + dateLabel(entry.date, false) + (entry.notes ? " - " + escapeHtml(entry.notes) : "") + "</p>",
        "    </div>",
        "    <button class=\"danger-button\" type=\"button\" data-action=\"delete-jump\" data-id=\"" + escapeHtml(entry.id) + "\">Excluir</button>",
        "  </div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderCharts() {
    // O app continua funcional se o CDN falhar; apenas os graficos exibem aviso.
    if (!window.Chart) {
      renderChartFallbacks();
      return;
    }

    var weightPoints = window.WeightService.chartPoints();
    var weekly = window.HistoryService.sessionsByWeek(8);
    var load = window.HistoryService.loadProgress();

    createOrUpdateChart("weightChart", "line", weightPoints.map(prop("label")), [{
      label: "Peso corporal",
      data: weightPoints.map(prop("value")),
      borderColor: "#3ddc97",
      backgroundColor: "rgba(61, 220, 151, 0.18)",
      tension: 0.35,
      fill: true
    }]);

    createOrUpdateChart("dashboardWeightChart", "line", weightPoints.map(prop("label")), [{
      label: "Peso corporal",
      data: weightPoints.map(prop("value")),
      borderColor: "#3ddc97",
      backgroundColor: "rgba(61, 220, 151, 0.18)",
      tension: 0.35,
      fill: true
    }]);

    createOrUpdateChart("weeklyWorkoutsChart", "bar", weekly.map(prop("label")), [{
      label: "Treinos",
      data: weekly.map(prop("value")),
      backgroundColor: "#44a6ff",
      borderRadius: 6
    }]);

    createOrUpdateChart("loadProgressChart", "line", load.map(prop("label")), [{
      label: "Carga total por sessao",
      data: load.map(prop("value")),
      borderColor: "#f7c948",
      backgroundColor: "rgba(247, 201, 72, 0.16)",
      tension: 0.35,
      fill: true
    }]);
  }

  function prop(key) {
    return function (item) {
      return item[key];
    };
  }

  function createOrUpdateChart(canvasId, type, labels, datasets) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) {
      return;
    }
    if (charts[canvasId]) {
      charts[canvasId].data.labels = labels;
      charts[canvasId].data.datasets = datasets;
      charts[canvasId].update();
      return;
    }

    charts[canvasId] = new window.Chart(canvas, {
      type: type,
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#d9dde7" }
          }
        },
        scales: {
          x: {
            ticks: { color: "#a8adb8" },
            grid: { color: "rgba(255,255,255,0.06)" }
          },
          y: {
            beginAtZero: type === "bar",
            ticks: { color: "#a8adb8" },
            grid: { color: "rgba(255,255,255,0.06)" }
          }
        }
      }
    });
  }

  function renderChartFallbacks() {
    ["weightChart", "dashboardWeightChart", "weeklyWorkoutsChart", "loadProgressChart"].forEach(function (id) {
      var canvas = document.getElementById(id);
      if (canvas && !canvas.dataset.fallback) {
        canvas.dataset.fallback = "true";
        var note = document.createElement("p");
        note.className = "muted";
        note.textContent = "Chart.js nao carregou. Conecte-se a internet ou hospede no GitHub Pages para ver este grafico.";
        canvas.insertAdjacentElement("afterend", note);
      }
    });
  }

  function openWorkoutDialog(workout) {
    $("#workoutDialogTitle").textContent = workout ? "Editar treino" : "Novo treino";
    $("#workoutIdInput").value = workout ? workout.id : "";
    $("#workoutNameInput").value = workout ? workout.name : "";
    $("#workoutDayInput").value = workout ? workout.day : "Todos os dias";
    renderExerciseEditors(workout ? workout.exercises : [blankExercise()]);
    $("#workoutDialog").showModal();
  }

  function blankExercise() {
    return { id: "", name: "", sets: 3, reps: "10-12", weight: 0, notes: "" };
  }

  function renderExerciseEditors(exercises) {
    $("#exerciseEditorList").innerHTML = exercises.map(function (exercise, index) {
      return [
        "<article class=\"exercise-editor\" data-exercise-index=\"" + index + "\">",
        "  <div class=\"dialog-section-title\">",
        "    <h4>Exercicio " + (index + 1) + "</h4>",
        "    <button class=\"danger-button\" type=\"button\" data-action=\"remove-exercise\">Remover</button>",
        "  </div>",
        "  <input type=\"hidden\" data-field=\"id\" value=\"" + escapeHtml(exercise.id || "") + "\">",
        "  <div class=\"exercise-grid\">",
        "    <label>Nome<input type=\"text\" data-field=\"name\" value=\"" + escapeHtml(exercise.name) + "\" required></label>",
        "    <label>Series<input type=\"number\" min=\"1\" max=\"20\" data-field=\"sets\" value=\"" + escapeHtml(exercise.sets) + "\" required></label>",
        "    <label>Repeticoes<input type=\"text\" data-field=\"reps\" value=\"" + escapeHtml(exercise.reps) + "\" required></label>",
        "    <label>Peso (kg)<input type=\"number\" min=\"0\" max=\"1000\" step=\"0.5\" data-field=\"weight\" value=\"" + escapeHtml(exercise.weight) + "\"></label>",
        "    <label>Observacoes<textarea rows=\"2\" data-field=\"notes\">" + escapeHtml(exercise.notes) + "</textarea></label>",
        "  </div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function collectExerciseEditors() {
    return $all(".exercise-editor").map(function (card) {
      var data = {};
      $all("[data-field]", card).forEach(function (field) {
        data[field.dataset.field] = field.value;
      });
      return data;
    });
  }

  function startWorkout(id) {
    var workout = window.WorkoutService.find(id);
    if (!workout) {
      showToast("Treino nao encontrado.");
      return;
    }

    activeSession = JSON.parse(JSON.stringify(workout));
    sessionStartedAt = new Date().toISOString();
    window.WorkoutService.setActive(id);

    if (!stopwatch) {
      stopwatch = new window.TimerService.Stopwatch(function (seconds) {
        $("#sessionTimer").textContent = window.TimerService.formatDuration(seconds);
      });
    }
    stopwatch.reset();
    stopwatch.start();

    showView("session");
    renderAll();
    showToast("Treino iniciado.");
  }

  function finishWorkout() {
    if (!activeSession || !stopwatch) {
      showToast("Nenhum treino ativo para finalizar.");
      return;
    }

    stopwatch.pause();
    var duration = stopwatch.seconds();
    if (duration < 1) {
      duration = 1;
    }

    window.HistoryService.addSession({
      workoutId: activeSession.id,
      workoutName: activeSession.name,
      startedAt: sessionStartedAt || new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      durationSeconds: duration,
      exercises: activeSession.exercises
    });

    activeSession = null;
    sessionStartedAt = null;
    stopwatch.reset();
    if (restTimer) {
      restTimer.stop();
    }
    $("#restPanel").classList.remove("done");
    renderAll();
    showView("history");
    showToast("Treino finalizado e salvo no historico.");
  }

  function showView(viewName) {
    $all(".view").forEach(function (view) {
      view.classList.toggle("is-active", view.id === "view-" + viewName);
    });
    $all(".bottom-nav button").forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.view === viewName);
    });
    if (viewName === "charts" || viewName === "weight") {
      setTimeout(renderCharts, 80);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function bindEvents() {
    // Eventos sao centralizados para manter o HTML estatico e facil de hospedar.
    $all(".bottom-nav button").forEach(function (button) {
      button.addEventListener("click", function () {
        showView(button.dataset.view);
      });
    });

    $("#quickStartBtn").addEventListener("click", function () {
      var workout = window.WorkoutService.getTodayWorkout();
      if (workout) {
        startWorkout(workout.id);
      } else {
        showView("workouts");
        showToast("Crie um treino primeiro.");
      }
    });

    $("#startSelectedWorkoutBtn").addEventListener("click", function () {
      var id = $("#activeWorkoutSelect").value;
      if (id) {
        startWorkout(id);
      }
    });

    $("#activeWorkoutSelect").addEventListener("change", function (event) {
      if (event.target.value) {
        window.WorkoutService.setActive(event.target.value);
        renderAll();
      }
    });

    $("#newWorkoutBtn").addEventListener("click", function () {
      openWorkoutDialog(null);
    });

    $("#workoutList").addEventListener("click", function (event) {
      var button = event.target.closest("button[data-action]");
      if (!button) {
        return;
      }
      var id = button.dataset.id;
      if (button.dataset.action === "start-workout") {
        startWorkout(id);
      }
      if (button.dataset.action === "edit-workout") {
        openWorkoutDialog(window.WorkoutService.find(id));
      }
      if (button.dataset.action === "duplicate-workout") {
        window.WorkoutService.duplicate(id);
        renderAll();
        showToast("Treino duplicado.");
      }
      if (button.dataset.action === "delete-workout" && confirm("Excluir este treino?")) {
        window.WorkoutService.remove(id);
        renderAll();
        showToast("Treino excluido.");
      }
    });

    $("#closeWorkoutDialogBtn").addEventListener("click", closeWorkoutDialog);
    $("#cancelWorkoutBtn").addEventListener("click", closeWorkoutDialog);

    $("#addExerciseBtn").addEventListener("click", function () {
      var exercises = collectExerciseEditors();
      exercises.push(blankExercise());
      renderExerciseEditors(exercises);
    });

    $("#exerciseEditorList").addEventListener("click", function (event) {
      var button = event.target.closest("button[data-action='remove-exercise']");
      if (!button) {
        return;
      }
      var exercises = collectExerciseEditors();
      var index = Number(button.closest(".exercise-editor").dataset.exerciseIndex);
      exercises.splice(index, 1);
      renderExerciseEditors(exercises.length ? exercises : [blankExercise()]);
    });

    $("#workoutForm").addEventListener("submit", function (event) {
      event.preventDefault();
      var id = $("#workoutIdInput").value;
      var payload = {
        name: $("#workoutNameInput").value,
        day: $("#workoutDayInput").value,
        exercises: collectExerciseEditors()
      };
      var validExercises = payload.exercises.filter(function (exercise) {
        return exercise.name.trim() && Number(exercise.sets) > 0 && String(exercise.reps).trim();
      });

      if (!payload.name.trim()) {
        showToast("Informe o nome do treino.");
        return;
      }
      if (!validExercises.length) {
        showToast("Adicione pelo menos um exercicio.");
        return;
      }
      payload.exercises = validExercises;

      if (id) {
        window.WorkoutService.update(id, payload);
        showToast("Treino atualizado.");
      } else {
        window.WorkoutService.create(payload);
        showToast("Treino criado.");
      }
      closeWorkoutDialog();
      renderAll();
    });

    $("#sessionStartBtn").addEventListener("click", function () {
      if (!activeSession) {
        var chosen = $("#activeWorkoutSelect").value || (window.WorkoutService.getTodayWorkout() || {}).id;
        if (chosen) {
          startWorkout(chosen);
        }
        return;
      }
      stopwatch.start();
      renderSession();
    });

    $("#sessionPauseBtn").addEventListener("click", function () {
      if (stopwatch) {
        stopwatch.pause();
        renderSession();
      }
    });

    $("#sessionFinishBtn").addEventListener("click", function () {
      if (activeSession && confirm("Finalizar e salvar este treino?")) {
        finishWorkout();
      }
    });

    $("#restPanel").addEventListener("click", function (event) {
      var button = event.target.closest("button[data-rest]");
      if (!button) {
        return;
      }
      ensureRestTimer();
      $("#restPanel").classList.remove("done");
      restTimer.start(Number(button.dataset.rest));
    });

    $("#stopRestBtn").addEventListener("click", function () {
      ensureRestTimer();
      restTimer.stop();
      $("#restPanel").classList.remove("done");
    });

    $("#clearHistoryBtn").addEventListener("click", function () {
      if (confirm("Limpar todo o historico de treinos?")) {
        window.HistoryService.clear();
        renderAll();
        showToast("Historico limpo.");
      }
    });

    $("#weightForm").addEventListener("submit", function (event) {
      event.preventDefault();
      var weight = Number($("#weightInput").value);
      var goal = $("#goalWeightInput").value;
      if (weight > 0) {
        window.WeightService.add(weight, $("#weightDateInput").value);
      }
      window.WeightService.setGoal(goal);
      renderAll();
      showToast("Peso salvo.");
    });

    $("#weightList").addEventListener("click", function (event) {
      var button = event.target.closest("button[data-action='delete-weight']");
      if (button) {
        window.WeightService.remove(button.dataset.id);
        renderAll();
        showToast("Registro de peso excluido.");
      }
    });

    $("#jumpForm").addEventListener("submit", function (event) {
      event.preventDefault();
      window.JumpService.add({
        type: $("#jumpTypeInput").value,
        value: $("#jumpValueInput").value,
        unit: $("#jumpUnitInput").value,
        date: $("#jumpDateInput").value,
        notes: $("#jumpNotesInput").value
      });
      $("#jumpValueInput").value = "";
      $("#jumpNotesInput").value = "";
      renderAll();
      showToast("Impulsao registrada.");
    });

    $("#jumpList").addEventListener("click", function (event) {
      var button = event.target.closest("button[data-action='delete-jump']");
      if (button) {
        window.JumpService.remove(button.dataset.id);
        renderAll();
        showToast("Registro excluido.");
      }
    });

    window.addEventListener("forgefit:statechange", function () {
      renderDashboard();
    });
  }

  function closeWorkoutDialog() {
    $("#workoutDialog").close();
  }

  function ensureRestTimer() {
    if (restTimer) {
      return;
    }
    restTimer = new window.TimerService.RestTimer(function (seconds) {
      $("#restTimer").textContent = window.TimerService.formatRest(seconds);
    }, function () {
      $("#restPanel").classList.add("done");
      showToast("Descanso finalizado.");
    });
  }

  function init() {
    stopwatch = new window.TimerService.Stopwatch(function (seconds) {
      $("#sessionTimer").textContent = window.TimerService.formatDuration(seconds);
    });
    ensureRestTimer();
    bindEvents();
    renderAll();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

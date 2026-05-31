(function () {
  "use strict";

  // Utilitarios de tempo compartilhados pelo cronometro do treino e pelo descanso.
  function formatDuration(totalSeconds) {
    var seconds = Math.max(0, Math.floor(totalSeconds));
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = seconds % 60;
    return [h, m, s].map(function (part) {
      return String(part).padStart(2, "0");
    }).join(":");
  }

  function formatRest(totalSeconds) {
    var seconds = Math.max(0, Math.floor(totalSeconds));
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function Stopwatch(onTick) {
    // O cronometro acumula tempo antes da pausa para nao perder a duracao da sessao.
    this.onTick = onTick;
    this.startedAt = null;
    this.elapsedBeforeStart = 0;
    this.intervalId = null;
    this.running = false;
  }

  Stopwatch.prototype.seconds = function () {
    if (!this.running || !this.startedAt) {
      return Math.floor(this.elapsedBeforeStart / 1000);
    }
    return Math.floor((this.elapsedBeforeStart + Date.now() - this.startedAt) / 1000);
  };

  Stopwatch.prototype.start = function () {
    if (this.running) {
      return;
    }
    this.startedAt = Date.now();
    this.running = true;
    this.tick();
    this.intervalId = setInterval(this.tick.bind(this), 500);
  };

  Stopwatch.prototype.pause = function () {
    if (!this.running) {
      return;
    }
    this.elapsedBeforeStart += Date.now() - this.startedAt;
    this.startedAt = null;
    this.running = false;
    clearInterval(this.intervalId);
    this.tick();
  };

  Stopwatch.prototype.reset = function () {
    clearInterval(this.intervalId);
    this.startedAt = null;
    this.elapsedBeforeStart = 0;
    this.running = false;
    this.tick();
  };

  Stopwatch.prototype.tick = function () {
    if (typeof this.onTick === "function") {
      this.onTick(this.seconds());
    }
  };

  function RestTimer(onTick, onDone) {
    this.onTick = onTick;
    this.onDone = onDone;
    this.remaining = 0;
    this.intervalId = null;
  }

  RestTimer.prototype.start = function (seconds) {
    var self = this;
    this.stop();
    this.remaining = seconds;
    this.emit();
    this.intervalId = setInterval(function () {
      self.remaining -= 1;
      self.emit();
      if (self.remaining <= 0) {
        clearInterval(self.intervalId);
        self.intervalId = null;
        if (typeof self.onDone === "function") {
          self.onDone();
        }
      }
    }, 1000);
  };

  RestTimer.prototype.stop = function () {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.remaining = 0;
    this.emit();
  };

  RestTimer.prototype.emit = function () {
    if (typeof this.onTick === "function") {
      this.onTick(Math.max(0, this.remaining));
    }
  };

  window.TimerService = {
    Stopwatch: Stopwatch,
    RestTimer: RestTimer,
    formatDuration: formatDuration,
    formatRest: formatRest
  };
})();

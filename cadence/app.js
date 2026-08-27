(() => {
  const DEFAULTS = {
    distance: 5000,
    hours: 0,
    minutes: 20,
    seconds: 0,
    cadence: 180,
    stride: 1.39,
  };

  // Recreational (non-elite) target times for common race distances.
  const PRESETS = [
    {
      name: "1000 m",
      distance: 1000,
      slow: { hours: 0, minutes: 5, seconds: 30 },
      medium: { hours: 0, minutes: 4, seconds: 15 },
      fast: { hours: 0, minutes: 3, seconds: 20 },
    },
    {
      name: "1500 m",
      distance: 1500,
      slow: { hours: 0, minutes: 8, seconds: 0 },
      medium: { hours: 0, minutes: 6, seconds: 15 },
      fast: { hours: 0, minutes: 5, seconds: 0 },
    },
    {
      name: "Mile",
      distance: 1609,
      slow: { hours: 0, minutes: 8, seconds: 30 },
      medium: { hours: 0, minutes: 6, seconds: 45 },
      fast: { hours: 0, minutes: 5, seconds: 20 },
    },
    {
      name: "3000 m",
      distance: 3000,
      slow: { hours: 0, minutes: 16, seconds: 30 },
      medium: { hours: 0, minutes: 13, seconds: 0 },
      fast: { hours: 0, minutes: 10, seconds: 30 },
    },
    {
      name: "5K",
      distance: 5000,
      slow: { hours: 0, minutes: 35, seconds: 0 },
      medium: { hours: 0, minutes: 26, seconds: 0 },
      fast: { hours: 0, minutes: 20, seconds: 0 },
    },
    {
      name: "10K",
      distance: 10000,
      slow: { hours: 1, minutes: 15, seconds: 0 },
      medium: { hours: 0, minutes: 55, seconds: 0 },
      fast: { hours: 0, minutes: 42, seconds: 0 },
    },
    {
      name: "15K",
      distance: 15000,
      slow: { hours: 1, minutes: 55, seconds: 0 },
      medium: { hours: 1, minutes: 25, seconds: 0 },
      fast: { hours: 1, minutes: 5, seconds: 0 },
    },
    {
      name: "10 mile",
      distance: 16093,
      slow: { hours: 2, minutes: 5, seconds: 0 },
      medium: { hours: 1, minutes: 35, seconds: 0 },
      fast: { hours: 1, minutes: 15, seconds: 0 },
    },
    {
      name: "Half marathon",
      distance: 21097,
      slow: { hours: 2, minutes: 40, seconds: 0 },
      medium: { hours: 2, minutes: 5, seconds: 0 },
      fast: { hours: 1, minutes: 45, seconds: 0 },
    },
    {
      name: "Marathon",
      distance: 42195,
      slow: { hours: 5, minutes: 15, seconds: 0 },
      medium: { hours: 4, minutes: 10, seconds: 0 },
      fast: { hours: 3, minutes: 30, seconds: 0 },
    },
    {
      name: "50K",
      distance: 50000,
      slow: { hours: 7, minutes: 30, seconds: 0 },
      medium: { hours: 6, minutes: 0, seconds: 0 },
      fast: { hours: 4, minutes: 45, seconds: 0 },
    },
    {
      name: "100K",
      distance: 100000,
      slow: { hours: 15, minutes: 0, seconds: 0 },
      medium: { hours: 12, minutes: 0, seconds: 0 },
      fast: { hours: 9, minutes: 30, seconds: 0 },
    },
  ];

  const PACE_KEYS = ["slow", "medium", "fast"];

  const els = {
    distance: document.getElementById("distance"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds"),
    cadence: document.getElementById("cadence"),
    stride: document.getElementById("stride"),
    resetAll: document.getElementById("reset-all"),
    adviceBody: document.getElementById("advice-body"),
    adviceSummary: document.getElementById("advice-summary"),
    adviceGoal1: document.getElementById("advice-goal-1"),
    adviceGoal2: document.getElementById("advice-goal-2"),
    adviceTip: document.getElementById("advice-tip"),
    presetsBody: document.getElementById("presets-body"),
  };

  let updating = false;

  function parseNonNegative(value) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : NaN;
  }

  function parsePositive(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : NaN;
  }

  function getTotalMinutes() {
    const hours = parseNonNegative(els.hours.value);
    const minutes = parseNonNegative(els.minutes.value);
    const seconds = parseNonNegative(els.seconds.value);
    if ([hours, minutes, seconds].some(Number.isNaN)) return NaN;
    return hours * 60 + minutes + seconds / 60;
  }

  function formatClock({ hours, minutes, seconds }) {
    const h = Math.max(0, Math.floor(hours) || 0);
    const m = Math.max(0, Math.floor(minutes) || 0);
    const s = Math.max(0, Math.floor(seconds) || 0);
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    if (h > 0) return `${h}:${mm}:${ss}`;
    return `${m}:${ss}`;
  }

  function formatTargetTime() {
    return formatClock({
      hours: parseNonNegative(els.hours.value) || 0,
      minutes: parseNonNegative(els.minutes.value) || 0,
      seconds: parseNonNegative(els.seconds.value) || 0,
    });
  }

  function formatPresetDistance(distance) {
    return `${distance.toLocaleString("en-GB")} m`;
  }

  function formatDistance(distance) {
    return Number.isFinite(distance)
      ? `${distance.toLocaleString("en-GB")} metres`
      : "—";
  }

  function formatCadence(cadence) {
    if (!Number.isFinite(cadence)) return "—";
    return String(Math.round(cadence));
  }

  function formatStride(stride) {
    return Number.isFinite(stride) ? stride.toFixed(2) : "—";
  }

  function setStrideDisplay(stride) {
    updating = true;
    els.stride.value = Number.isFinite(stride) ? stride.toFixed(2) : "";
    updating = false;
  }

  function setCadenceDisplay(cadence) {
    updating = true;
    els.cadence.value = Number.isFinite(cadence) ? String(Math.round(cadence)) : "";
    updating = false;
  }

  function computeStride(distance, totalMinutes, cadence) {
    if (![distance, totalMinutes, cadence].every((n) => Number.isFinite(n) && n > 0)) {
      return NaN;
    }
    return distance / (totalMinutes * cadence);
  }

  function computeCadence(distance, totalMinutes, stride) {
    if (![distance, totalMinutes, stride].every((n) => Number.isFinite(n) && n > 0)) {
      return NaN;
    }
    return Math.round(distance / (totalMinutes * stride));
  }

  function updateAdvice() {
    const distance = parsePositive(els.distance.value);
    const cadence = parsePositive(els.cadence.value);
    const stride = parsePositive(els.stride.value);
    const targetTime = formatTargetTime();
    const distanceText = formatDistance(distance);
    const cadenceText = formatCadence(cadence);
    const strideText = formatStride(stride);

    els.adviceSummary.textContent =
      `You want to run ${distanceText} in a time of ${targetTime} at a cadence of ${cadenceText}, ` +
      `which means you need a stride length of ${strideText} metres. ` +
      `If you hit the cadence and stride length you will hit your race target.`;

    els.adviceGoal1.textContent =
      `First get used to running at a cadence of ${cadenceText} — run your intervals at this cadence, ` +
      `and gradually extend the interval distances over your training period.`;

    els.adviceGoal2.textContent =
      `Once you're used to running at ${cadenceText}, start working on reaching a stride length of ${strideText} metres, ` +
      `reduce the interval lengths to maintain the cadence and stride length, then gradually extend the interval distances ` +
      `over the training period. Adding hill reps, running up and down, with long, bounding strides, will help you get used ` +
      `to the longer stride length.`;

    els.adviceTip.innerHTML =
      `<strong>Tip</strong>` +
      `Enter your current cadence to see what stride length you need, or enter your current stride length to see what ` +
      `cadence you need. Aim for a cadence of around 180, then use training to extend your stride.`;

    els.adviceBody.classList.remove("is-updating");
    // Retrigger animation
    void els.adviceBody.offsetWidth;
    els.adviceBody.classList.add("is-updating");
  }

  function updateStrideFromInputs() {
    const distance = parsePositive(els.distance.value);
    const totalMinutes = getTotalMinutes();
    const cadence = parsePositive(els.cadence.value);
    const stride = computeStride(distance, totalMinutes, cadence);
    setStrideDisplay(Number.isFinite(stride) ? Math.round(stride * 100) / 100 : NaN);
    updateAdvice();
  }

  function updateCadenceFromStride() {
    const distance = parsePositive(els.distance.value);
    const totalMinutes = getTotalMinutes();
    const stride = parsePositive(els.stride.value);
    const cadence = computeCadence(distance, totalMinutes, stride);
    setCadenceDisplay(cadence);
    updateAdvice();
  }

  function resetDistance() {
    els.distance.value = String(DEFAULTS.distance);
    updateStrideFromInputs();
  }

  function resetTime() {
    els.hours.value = String(DEFAULTS.hours);
    els.minutes.value = String(DEFAULTS.minutes);
    els.seconds.value = String(DEFAULTS.seconds);
    updateStrideFromInputs();
  }

  function resetCadence() {
    els.cadence.value = String(DEFAULTS.cadence);
    updateStrideFromInputs();
  }

  function resetStride() {
    els.stride.value = DEFAULTS.stride.toFixed(2);
    updateCadenceFromStride();
  }

  function resetAll() {
    els.distance.value = String(DEFAULTS.distance);
    els.hours.value = String(DEFAULTS.hours);
    els.minutes.value = String(DEFAULTS.minutes);
    els.seconds.value = String(DEFAULTS.seconds);
    els.cadence.value = String(DEFAULTS.cadence);
    updateStrideFromInputs();
    clearPresetSelection();
  }

  function clearPresetSelection() {
    els.presetsBody.querySelectorAll(".preset-time.is-selected").forEach((btn) => {
      btn.classList.remove("is-selected");
      btn.removeAttribute("aria-pressed");
    });
  }

  function applyPreset(distance, time, button) {
    els.distance.value = String(distance);
    els.hours.value = String(time.hours);
    els.minutes.value = String(time.minutes);
    els.seconds.value = String(time.seconds);
    updateStrideFromInputs();
    clearPresetSelection();
    if (button) {
      button.classList.add("is-selected");
      button.setAttribute("aria-pressed", "true");
    }
    highlightCalculator();
  }

  function highlightCalculator() {
    const calculator = document.querySelector(".calculator");
    if (!calculator) return;
    calculator.classList.remove("is-preset-applied");
    void calculator.offsetWidth;
    calculator.classList.add("is-preset-applied");
    calculator.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderPresets() {
    const fragment = document.createDocumentFragment();

    PRESETS.forEach((preset, presetIndex) => {
      const row = document.createElement("tr");

      const nameCell = document.createElement("th");
      nameCell.scope = "row";
      nameCell.textContent = preset.name;
      row.appendChild(nameCell);

      const distanceCell = document.createElement("td");
      distanceCell.className = "presets__distance";
      distanceCell.textContent = formatPresetDistance(preset.distance);
      row.appendChild(distanceCell);

      PACE_KEYS.forEach((pace) => {
        const cell = document.createElement("td");
        const button = document.createElement("button");
        button.type = "button";
        button.className = `preset-time preset-time--${pace}`;
        button.dataset.presetIndex = String(presetIndex);
        button.dataset.pace = pace;
        button.textContent = formatClock(preset[pace]);
        button.setAttribute(
          "aria-label",
          `Apply ${preset.name}, ${pace} target ${formatClock(preset[pace])}`
        );
        cell.appendChild(button);
        row.appendChild(cell);
      });

      fragment.appendChild(row);
    });

    els.presetsBody.replaceChildren(fragment);
  }

  els.presetsBody.addEventListener("click", (event) => {
    const button = event.target.closest("button.preset-time");
    if (!button || !els.presetsBody.contains(button)) return;
    const preset = PRESETS[Number(button.dataset.presetIndex)];
    const pace = button.dataset.pace;
    if (!preset || !PACE_KEYS.includes(pace)) return;
    applyPreset(preset.distance, preset[pace], button);
  });

  els.distance.addEventListener("input", () => {
    if (!updating) {
      clearPresetSelection();
      updateStrideFromInputs();
    }
  });

  ["hours", "minutes", "seconds"].forEach((key) => {
    els[key].addEventListener("input", () => {
      if (!updating) {
        clearPresetSelection();
        updateStrideFromInputs();
      }
    });
  });

  els.cadence.addEventListener("input", () => {
    if (!updating) updateStrideFromInputs();
  });

  els.stride.addEventListener("input", () => {
    if (!updating) updateCadenceFromStride();
  });

  document.querySelectorAll("[data-reset]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-reset");
      if (target === "distance") resetDistance();
      else if (target === "time") resetTime();
      else if (target === "cadence") resetCadence();
      else if (target === "stride") resetStride();
      clearPresetSelection();
    });
  });

  els.resetAll.addEventListener("click", resetAll);

  renderPresets();
  // Initialise stride + advice from defaults
  updateStrideFromInputs();
})();

const elements = {
  apiKeyInput: document.querySelector("#api-key-input"),
  appVersion: document.querySelector("#app-version"),
  appShell: document.querySelector("#app-shell"),
  askSessionsButton: document.querySelector("#ask-sessions-button"),
  addCalendarEventButton: document.querySelector("#add-calendar-event-button"),
  audioFileInput: document.querySelector("#audio-file-input"),
  chatComposer: document.querySelector("#chat-composer"),
  chatEmptyState: document.querySelector("#chat-empty-state"),
  chatTabButton: document.querySelector("#chat-tab-button"),
  chatThread: document.querySelector("#chat-thread"),
  chatView: document.querySelector("#chat-view"),
  calendarEventDialog: document.querySelector("#calendar-event-dialog"),
  calendarEventEnd: document.querySelector("#calendar-event-end"),
  calendarEventForm: document.querySelector("#calendar-event-form"),
  calendarEventLocation: document.querySelector("#calendar-event-location"),
  calendarEventStart: document.querySelector("#calendar-event-start"),
  calendarEventTitle: document.querySelector("#calendar-event-title"),
  calendarFileInput: document.querySelector("#calendar-file-input"),
  calendarGrid: document.querySelector("#calendar-grid"),
  calendarHeading: document.querySelector("#calendar-heading"),
  calendarNextButton: document.querySelector("#calendar-next-button"),
  calendarPreviousButton: document.querySelector("#calendar-previous-button"),
  calendarTabButton: document.querySelector("#calendar-tab-button"),
  calendarUpcoming: document.querySelector("#calendar-upcoming"),
  calendarViewMode: document.querySelector("#calendar-view-mode"),
  calendarView: document.querySelector("#calendar-view"),
  closeCalendarDialogButton: document.querySelector("#close-calendar-dialog-button"),
  closeGoogleCalendarDialogButton: document.querySelector("#close-google-calendar-dialog-button"),
  clearNotesButton: document.querySelector("#clear-notes-button"),
  contextInput: document.querySelector("#context-input"),
  copyNotesButton: document.querySelector("#copy-notes-button"),
  copyTranscriptButton: document.querySelector("#copy-transcript-button"),
  customPromptInput: document.querySelector("#custom-prompt-input"),
  deleteSessionButton: document.querySelector("#delete-session-button"),
  deleteAudioButton: document.querySelector("#delete-audio-button"),
  exportButton: document.querySelector("#export-button"),
  exportNotesButton: document.querySelector("#export-notes-button"),
  exportTranscriptButton: document.querySelector("#export-transcript-button"),
  fasterWhisperPresetButton: document.querySelector("#faster-whisper-preset-button"),
  generateNotesButton: document.querySelector("#generate-notes-button"),
  googleCalendarButton: document.querySelector("#google-calendar-button"),
  googleCalendarDialog: document.querySelector("#google-calendar-dialog"),
  googleCalendarForm: document.querySelector("#google-calendar-form"),
  googleCalendarSecret: document.querySelector("#google-calendar-secret"),
  importTranscriptButton: document.querySelector("#import-transcript-button"),
  newSessionButton: document.querySelector("#new-session-button"),
  notesBaseUrlInput: document.querySelector("#notes-base-url-input"),
  notesCount: document.querySelector("#notes-count"),
  notesInput: document.querySelector("#notes-input"),
  notesExportFormat: document.querySelector("#notes-export-format"),
  notesModelInput: document.querySelector("#notes-model-input"),
  notesModeHelper: document.querySelector("#notes-mode-helper"),
  notesProviderSelect: document.querySelector("#notes-provider-select"),
  openWriterButton: document.querySelector("#open-writer-button"),
  openTranscriptWriterButton: document.querySelector("#open-transcript-writer-button"),
  phi4MiniPresetButton: document.querySelector("#phi4-mini-preset-button"),
  processingLabel: document.querySelector("#processing-label"),
  processingStatus: document.querySelector("#processing-status"),
  microphoneSourceInput: document.querySelector("#microphone-source-input"),
  recordButton: document.querySelector("#record-button"),
  recordingMonitor: document.querySelector("#recording-monitor"),
  recordingMeta: document.querySelector("#recording-meta"),
  saveAudioButton: document.querySelector("#save-audio-button"),
  loadSavedAudioButton: document.querySelector("#load-saved-audio-button"),
  sessionItemTemplate: document.querySelector("#session-item-template"),
  sessionList: document.querySelector("#session-list"),
  sessionQuestionInput: document.querySelector("#session-question-input"),
  sessionSearch: document.querySelector("#session-search"),
  sessionTabButton: document.querySelector("#session-tab-button"),
  sessionView: document.querySelector("#session-view"),
  sidebarToggle: document.querySelector("#sidebar-toggle"),
  questionScopeSelect: document.querySelector("#question-scope-select"),
  statusText: document.querySelector("#status-text"),
  stopButton: document.querySelector("#stop-button"),
  syncGoogleCalendarButton: document.querySelector("#sync-google-calendar-button"),
  templateSelect: document.querySelector("#template-select"),
  titleInput: document.querySelector("#title-input"),
  transcriptCount: document.querySelector("#transcript-count"),
  transcriptExportFormat: document.querySelector("#transcript-export-format"),
  transcriptFileInput: document.querySelector("#transcript-file-input"),
  transcriptInput: document.querySelector("#transcript-input"),
  transcribeBaseUrlInput: document.querySelector("#transcribe-base-url-input"),
  transcribeButton: document.querySelector("#transcribe-button"),
  transcribeModelInput: document.querySelector("#transcribe-model-input"),
  transcribeModeHelper: document.querySelector("#transcribe-mode-helper"),
  transcribeProviderSelect: document.querySelector("#transcribe-provider-select"),
  systemAudioSourceInput: document.querySelector("#system-audio-source-input"),
  vuMeter: document.querySelector(".vu-meter"),
  vuMeterLevel: document.querySelector("#vu-meter-level"),
  vuMeterStatus: document.querySelector("#vu-meter-status"),
};

const SETTINGS_KEY = "granolie-settings";
const SIDEBAR_COLLAPSED_KEY = "granolie-sidebar-collapsed";
const OPENAI_BASE_URL = "https://api.openai.com/v1";
const OLLAMA_BASE_URL = "http://127.0.0.1:11434";
const OPENAI_NOTES_MODEL = "gpt-4.1-mini";
const OLLAMA_NOTES_MODEL = "phi4-mini";
const OPENAI_TRANSCRIBE_MODEL = "gpt-4o-mini-transcribe";
const FASTER_WHISPER_MODEL = "base";

const state = {
  activeView: "chat",
  activeSessionId: null,
  audioBlob: null,
  audioFileName: "",
  audioMimeType: "",
  audioContext: null,
  audioDestination: null,
  audioLevelData: null,
  audioLevelFrameId: null,
  audioLevelSources: [],
  captureStreams: [],
  calendarEvents: [],
  calendarAnchor: new Date(),
  audioLevelAnalyser: null,
  chatMessages: [],
  isApplyingSession: false,
  isRecording: false,
  isSaving: false,
  isUntitledSessionName: false,
  mediaRecorder: null,
  mediaStream: null,
  recordingChunks: [],
  recordingStartedAt: 0,
  recordingTimerId: null,
  saveTimerId: null,
  savedAudio: null,
  searchQuery: "",
  sessions: [],
  sidebarCollapsed: localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true",
  settings: loadSettings(),
  ollamaModels: [],
  processingTasks: [],
};

function loadSettings() {
  const defaults = {
    apiKey: "",
    notesBaseUrl: OLLAMA_BASE_URL,
    notesModel: OLLAMA_NOTES_MODEL,
    notesProvider: "ollama",
    captureMicrophone: true,
    captureSystemAudio: false,
    transcribeBaseUrl: OPENAI_BASE_URL,
    transcribeProvider: "faster_whisper",
    transcribeModel: FASTER_WHISPER_MODEL,
    customPrompt: "",
  };

  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return {
      apiKey: parsed.apiKey || "",
      notesBaseUrl: parsed.notesBaseUrl || defaults.notesBaseUrl,
      notesModel: parsed.notesModel || defaults.notesModel,
      notesProvider: parsed.notesProvider || defaults.notesProvider,
      captureMicrophone: parsed.captureMicrophone !== false,
      captureSystemAudio: parsed.captureSystemAudio === true,
      transcribeBaseUrl: parsed.transcribeBaseUrl || defaults.transcribeBaseUrl,
      transcribeProvider: parsed.transcribeProvider || defaults.transcribeProvider,
      transcribeModel: parsed.transcribeModel || defaults.transcribeModel,
      customPrompt: parsed.customPrompt || defaults.customPrompt,
    };
  } catch {
    return defaults;
  }
}

function saveSettings() {
  const next = {
    apiKey: elements.apiKeyInput.value.trim(),
    notesBaseUrl: elements.notesBaseUrlInput.value.trim() || OPENAI_BASE_URL,
    notesModel: elements.notesModelInput.value.trim() || OPENAI_NOTES_MODEL,
    notesProvider: elements.notesProviderSelect.value,
    captureMicrophone: elements.microphoneSourceInput.checked,
    captureSystemAudio: elements.systemAudioSourceInput.checked,
    transcribeBaseUrl: elements.transcribeBaseUrlInput.value.trim() || OPENAI_BASE_URL,
    transcribeProvider: elements.transcribeProviderSelect.value,
    transcribeModel: elements.transcribeModelInput.value.trim() || OPENAI_TRANSCRIBE_MODEL,
    customPrompt: elements.customPromptInput.value,
  };

  state.settings = next;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

function applySettings() {
  elements.apiKeyInput.value = state.settings.apiKey;
  elements.notesBaseUrlInput.value = state.settings.notesBaseUrl;
  elements.notesModelInput.value = state.settings.notesModel;
  elements.notesProviderSelect.value = state.settings.notesProvider;
  elements.microphoneSourceInput.checked = state.settings.captureMicrophone;
  elements.systemAudioSourceInput.checked = state.settings.captureSystemAudio;
  elements.transcribeBaseUrlInput.value = state.settings.transcribeBaseUrl;
  elements.transcribeModelInput.value = state.settings.transcribeModel;
  elements.transcribeProviderSelect.value = state.settings.transcribeProvider;
  elements.customPromptInput.value = state.settings.customPrompt;
  syncNotesProviderUi();
  syncTranscriptionProviderUi();
}

function syncApiKeyPlaceholder() {
  const notesProvider = elements.notesProviderSelect.value;
  const transcribeProvider = elements.transcribeProviderSelect.value;
  const notesNeedsKey = notesProvider !== "ollama";
  const transcribeNeedsKey = transcribeProvider !== "faster_whisper";

  if (notesNeedsKey && transcribeNeedsKey) {
    elements.apiKeyInput.placeholder = "Used for transcription and OpenAI-compatible notes";
    return;
  }

  if (notesNeedsKey) {
    elements.apiKeyInput.placeholder = "Used for OpenAI-compatible notes only";
    return;
  }

  if (transcribeNeedsKey) {
    elements.apiKeyInput.placeholder = "Used for cloud transcription only";
    return;
  }

  elements.apiKeyInput.placeholder = "Not needed for fully local notes and transcription";
}

function applyNotesProviderDefaults(provider, options = {}) {
  const force = options.force === true;
  const currentNotesBaseUrl = elements.notesBaseUrlInput.value.trim();
  const currentNotesModel = elements.notesModelInput.value.trim();

  if (provider === "ollama") {
    if (force || !currentNotesBaseUrl || currentNotesBaseUrl === OPENAI_BASE_URL) {
      elements.notesBaseUrlInput.value = OLLAMA_BASE_URL;
    }
    if (force || !currentNotesModel || currentNotesModel === OPENAI_NOTES_MODEL) {
      elements.notesModelInput.value = OLLAMA_NOTES_MODEL;
    }
    return;
  }

  if (force || !currentNotesBaseUrl || currentNotesBaseUrl === OLLAMA_BASE_URL) {
    elements.notesBaseUrlInput.value = OPENAI_BASE_URL;
  }
  if (force || !currentNotesModel || currentNotesModel === OLLAMA_NOTES_MODEL) {
    elements.notesModelInput.value = OPENAI_NOTES_MODEL;
  }
}

function applyTranscriptionProviderDefaults(provider, options = {}) {
  const force = options.force === true;
  const currentModel = elements.transcribeModelInput.value.trim();
  const currentBaseUrl = elements.transcribeBaseUrlInput.value.trim();

  if (provider === "faster_whisper") {
    if (force || !currentModel || currentModel === OPENAI_TRANSCRIBE_MODEL) {
      elements.transcribeModelInput.value = FASTER_WHISPER_MODEL;
    }
    return;
  }

  if (force || !currentBaseUrl) {
    elements.transcribeBaseUrlInput.value = OPENAI_BASE_URL;
  }

  if (force || !currentModel || currentModel === FASTER_WHISPER_MODEL) {
    elements.transcribeModelInput.value = OPENAI_TRANSCRIBE_MODEL;
  }
}

function syncNotesProviderUi() {
  const provider = elements.notesProviderSelect.value;
  const isOllama = provider === "ollama";
  const isLocalTranscription = elements.transcribeProviderSelect.value === "faster_whisper";
  const modelSuffix = state.ollamaModels.length
    ? ` Detected ${state.ollamaModels.length} local model${state.ollamaModels.length === 1 ? "" : "s"}.`
    : "";

  elements.notesModeHelper.textContent = isOllama
    ? `Local note generation uses Ollama on your machine. Transcription settings stay separate.${isLocalTranscription ? " Local transcription is enabled below." : ""}${modelSuffix}`
    : "Audio stays in the current browser session. Notes and transcripts are stored locally on disk.";

  elements.notesBaseUrlInput.placeholder = isOllama ? OLLAMA_BASE_URL : OPENAI_BASE_URL;
  syncApiKeyPlaceholder();
}

function syncTranscriptionProviderUi() {
  const provider = elements.transcribeProviderSelect.value;
  const isLocal = provider === "faster_whisper";

  elements.transcribeModeHelper.textContent = isLocal
    ? "Local transcription uses faster-whisper through Python on this machine. The first run may download the selected Whisper model."
    : "Cloud transcription uses the API URL and model below.";

  elements.transcribeBaseUrlInput.disabled = isLocal;
  elements.transcribeBaseUrlInput.placeholder = OPENAI_BASE_URL;
  syncNotesProviderUi();
  syncApiKeyPlaceholder();
}

function applyPhi4MiniPreset() {
  elements.notesProviderSelect.value = "ollama";
  applyNotesProviderDefaults("ollama", { force: true });
  syncNotesProviderUi();
  saveSettings();
  setStatus("Local phi4-mini preset applied.");
}

function applyFasterWhisperPreset() {
  elements.transcribeProviderSelect.value = "faster_whisper";
  applyTranscriptionProviderDefaults("faster_whisper", { force: true });
  syncTranscriptionProviderUi();
  saveSettings();
  setStatus("Local faster-whisper preset applied.");
}

function renderOllamaModelSuggestions() {
  const list = document.querySelector("#ollama-models");
  list.innerHTML = "";

  for (const model of state.ollamaModels) {
    const option = document.createElement("option");
    option.value = model.name;
    const details = [model.parameterSize, model.quantization].filter(Boolean).join(" ");
    option.label = details || model.name;
    list.append(option);
  }
}

async function refreshOllamaModels(options = {}) {
  const quiet = options.quiet === true;

  try {
    const params = new URLSearchParams();
    const baseUrl = elements.notesBaseUrlInput.value.trim();

    if (baseUrl) {
      params.set("baseUrl", baseUrl);
    }

    const path = params.size ? `/api/ollama/models?${params.toString()}` : "/api/ollama/models";
    const data = await api(path);
    state.ollamaModels = Array.isArray(data.models) ? data.models : [];
    renderOllamaModelSuggestions();
    syncNotesProviderUi();

    if (!quiet) {
      setStatus(
        state.ollamaModels.length
          ? `Detected ${state.ollamaModels.length} local Ollama model${state.ollamaModels.length === 1 ? "" : "s"}.`
          : "Ollama is reachable, but no local models are installed."
      );
    }
  } catch (error) {
    state.ollamaModels = [];
    renderOllamaModelSuggestions();
    syncNotesProviderUi();

    if (!quiet) {
      setStatus(error.message);
    }
  }
}

function setStatus(message) {
  elements.statusText.textContent = message;
}

function setSidebarCollapsed(collapsed) {
  state.sidebarCollapsed = collapsed;
  elements.appShell.classList.toggle("sidebar-collapsed", collapsed);
  elements.sidebarToggle.textContent = collapsed ? "Show notes" : "Hide notes";
  elements.sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
}

function startProcessing(label) {
  const task = { id: crypto.randomUUID(), label };
  state.processingTasks.push(task);
  elements.processingLabel.textContent = label;
  elements.processingStatus.classList.add("active");

  return () => {
    state.processingTasks = state.processingTasks.filter((item) => item.id !== task.id);
    const activeTask = state.processingTasks.at(-1);
    if (activeTask) {
      elements.processingLabel.textContent = activeTask.label;
      return;
    }

    elements.processingLabel.textContent = "Ready";
    elements.processingStatus.classList.remove("active");
  };
}

async function loadAppInfo() {
  const data = await api("/api/app-info");
  elements.appVersion.textContent = data.displayVersion || "";
  document.title = data.windowTitle || "Granolie";
}

function wordCount(value) {
  const words = value.trim().match(/\S+/g);
  return words ? words.length : 0;
}

function updateWordCounts() {
  elements.transcriptCount.textContent = `${wordCount(elements.transcriptInput.value)} words`;
  elements.notesCount.textContent = `${wordCount(elements.notesInput.value)} words`;
}

function relativeTime(value) {
  const date = new Date(value);
  const deltaMs = date.getTime() - Date.now();
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const minutes = Math.round(deltaMs / 60000);

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }

  const hours = Math.round(deltaMs / 3600000);
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }

  const days = Math.round(deltaMs / 86400000);
  return formatter.format(days, "day");
}

function deriveTitle(text) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) {
    return "Untitled session";
  }

  const sentence = compact.split(/[.!?\n]/)[0].trim();
  const short = sentence.split(/\s+/).slice(0, 8).join(" ");
  return short.length > 70 ? `${short.slice(0, 67)}...` : short;
}

function sessionPayloadFromForm() {
  const transcript = elements.transcriptInput.value;
  const title = elements.titleInput.value.trim() || deriveTitle(transcript);
  return {
    title,
    template: elements.templateSelect.value,
    transcript,
    notes: elements.notesInput.value,
    context: elements.contextInput.value,
    summary: elements.notesInput.value.trim().split("\n").find(Boolean)?.slice(0, 90) || "",
  };
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}.`);
  }

  return data;
}

function renderSessionList() {
  const query = state.searchQuery.trim().toLowerCase();
  const sessions = state.sessions.filter((session) => {
    if (!query) {
      return true;
    }

    return [session.title, session.summary]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  elements.sessionList.innerHTML = "";

  if (!sessions.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = query ? "No sessions match this search." : "No sessions yet.";
    elements.sessionList.append(empty);
    return;
  }

  for (const session of sessions) {
    const node = elements.sessionItemTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.sessionId = session.id;
    node.classList.toggle("active", session.id === state.activeSessionId);
    node.querySelector(".session-item-title").textContent = session.title || "Untitled session";
    node.querySelector(".session-item-summary").textContent = session.summary || "No summary yet";
    node.querySelector(".session-item-meta").textContent = relativeTime(session.updatedAt);
    node.addEventListener("click", () => {
      loadSession(session.id)
        .then(() => setActiveView("session"))
        .catch((error) => setStatus(error.message));
    });
    elements.sessionList.append(node);
  }
}

function clearAudioState() {
  state.audioBlob = null;
  state.audioFileName = "";
  state.audioMimeType = "";
  elements.audioFileInput.value = "";
  elements.recordingMeta.textContent = "No audio loaded.";
}

function applySession(session, options = {}) {
  const preserveAudio = options.preserveAudio === true;
  state.isApplyingSession = true;
  state.activeSessionId = session.id;
  state.savedAudio = session.audio || null;
  state.isUntitledSessionName =
    session.title === "Untitled session" && !String(session.transcript || "").trim() && !String(session.notes || "").trim();
  elements.titleInput.value = session.title || "";
  elements.templateSelect.value = session.template || "general";
  elements.transcriptInput.value = session.transcript || "";
  elements.notesInput.value = session.notes || "";
  elements.contextInput.value = session.context || "";
  updateWordCounts();
  renderSessionList();
  if (!preserveAudio) {
    clearAudioState();
  }
  state.isApplyingSession = false;
}

async function refreshSessions(preferredId) {
  const data = await api("/api/sessions");
  state.sessions = data.sessions;
  renderSessionList();

  const nextId = preferredId || state.activeSessionId || state.sessions[0]?.id;
  if (nextId) {
    await loadSession(nextId);
  }
}

function setActiveView(view) {
  state.activeView = ["chat", "calendar", "session"].includes(view) ? view : "chat";
  const showChat = state.activeView === "chat";
  const showCalendar = state.activeView === "calendar";
  elements.chatView.hidden = !showChat;
  elements.calendarView.hidden = !showCalendar;
  elements.sessionView.hidden = state.activeView !== "session";
  elements.chatTabButton.classList.toggle("active", showChat);
  elements.calendarTabButton.classList.toggle("active", showCalendar);
  elements.sessionTabButton.classList.toggle("active", state.activeView === "session");
  elements.chatTabButton.setAttribute("aria-selected", String(showChat));
  elements.calendarTabButton.setAttribute("aria-selected", String(showCalendar));
  elements.sessionTabButton.setAttribute("aria-selected", String(state.activeView === "session"));

  if (showChat) {
    window.requestAnimationFrame(() => elements.sessionQuestionInput.focus());
  }
}

function toLocalDateTimeInput(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function startOfWeek(date = new Date()) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - ((next.getDay() + 6) % 7));
  return next;
}

function renderCalendar() {
  const mode = elements.calendarViewMode.value;
  const anchor = state.calendarAnchor;
  const weekStart = startOfWeek(anchor);
  const formatter = new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric" });
  let days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + index);
    return day;
  });
  if (mode === "day") days = [new Date(anchor)];
  if (mode === "month") {
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    first.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    days = Array.from({ length: 42 }, (_, index) => new Date(first.getFullYear(), first.getMonth(), first.getDate() + index));
  }
  if (mode === "upcoming") days = [];
  elements.calendarHeading.textContent = mode === "month" ? new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(anchor) : mode === "day" ? formatter.format(anchor) : mode === "upcoming" ? "Upcoming events" : `${formatter.format(days[0])} - ${formatter.format(days[6])}`;
  elements.calendarGrid.innerHTML = "";
  elements.calendarGrid.classList.toggle("calendar-month", mode === "month");
  elements.calendarGrid.classList.toggle("calendar-list", mode === "upcoming");
  const today = new Date().toDateString();
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: "short" });
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

  if (mode === "upcoming") {
    for (const event of state.calendarEvents.filter((item) => new Date(item.end) >= new Date())) {
      const node = document.createElement("article");
      node.className = "calendar-event";
      node.textContent = `${new Date(event.start).toLocaleString()} - ${event.title}${event.location ? ` (${event.location})` : ""}`;
      elements.calendarGrid.append(node);
    }
  }
  for (const day of days) {
    const column = document.createElement("section");
    column.className = `calendar-day${day.toDateString() === today ? " today" : ""}`;
    const header = document.createElement("header");
    header.innerHTML = `<span>${weekday.format(day)}</span><strong>${day.getDate()}</strong>`;
    column.append(header);
    const events = state.calendarEvents.filter((event) => new Date(event.start).toDateString() === day.toDateString());
    for (const event of events) {
      const node = document.createElement("article");
      node.className = "calendar-event";
      node.innerHTML = `<strong></strong><span></span><small></small>`;
      node.querySelector("strong").textContent = event.title;
      node.querySelector("span").textContent = `${time.format(new Date(event.start))} - ${time.format(new Date(event.end))}`;
      node.querySelector("small").textContent = event.location || "";
      column.append(node);
    }
    if (!events.length) {
      const empty = document.createElement("p");
      empty.className = "calendar-empty";
      empty.textContent = "Open";
      column.append(empty);
    }
    elements.calendarGrid.append(column);
  }

  elements.calendarUpcoming.innerHTML = "";
  const upcoming = state.calendarEvents.filter((event) => new Date(event.end) >= new Date()).slice(0, 6);
  if (!upcoming.length) {
    elements.calendarUpcoming.innerHTML = '<p class="calendar-empty">No upcoming events. Import an .ics calendar or add one here.</p>';
    return;
  }
  for (const event of upcoming) {
    const node = document.createElement("article");
    node.className = "upcoming-event";
    node.innerHTML = `<strong></strong><span></span><small></small>`;
    node.querySelector("strong").textContent = event.title;
    node.querySelector("span").textContent = `${weekday.format(new Date(event.start))}, ${time.format(new Date(event.start))}`;
    node.querySelector("small").textContent = event.location || "";
    elements.calendarUpcoming.append(node);
  }
}

async function refreshCalendar() {
  const data = await api("/api/calendar/events");
  state.calendarEvents = data.events || [];
  renderCalendar();
}

async function syncGoogleCalendarStatus() {
  const data = await api("/api/google-calendar/status");
  elements.googleCalendarButton.hidden = data.connected;
  elements.syncGoogleCalendarButton.hidden = !data.connected;
}

async function connectGoogleCalendar(clientSecret) {
  const clientId = "408498375815-r0lb0h7voml1ei43gt3nk47p5j1l5dt2.apps.googleusercontent.com";
  const data = await api("/api/google-calendar/connect", { method: "POST", body: { clientId, clientSecret } });
  if (window.granolieDesktop?.openExternal) await window.granolieDesktop.openExternal(data.url);
  else window.open(data.url, "_blank", "noopener");
  setStatus("Complete Google Calendar access in your browser, then return here and sync.");
}

function renderChat() {
  elements.chatThread.innerHTML = "";
  elements.chatView.classList.toggle("empty-chat", !state.chatMessages.length);

  if (!state.chatMessages.length) {
    elements.chatThread.append(elements.chatEmptyState);
    elements.chatEmptyState.hidden = false;
    return;
  }

  for (const message of state.chatMessages) {
    const node = document.createElement("article");
    node.className = `chat-message ${message.role}${message.pending ? " pending" : ""}`;
    const content = document.createElement("div");
    content.className = "chat-message-content";
    if (message.pending) {
      content.classList.add("chat-thinking");
      const label = document.createElement("span");
      label.textContent = "Granolie is working";
      const rail = document.createElement("span");
      rail.className = "chat-thinking-rail";
      rail.append(document.createElement("span"));
      content.append(label, rail);
    } else {
      content.textContent = message.content;
    }
    node.append(content);

    if (message.sources?.length) {
      const sources = document.createElement("div");
      sources.className = "chat-sources";
      for (const source of message.sources) {
        const button = document.createElement("button");
        button.className = "source-chip";
        button.type = "button";
        button.textContent = source.title || "Untitled session";
        button.title = `Open ${source.title || "session"}`;
        button.addEventListener("click", () => {
          loadSession(source.id)
            .then(() => setActiveView("session"))
            .catch((error) => setStatus(error.message));
        });
        sources.append(button);
      }
      node.append(sources);
    }

    elements.chatThread.append(node);
  }

  window.requestAnimationFrame(() => {
    elements.chatThread.scrollTop = elements.chatThread.scrollHeight;
  });
}

async function askSavedSessions() {
  const question = elements.sessionQuestionInput.value.trim();
  if (!question) {
    setStatus("Enter a question about your saved notes.");
    return;
  }

  if (elements.notesProviderSelect.value !== "ollama") {
    setStatus("Ask saved notes uses Ollama local. Select Ollama local under AI settings first.");
    return;
  }

  const scope = elements.questionScopeSelect.value;
  if (scope === "current" && !state.activeSessionId) {
    setStatus("Open a session before asking about the current note.");
    return;
  }

  setStatus("Asking local AI about saved notes...");
  elements.askSessionsButton.disabled = true;
  const finishProcessing = startProcessing("Searching your saved sessions");
  state.chatMessages.push({ role: "user", content: question });
  state.chatMessages.push({ role: "assistant", content: "Thinking...", pending: true });
  elements.sessionQuestionInput.value = "";
  renderChat();

  try {
    saveSettings();
    const data = await api("/api/ask-sessions", {
      method: "POST",
      body: {
        baseUrl: state.settings.notesBaseUrl,
        model: state.settings.notesModel,
        question,
        scope,
        sessionId: scope === "current" ? state.activeSessionId : "",
      },
    });
    state.chatMessages[state.chatMessages.length - 1] = {
      role: "assistant",
      content: data.answer || "No answer was returned.",
      sources: data.sources || [],
    };
    renderChat();
    setStatus("Local AI answer ready.");
  } catch (error) {
    state.chatMessages[state.chatMessages.length - 1] = {
      role: "assistant",
      content: `Could not answer: ${error.message}`,
    };
    renderChat();
    setStatus(error.message);
  } finally {
    finishProcessing();
    elements.askSessionsButton.disabled = false;
  }
}

async function loadSession(id) {
  if (!id) {
    return;
  }

  if (id === state.activeSessionId) {
    renderSessionList();
    return;
  }

  const data = await api(`/api/sessions/${id}`);
  applySession(data.session);
  setStatus(`Loaded ${data.session.title || "session"}.`);
}

async function createSession() {
  const data = await api("/api/sessions", { method: "POST" });
  state.sessions.unshift({
    id: data.session.id,
    title: data.session.title,
    template: data.session.template,
    summary: data.session.summary,
    updatedAt: data.session.updatedAt,
    createdAt: data.session.createdAt,
  });
  applySession(data.session);
  renderSessionList();
  setStatus("New session created.");
  return data.session;
}

async function saveActiveSession() {
  if (!state.activeSessionId || state.isApplyingSession || state.isSaving) {
    return;
  }

  state.isSaving = true;
  setStatus("Saving...");

  try {
    const data = await api(`/api/sessions/${state.activeSessionId}`, {
      method: "PUT",
      body: sessionPayloadFromForm(),
    });

    const index = state.sessions.findIndex((item) => item.id === data.session.id);
    const summary = {
      id: data.session.id,
      title: data.session.title,
      template: data.session.template,
      summary: data.session.summary,
      updatedAt: data.session.updatedAt,
      createdAt: data.session.createdAt,
    };

    if (index >= 0) {
      state.sessions[index] = summary;
    } else {
      state.sessions.unshift(summary);
    }

    state.sessions.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    renderSessionList();
    setStatus(`Saved ${data.session.title}.`);
  } catch (error) {
    setStatus(error.message);
  } finally {
    state.isSaving = false;
  }
}

async function saveTitleAndFocusSidebar(event) {
  if (event.key !== "Enter" || !elements.titleInput.value.trim()) {
    return;
  }

  event.preventDefault();
  if (state.saveTimerId) {
    window.clearTimeout(state.saveTimerId);
    state.saveTimerId = null;
  }

  await saveActiveSession();
  const activeEntry = [...elements.sessionList.querySelectorAll(".session-item")].find(
    (entry) => entry.dataset.sessionId === state.activeSessionId
  );
  activeEntry?.focus();
}

function scheduleSave() {
  if (state.isApplyingSession) {
    return;
  }

  updateWordCounts();
  if (state.saveTimerId) {
    window.clearTimeout(state.saveTimerId);
  }

  state.saveTimerId = window.setTimeout(() => {
    state.saveTimerId = null;
    saveActiveSession();
  }, 700);
}

function clearInitialSessionName() {
  if (!state.isUntitledSessionName) {
    return;
  }

  state.isUntitledSessionName = false;
  elements.titleInput.value = "";
}

function closePaneMenu(control) {
  control.closest(".pane-menu")?.removeAttribute("open");
}

function updateRecordingState() {
  const elapsedMs = state.recordingStartedAt ? Date.now() - state.recordingStartedAt : 0;
  const seconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainder = String(seconds % 60).padStart(2, "0");

  elements.recordButton.classList.toggle("recording", state.isRecording);
  elements.recordButton.textContent = state.isRecording ? "Recording..." : "Start recording";
  elements.stopButton.disabled = !state.isRecording;
  elements.deleteAudioButton.disabled = state.isRecording || (!state.audioBlob && !state.savedAudio);
  elements.saveAudioButton.disabled = state.isRecording || !state.audioBlob || !state.activeSessionId;
  elements.loadSavedAudioButton.disabled = state.isRecording || !state.savedAudio || Boolean(state.audioBlob);
  elements.transcribeButton.disabled = state.isRecording;
  elements.microphoneSourceInput.disabled = state.isRecording;
  elements.systemAudioSourceInput.disabled = state.isRecording;

  if (state.isRecording) {
    elements.recordingMeta.textContent = `Recording ${minutes}:${remainder}`;
    return;
  }

  if (state.audioBlob) {
    const kb = Math.round(state.audioBlob.size / 1024);
    elements.recordingMeta.textContent = `${state.audioFileName || "Audio loaded"} (${kb} KB)`;
    return;
  }

  if (state.savedAudio) {
    const kb = Math.round(state.savedAudio.size / 1024);
    elements.recordingMeta.textContent = `Saved audio: ${state.savedAudio.fileName || "recording"} (${kb} KB)`;
    return;
  }

  elements.recordingMeta.textContent = "No audio loaded.";
}

function stopRecordingTimer() {
  if (state.recordingTimerId) {
    window.clearInterval(state.recordingTimerId);
    state.recordingTimerId = null;
  }
}

function updateAudioLevelMeter() {
  if (!state.audioLevelAnalyser || !state.audioLevelData || !state.isRecording) {
    return;
  }

  state.audioLevelAnalyser.getByteTimeDomainData(state.audioLevelData);
  let sum = 0;
  for (const sample of state.audioLevelData) {
    const centered = (sample - 128) / 128;
    sum += centered * centered;
  }

  const rms = Math.sqrt(sum / state.audioLevelData.length);
  const level = Math.min(1, Math.max(0, (20 * Math.log10(Math.max(rms, 0.00001)) + 60) / 60));
  const percent = Math.round(level * 100);
  elements.vuMeterLevel.style.transform = `scaleX(${Math.max(0.015, level)})`;
  elements.vuMeter.setAttribute("aria-valuenow", String(percent));
  state.audioLevelFrameId = window.requestAnimationFrame(updateAudioLevelMeter);
}

function createMixedAudioStream(streams) {
  stopAudioLevelMeter();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("This browser does not support audio mixing.");
  }

  const context = new AudioContextClass();
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.72;
  const destination = context.createMediaStreamDestination();
  const sources = streams.map((stream) => context.createMediaStreamSource(stream));
  sources.forEach((source) => {
    source.connect(analyser);
    source.connect(destination);
  });

  state.audioContext = context;
  state.audioDestination = destination;
  state.audioLevelAnalyser = analyser;
  state.audioLevelData = new Uint8Array(analyser.fftSize);
  state.audioLevelSources = sources;
  elements.recordingMonitor.hidden = false;
  elements.vuMeterStatus.textContent = "Recording";
  context.resume().catch(() => {});
  state.audioLevelFrameId = window.requestAnimationFrame(updateAudioLevelMeter);
  return destination.stream;
}

function stopAudioLevelMeter() {
  if (state.audioLevelFrameId) {
    window.cancelAnimationFrame(state.audioLevelFrameId);
    state.audioLevelFrameId = null;
  }
  state.audioLevelSources.forEach((source) => source.disconnect());
  state.audioLevelAnalyser?.disconnect();
  state.audioDestination?.disconnect();
  state.audioContext?.close().catch(() => {});
  state.audioContext = null;
  state.audioDestination = null;
  state.audioLevelData = null;
  state.audioLevelSources = [];
  state.audioLevelAnalyser = null;
  elements.recordingMonitor.hidden = true;
  elements.vuMeterLevel.style.transform = "scaleX(0)";
  elements.vuMeter.setAttribute("aria-valuenow", "0");
}

function finishRecording(errorMessage = "") {
  state.mediaStream?.getTracks().forEach((track) => track.stop());
  state.captureStreams.forEach((stream) => stream.getTracks().forEach((track) => track.stop()));
  state.mediaRecorder = null;
  state.mediaStream = null;
  state.captureStreams = [];
  state.isRecording = false;
  state.recordingStartedAt = 0;
  stopRecordingTimer();
  stopAudioLevelMeter();
  updateRecordingState();
  setStatus(errorMessage || "Recording ready for transcription.");
}

async function startRecording() {
  if (state.isRecording) {
    return;
  }

  const includeMicrophone = elements.microphoneSourceInput.checked;
  const includeSystemAudio = elements.systemAudioSourceInput.checked;
  if (!includeMicrophone && !includeSystemAudio) {
    setStatus("Select a microphone, computer audio, or both before recording.");
    return;
  }

  if ((includeMicrophone && !navigator.mediaDevices?.getUserMedia) || (includeSystemAudio && !navigator.mediaDevices?.getDisplayMedia)) {
    setStatus("This browser does not expose the required audio capture APIs.");
    return;
  }

  try {
    state.captureStreams = [];
    if (includeMicrophone) {
      state.captureStreams.push(await navigator.mediaDevices.getUserMedia({ audio: true }));
    }
    if (includeSystemAudio) {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
      if (!displayStream.getAudioTracks().length) {
        displayStream.getTracks().forEach((track) => track.stop());
        throw new Error("Computer audio was not available. Check PipeWire screen-share audio support and try again.");
      }
      state.captureStreams.push(displayStream);
    }

    state.mediaStream = createMixedAudioStream(state.captureStreams);
    state.recordingChunks = [];
    state.mediaRecorder = new MediaRecorder(state.mediaStream);
    state.mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        state.recordingChunks.push(event.data);
      }
    });
    state.mediaRecorder.addEventListener("stop", () => {
      state.audioBlob = new Blob(state.recordingChunks, {
        type: state.mediaRecorder?.mimeType || "audio/webm",
      });
      state.audioMimeType = state.audioBlob.type || "audio/webm";
      state.audioFileName = `recording-${Date.now()}.webm`;
      finishRecording();
    });
    state.mediaRecorder.addEventListener("error", (event) => {
      finishRecording(event.error?.message || "Recording stopped because the microphone recorder failed.");
    });

    state.mediaRecorder.start(1000);
    state.isRecording = true;
    state.recordingStartedAt = Date.now();
    state.recordingTimerId = window.setInterval(updateRecordingState, 1000);
    updateRecordingState();
    setStatus("Recording started.");
  } catch (error) {
    state.captureStreams.forEach((stream) => stream.getTracks().forEach((track) => track.stop()));
    state.captureStreams = [];
    state.mediaStream = null;
    stopAudioLevelMeter();
    setStatus(error.message || "Could not start microphone capture.");
  }
}

async function saveAudioWithSession() {
  if (!state.audioBlob || !state.activeSessionId) {
    return;
  }

  setStatus("Saving audio with this session...");
  elements.saveAudioButton.disabled = true;
  try {
    const data = await api(`/api/sessions/${state.activeSessionId}/audio`, {
      method: "POST",
      body: {
        audioBase64: await fileToBase64(state.audioBlob),
        fileName: state.audioFileName || "recording.webm",
        mimeType: state.audioMimeType || "audio/webm",
      },
    });
    state.savedAudio = data.session.audio || null;
    updateRecordingState();
    setStatus("Audio saved with this session.");
  } catch (error) {
    setStatus(error.message);
  } finally {
    updateRecordingState();
  }
}

async function loadSavedAudio() {
  if (!state.savedAudio || !state.activeSessionId || state.audioBlob) {
    return;
  }

  try {
    const response = await fetch(`/api/sessions/${state.activeSessionId}/audio`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Could not load saved audio.");
    }
    state.audioBlob = await response.blob();
    state.audioFileName = state.savedAudio.fileName || "saved-recording.webm";
    state.audioMimeType = state.savedAudio.mimeType || state.audioBlob.type || "audio/webm";
    updateRecordingState();
    setStatus("Saved audio loaded.");
  } catch (error) {
    setStatus(error.message);
  }
}

async function deleteAudio() {
  if (state.isRecording || (!state.audioBlob && !state.savedAudio)) {
    return;
  }

  clearAudioState();
  if (state.savedAudio && state.activeSessionId) {
    try {
      const data = await api(`/api/sessions/${state.activeSessionId}/audio`, { method: "DELETE" });
      state.savedAudio = data.session.audio || null;
    } catch (error) {
      setStatus(error.message);
      updateRecordingState();
      return;
    }
  }
  updateRecordingState();
  setStatus("Audio removed.");
}

function stopRecording() {
  if (!state.isRecording || !state.mediaRecorder) {
    return;
  }

  state.mediaRecorder.stop();
  setStatus("Finishing recording...");
}

function fileToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the audio file."));
    reader.onload = () => {
      const result = String(reader.result || "");
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.readAsDataURL(blob);
  });
}

async function transcribeAudio() {
  if (!state.audioBlob) {
    setStatus("Load or record audio first.");
    return;
  }

  const provider = elements.transcribeProviderSelect.value;

  if (provider !== "faster_whisper" && !elements.apiKeyInput.value.trim()) {
    setStatus("An API key is required for transcription.");
    return;
  }

  setStatus("Transcribing audio...");
  elements.transcribeButton.disabled = true;
  const finishProcessing = startProcessing("Transcribing audio locally");

  try {
    saveSettings();
    const audioBase64 = await fileToBase64(state.audioBlob);
    const data = await api("/api/transcribe", {
      method: "POST",
      body: {
        apiKey: state.settings.apiKey,
        audioBase64,
        baseUrl: state.settings.transcribeBaseUrl,
        fileName: state.audioFileName || "recording.webm",
        mimeType: state.audioMimeType || "audio/webm",
        model: state.settings.transcribeModel,
        provider: state.settings.transcribeProvider,
        prompt: elements.contextInput.value.trim(),
      },
    });

    elements.transcriptInput.value = data.text || "";
    if (!elements.titleInput.value.trim()) {
      elements.titleInput.value = deriveTitle(data.text || "");
    }
    updateWordCounts();
    scheduleSave();
    setStatus("Transcription complete.");
  } catch (error) {
    setStatus(error.message);
  } finally {
    finishProcessing();
    updateRecordingState();
  }
}

async function generateNotes() {
  if (!elements.transcriptInput.value.trim()) {
    setStatus("You need a transcript before generating notes.");
    return;
  }

  const provider = elements.notesProviderSelect.value;

  if (provider !== "ollama" && !elements.apiKeyInput.value.trim()) {
    setStatus("An API key is required for OpenAI-compatible note generation.");
    return;
  }

  setStatus("Generating notes...");
  elements.generateNotesButton.disabled = true;
  const finishProcessing = startProcessing("Turning transcript into notes");

  try {
    saveSettings();
    const data = await api("/api/generate-notes", {
      method: "POST",
      body: {
        provider: state.settings.notesProvider,
        apiKey: state.settings.apiKey,
        baseUrl: state.settings.notesBaseUrl,
        model: state.settings.notesModel,
        transcript: elements.transcriptInput.value,
        template: elements.templateSelect.value,
        context: elements.contextInput.value,
        customPrompt: elements.customPromptInput.value,
      },
    });

    elements.notesInput.value = data.notes || "";
    if (!elements.titleInput.value.trim()) {
      elements.titleInput.value = deriveTitle(elements.transcriptInput.value);
    }
    updateWordCounts();
    scheduleSave();
    setStatus("Notes generated.");
  } catch (error) {
    setStatus(error.message);
  } finally {
    finishProcessing();
    elements.generateNotesButton.disabled = false;
  }
}

async function deleteActiveSession() {
  if (!state.activeSessionId) {
    return;
  }

  const confirmed = window.confirm("Delete this session? This removes the saved transcript and notes.");
  if (!confirmed) {
    return;
  }

  await api(`/api/sessions/${state.activeSessionId}`, { method: "DELETE" });
  state.sessions = state.sessions.filter((item) => item.id !== state.activeSessionId);
  state.activeSessionId = null;

  if (state.sessions.length) {
    await loadSession(state.sessions[0].id);
  } else {
    await createSession();
  }

  renderSessionList();
  setStatus("Session deleted.");
}

async function clearAiNotes() {
  if (!elements.notesInput.value.trim()) {
    setStatus("There are no AI notes to clear.");
    return;
  }

  const confirmed = window.confirm("Clear the AI notes? The transcript will be kept.");
  if (!confirmed) {
    return;
  }

  elements.notesInput.value = "";
  updateWordCounts();
  if (state.saveTimerId) {
    window.clearTimeout(state.saveTimerId);
    state.saveTimerId = null;
  }

  await saveActiveSession();
  setStatus("AI notes cleared. Transcript retained.");
}

function exportMarkdown() {
  const title = elements.titleInput.value.trim() || "Untitled session";
  const content = [
    `# ${title}`,
    "",
    `Updated: ${new Date().toLocaleString()}`,
    "",
    "## AI Notes",
    "",
    elements.notesInput.value.trim() || "_No notes yet._",
    "",
    "## Transcript",
    "",
    elements.transcriptInput.value.trim() || "_No transcript yet._",
  ].join("\n");

  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const link = document.createElement("a");
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "session";
  link.href = URL.createObjectURL(blob);
  link.download = `${slug}.md`;
  link.click();
  URL.revokeObjectURL(link.href);
  setStatus("Markdown export downloaded.");
}

function titleFromFileName(fileName) {
  const stem = String(fileName || "Imported transcript")
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (stem || "Imported transcript").slice(0, 120);
}

async function importTranscriptFile(file) {
  if (!file) {
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    setStatus("Transcript files must be 10 MB or smaller.");
    return;
  }

  let transcript;
  try {
    transcript = await file.text();
  } catch {
    setStatus("Could not read that text file.");
    return;
  }

  if (!transcript.trim()) {
    setStatus("The selected text file is empty.");
    return;
  }

  try {
    await createSession();
    elements.titleInput.value = titleFromFileName(file.name);
    elements.transcriptInput.value = transcript;
    elements.notesInput.value = "";
    updateWordCounts();
    await saveActiveSession();
    setStatus(`Imported ${file.name} into a new note.`);
  } catch (error) {
    setStatus(error.message || "Could not import the transcript file.");
  }
}

function getExportTarget(kind) {
  return kind === "transcript"
    ? {
        content: elements.transcriptInput.value,
        emptyText: "No transcript yet.",
        label: "Transcript",
        formatInput: elements.transcriptExportFormat,
        suffix: "transcript",
      }
    : {
        content: elements.notesInput.value,
        emptyText: "No notes yet.",
        label: "AI notes",
        formatInput: elements.notesExportFormat,
        suffix: "ai-notes",
      };
}

function getExportTitle(target) {
  const sessionTitle = elements.titleInput.value.trim() || "Granolie";
  return `${sessionTitle} ${target.label}`;
}

function getExportSlug(target) {
  const sessionTitle = (elements.titleInput.value.trim() || "granolie").toLowerCase();
  const slug = sessionTitle.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "granolie";
  return `${slug}-${target.suffix}`;
}

function escapeHtml(value) {
  return value.replace(/[&<>\"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
  })[character]);
}

function buildExportMarkdown(target) {
  return `# ${getExportTitle(target)}\n\n${target.content.trim() || `_${target.emptyText}_`}\n`;
}

function buildExportHtml(target) {
  const title = escapeHtml(getExportTitle(target));
  const content = escapeHtml(target.content.trim() || target.emptyText);
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>${title}</title></head><body><h1>${title}</h1><pre>${content}</pre></body></html>\n`;
}

function downloadFile(content, mimeType, fileName) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 0);
}

function exportContent(kind) {
  const target = getExportTarget(kind);
  const format = target.formatInput.value;
  const formats = {
    markdown: {
      content: buildExportMarkdown(target),
      fileName: `${getExportSlug(target)}.md`,
      mimeType: "text/markdown;charset=utf-8",
      label: "Markdown",
    },
    text: {
      content: target.content,
      fileName: `${getExportSlug(target)}.txt`,
      mimeType: "text/plain;charset=utf-8",
      label: "Plain text",
    },
    html: {
      content: buildExportHtml(target),
      fileName: `${getExportSlug(target)}.html`,
      mimeType: "text/html;charset=utf-8",
      label: "HTML",
    },
  };
  const selection = formats[format] || formats.markdown;
  downloadFile(selection.content, selection.mimeType, selection.fileName);
  setStatus(`${selection.label} ${target.label.toLowerCase()} export downloaded.`);
}

async function copyContent(kind) {
  const target = getExportTarget(kind);
  if (!target.content.trim()) {
    setStatus(`There is no ${target.label.toLowerCase()} to copy.`);
    return;
  }

  const input = kind === "transcript" ? elements.transcriptInput : elements.notesInput;
  const previousStart = input.selectionStart;
  const previousEnd = input.selectionEnd;
  input.focus();
  input.select();

  // Match the native Ctrl+C path used when copying a selection manually.
  const copied = document.execCommand("copy");
  input.setSelectionRange(previousStart, previousEnd);
  if (copied) {
    setStatus(`${target.label} copied to the clipboard.`);
    return true;
  }

  try {
    await navigator.clipboard.writeText(target.content);
  } catch {
    setStatus(`Could not copy ${target.label.toLowerCase()} to the clipboard.`);
    return false;
  }

  setStatus(`${target.label} copied to the clipboard.`);
  return true;
}

async function openContentInWriter(kind) {
  const target = getExportTarget(kind);
  if (!target.content.trim()) {
    setStatus(`There is no ${target.label.toLowerCase()} to open.`);
    return;
  }

  const copied = await copyContent(kind);
  if (!copied) {
    return;
  }

  if (!window.granolieDesktop?.openWriterWithClipboard) {
    setStatus("This action requires the Granolie desktop app.");
    return;
  }

  try {
    await window.granolieDesktop.openWriterWithClipboard();
    setStatus(`${target.label} pasted into a new LibreOffice Writer document.`);
  } catch (error) {
    setStatus(error.message || "LibreOffice Writer could not be opened and pasted into.");
  }
}

function bindEvents() {
  document.addEventListener("contextmenu", (event) => {
    const target = event.target;
    const isEditableTextField =
      target instanceof HTMLTextAreaElement ||
      (target instanceof HTMLInputElement && ["password", "search", "text", "url"].includes(target.type));

    if (!isEditableTextField || !window.granolieDesktop?.showEditMenu) {
      return;
    }

    event.preventDefault();
    target.focus();
    window.granolieDesktop.showEditMenu();
  });

  elements.newSessionButton.addEventListener("click", () => {
    createSession()
      .then(() => setActiveView("session"))
      .catch((error) => setStatus(error.message));
  });
  elements.deleteSessionButton.addEventListener("click", () => {
    deleteActiveSession().catch((error) => setStatus(error.message));
  });
  elements.exportButton.addEventListener("click", exportMarkdown);
  elements.chatComposer.addEventListener("submit", (event) => {
    event.preventDefault();
    askSavedSessions();
  });
  elements.sessionQuestionInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) {
      return;
    }

    event.preventDefault();
    elements.chatComposer.requestSubmit();
  });
  elements.chatTabButton.addEventListener("click", () => setActiveView("chat"));
  elements.calendarTabButton.addEventListener("click", () => {
    Promise.all([refreshCalendar(), syncGoogleCalendarStatus()]).catch((error) => setStatus(error.message));
    setActiveView("calendar");
  });
  const moveCalendar = (direction) => {
    const mode = elements.calendarViewMode.value;
    if (mode === "month") state.calendarAnchor.setMonth(state.calendarAnchor.getMonth() + direction);
    else if (mode === "week") state.calendarAnchor.setDate(state.calendarAnchor.getDate() + direction * 7);
    else if (mode === "day") state.calendarAnchor.setDate(state.calendarAnchor.getDate() + direction);
    renderCalendar();
  };
  elements.calendarViewMode.addEventListener("change", renderCalendar);
  elements.calendarPreviousButton.addEventListener("click", () => moveCalendar(-1));
  elements.calendarNextButton.addEventListener("click", () => moveCalendar(1));
  elements.googleCalendarButton.addEventListener("click", () => {
    elements.googleCalendarSecret.value = "";
    elements.googleCalendarDialog.showModal();
    elements.googleCalendarSecret.focus();
  });
  elements.closeGoogleCalendarDialogButton.addEventListener("click", () => elements.googleCalendarDialog.close());
  elements.googleCalendarForm.addEventListener("submit", (event) => {
    event.preventDefault();
    connectGoogleCalendar(elements.googleCalendarSecret.value.trim())
      .then(() => elements.googleCalendarDialog.close())
      .catch((error) => setStatus(error.message));
  });
  elements.syncGoogleCalendarButton.addEventListener("click", () => {
    setStatus("Syncing Google Calendar...");
    api("/api/google-calendar/sync", { method: "POST" })
      .then((data) => refreshCalendar().then(() => data))
      .then((data) => setStatus(`Synced ${data.count} Google Calendar event${data.count === 1 ? "" : "s"}.`))
      .catch((error) => setStatus(error.message));
  });
  elements.sessionTabButton.addEventListener("click", () => setActiveView("session"));
  elements.sidebarToggle.addEventListener("click", () => {
    setSidebarCollapsed(!state.sidebarCollapsed);
  });
  elements.titleInput.addEventListener("keydown", (event) => {
    saveTitleAndFocusSidebar(event).catch((error) => setStatus(error.message));
  });
  elements.titleInput.addEventListener("focus", clearInitialSessionName);
  elements.importTranscriptButton.addEventListener("click", () => {
    elements.transcriptFileInput.click();
  });
  elements.copyNotesButton.addEventListener("click", () => {
    copyContent("notes").catch((error) => setStatus(error.message));
  });
  elements.clearNotesButton.addEventListener("click", () => {
    clearAiNotes().catch((error) => setStatus(error.message));
  });
  elements.exportNotesButton.addEventListener("click", () => exportContent("notes"));
  elements.openWriterButton.addEventListener("click", () => openContentInWriter("notes"));
  elements.copyTranscriptButton.addEventListener("click", () => {
    copyContent("transcript").catch((error) => setStatus(error.message));
  });
  elements.exportTranscriptButton.addEventListener("click", () => exportContent("transcript"));
  elements.openTranscriptWriterButton.addEventListener("click", () => openContentInWriter("transcript"));
  document.querySelectorAll(".pane-menu-content button").forEach((button) => {
    button.addEventListener("click", () => closePaneMenu(button));
  });
  elements.phi4MiniPresetButton.addEventListener("click", applyPhi4MiniPreset);
  elements.fasterWhisperPresetButton.addEventListener("click", applyFasterWhisperPreset);
  elements.recordButton.addEventListener("click", startRecording);
  elements.stopButton.addEventListener("click", stopRecording);
  elements.saveAudioButton.addEventListener("click", saveAudioWithSession);
  elements.loadSavedAudioButton.addEventListener("click", loadSavedAudio);
  elements.deleteAudioButton.addEventListener("click", () => {
    deleteAudio().catch((error) => setStatus(error.message));
  });
  elements.addCalendarEventButton.addEventListener("click", () => {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    elements.calendarEventForm.reset();
    elements.calendarEventStart.value = toLocalDateTimeInput(start);
    elements.calendarEventEnd.value = toLocalDateTimeInput(end);
    elements.calendarEventDialog.showModal();
    elements.calendarEventTitle.focus();
  });
  elements.closeCalendarDialogButton.addEventListener("click", () => elements.calendarEventDialog.close());
  elements.calendarEventForm.addEventListener("submit", (event) => {
    event.preventDefault();
    api("/api/calendar/events", {
      method: "POST",
      body: {
        title: elements.calendarEventTitle.value,
        start: elements.calendarEventStart.value,
        end: elements.calendarEventEnd.value,
        location: elements.calendarEventLocation.value,
      },
    })
      .then(() => refreshCalendar())
      .then(() => {
        elements.calendarEventDialog.close();
        setStatus("Calendar event saved.");
      })
      .catch((error) => setStatus(error.message));
  });
  elements.calendarFileInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const data = await api("/api/calendar/import", { method: "POST", body: { content: await file.text() } });
      state.calendarEvents = data.events || [];
      renderCalendar();
      setStatus(`Imported ${data.added} calendar event${data.added === 1 ? "" : "s"}.`);
    } catch (error) {
      setStatus(error.message);
    }
  });
  [elements.microphoneSourceInput, elements.systemAudioSourceInput].forEach((element) => {
    element.addEventListener("change", () => {
      saveSettings();
    });
  });
  elements.transcribeButton.addEventListener("click", transcribeAudio);
  elements.generateNotesButton.addEventListener("click", generateNotes);
  elements.notesProviderSelect.addEventListener("change", () => {
    applyNotesProviderDefaults(elements.notesProviderSelect.value);
    syncNotesProviderUi();
    saveSettings();

    if (elements.notesProviderSelect.value === "ollama") {
      refreshOllamaModels({ quiet: false }).catch((error) => setStatus(error.message));
    }
  });
  elements.transcribeProviderSelect.addEventListener("change", () => {
    applyTranscriptionProviderDefaults(elements.transcribeProviderSelect.value);
    syncTranscriptionProviderUi();
    saveSettings();
  });
  elements.sessionSearch.addEventListener("input", (event) => {
    state.searchQuery = event.target.value;
    renderSessionList();
  });

  elements.audioFileInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      clearAudioState();
      updateRecordingState();
      return;
    }

    state.audioBlob = file;
    state.audioFileName = file.name;
    state.audioMimeType = file.type || "audio/webm";
    updateRecordingState();
    setStatus(`Loaded ${file.name}.`);
  });

  elements.transcriptFileInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    importTranscriptFile(file);
  });

  [
    elements.titleInput,
    elements.transcriptInput,
    elements.notesInput,
    elements.contextInput,
    elements.templateSelect,
  ].forEach((element) => {
    element.addEventListener("input", scheduleSave);
    element.addEventListener("change", scheduleSave);
  });

  [
    elements.apiKeyInput,
    elements.notesBaseUrlInput,
    elements.notesModelInput,
    elements.notesProviderSelect,
    elements.microphoneSourceInput,
    elements.systemAudioSourceInput,
    elements.transcribeBaseUrlInput,
    elements.transcribeModelInput,
    elements.transcribeProviderSelect,
    elements.customPromptInput,
  ].forEach((element) => {
    element.addEventListener("input", saveSettings);
    element.addEventListener("change", saveSettings);
  });
}

async function init() {
  try {
    await loadAppInfo();
    setSidebarCollapsed(state.sidebarCollapsed);
    applySettings();
    bindEvents();
    renderChat();
    await refreshCalendar();
    await syncGoogleCalendarStatus();
    updateWordCounts();
    updateRecordingState();
    renderOllamaModelSuggestions();

    if (elements.notesProviderSelect.value === "ollama") {
      await refreshOllamaModels({ quiet: true });
    }

    const data = await api("/api/sessions");
    state.sessions = data.sessions;
    renderSessionList();

    if (!state.sessions.length) {
      await createSession();
      return;
    }

    await loadSession(state.sessions[0].id);
  } catch (error) {
    setStatus(error.message);
  }
}

init();

const SETTINGS_STORAGE_KEY = "cfdt-nexus-cockpit-settings-v1";
const LIBRARY_STORAGE_KEY = "cfdt-nexus-bibliotheque-v1-1";
const DEFAULT_LIBRARY_PATH = "../private/cfdt-nexus-bibliotheque/";
const DEMO_DOCUMENT_COUNT = 10;

const settingsEls = {};

document.addEventListener("DOMContentLoaded", initSettings);

function initSettings() {
  cacheSettingsElements();
  renderSettings();
  settingsEls.reindexButton.addEventListener("click", reindexLibrary);
}

function cacheSettingsElements() {
  settingsEls.libraryPath = document.querySelector("#libraryPath");
  settingsEls.connectionStatus = document.querySelector("#connectionStatus");
  settingsEls.detectedDocuments = document.querySelector("#detectedDocuments");
  settingsEls.lastIndexedAt = document.querySelector("#lastIndexedAt");
  settingsEls.indexSource = document.querySelector("#indexSource");
  settingsEls.indexLog = document.querySelector("#indexLog");
  settingsEls.reindexButton = document.querySelector("#reindexButton");
  settingsEls.toast = document.querySelector("#toast");
}

function renderSettings() {
  const state = loadSettingsState();
  const index = readLibraryIndex();

  settingsEls.libraryPath.textContent = state.libraryPath || DEFAULT_LIBRARY_PATH;
  settingsEls.detectedDocuments.textContent = String(state.documentCount ?? index.count);
  settingsEls.lastIndexedAt.textContent = state.lastIndexedAt
    ? formatIndexDate(state.lastIndexedAt)
    : "Jamais indexée";
  settingsEls.indexSource.textContent = state.indexSource || index.source;
  renderStatus(state.connectionStatus || index.status);
}

function reindexLibrary() {
  const index = readLibraryIndex();

  settingsEls.reindexButton.disabled = true;
  renderStatus("indexing");
  settingsEls.indexLog.textContent = "Lecture simulée de la bibliothèque privée...";

  window.setTimeout(() => {
    const nextState = {
      libraryPath: DEFAULT_LIBRARY_PATH,
      connectionStatus: index.status,
      documentCount: index.count,
      lastIndexedAt: new Date().toISOString(),
      indexSource: index.source,
    };

    saveSettingsState(nextState);
    settingsEls.indexLog.textContent = `Indexation simulée terminée : ${index.count} document(s) détecté(s).`;
    settingsEls.reindexButton.disabled = false;
    renderSettings();
    showSettingsToast("Bibliothèque réindexée.");
  }, 650);
}

function readLibraryIndex() {
  const storedDocuments = readJson(LIBRARY_STORAGE_KEY);

  if (Array.isArray(storedDocuments)) {
    return {
      count: storedDocuments.length,
      source: "Bibliothèque locale du navigateur",
      status: "connected",
    };
  }

  return {
    count: DEMO_DOCUMENT_COUNT,
    source: "Données de démonstration",
    status: storageAvailable() ? "ready" : "demo",
  };
}

function renderStatus(status) {
  const labels = {
    connected: "Connecté",
    ready: "Prêt",
    demo: "Mode démo",
    indexing: "Indexation en cours",
  };
  const normalized = labels[status] ? status : "ready";

  settingsEls.connectionStatus.textContent = labels[normalized];
  settingsEls.connectionStatus.className = `status-pill status-pill--${normalized}`;
}

function loadSettingsState() {
  return readJson(SETTINGS_STORAGE_KEY) || {};
}

function saveSettingsState(state) {
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    settingsEls.indexLog.textContent = "Paramètres non persistés : stockage local indisponible.";
  }
}

function readJson(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function storageAvailable() {
  try {
    const testKey = "cfdt-nexus-storage-test";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

function formatIndexDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date à vérifier";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function showSettingsToast(message) {
  settingsEls.toast.textContent = message;
  settingsEls.toast.classList.add("toast--visible");
  window.clearTimeout(showSettingsToast.timer);
  showSettingsToast.timer = window.setTimeout(() => {
    settingsEls.toast.classList.remove("toast--visible");
  }, 2400);
}

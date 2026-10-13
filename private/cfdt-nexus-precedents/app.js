const PRC_STORAGE_KEY = "cfdt-nexus-precedents-v1";
const PRC_MAX_BYTES = 2 * 1024 * 1024;
const PRC_SCRIPT = "private/cfdt-nexus-precedents/service/precedents.py";
// Service local du module (loopback uniquement). Même origine si la page est servie par le service.
const PRC_SERVICE_URL = "http://127.0.0.1:8791";

// Références uniquement : aucun extrait de PV n'est conservé ni affiché.
const PRC_ALLOWED = ["rang", "pertinence", "date", "precision_date", "fichier", "page", "groupes_couverts", "passages", "lecture"];

const prc = {
  data: null,
  sort: "relevance",
  min: 0,
  year: null,
};

const $ = (selector) => document.querySelector(selector);

document.addEventListener("DOMContentLoaded", () => {
  prc.data = loadStored();
  bindEvents();
  updateCommand();
  render();
  detectService();
});

function bindEvents() {
  $("#prcGroups").addEventListener("input", updateCommand);
  $("#prcSince").addEventListener("input", updateCommand);
  $("#prcUntil").addEventListener("input", updateCommand);
  $("#prcCopyCommand").addEventListener("click", () => copyText($("#prcCommand").value, "Commande copiée."));
  $("#prcCopyTimeline").addEventListener("click", () => {
    if (!prc.data) return showToast("Aucun résultat à copier.");
    copyText(timelineMarkdown(), "Chronologie copiée.");
  });
  $("#prcClear").addEventListener("click", () => {
    prc.data = null;
    prc.year = null;
    try { localStorage.removeItem(PRC_STORAGE_KEY); } catch (error) { /* stockage indisponible */ }
    render();
    showToast("Résultats effacés.");
  });
  $("#prcFile").addEventListener("change", importFile);
  $("#prcSearch").addEventListener("click", runSearch);
  $("#prcGroups").addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && !$("#prcSearch").disabled) runSearch();
  });
  $("#prcSort").addEventListener("change", (event) => {
    prc.sort = event.target.value;
    renderList();
  });
  $("#prcMin").addEventListener("input", (event) => {
    prc.min = Number(event.target.value);
    $("#prcMinOut").textContent = String(prc.min);
    renderList();
  });
}

/* ---------- commande ---------- */
function updateCommand() {
  const groups = $("#prcGroups").value
    .split("\n")
    .map((line) => line.replace(/["`$]/g, "").trim())
    .filter(Boolean);
  const since = $("#prcSince").value.trim();
  const until = $("#prcUntil").value.trim();
  if (!groups.length) {
    $("#prcCommand").value = "";
    return;
  }
  const parts = [`python -I "${PRC_SCRIPT}" --json --out precedents.json`];
  groups.forEach((group) => parts.push(`--q "${group}"`));
  if (/^\d{4}$/.test(since)) parts.push(`--since ${since}`);
  if (/^\d{4}$/.test(until)) parts.push(`--until ${until}`);
  $("#prcCommand").value = parts.join(" ");
}

/* ---------- service local (recherche automatique) ---------- */
const PRC_SERVICE = { ready: false };

function serviceBase() {
  return location.origin === PRC_SERVICE_URL || location.origin === "http://localhost:8791" ? "" : PRC_SERVICE_URL;
}

function serviceFetch(path) {
  return fetch(serviceBase() + path, { headers: { "X-Nexus": "1" }, cache: "no-store" });
}

function setStatus(text, kind) {
  const el = $("#prcStatus");
  el.textContent = text;
  el.className = "prc-status" + (kind ? ` prc-status--${kind}` : "");
}

function detectService() {
  const manual = $("#prcManual");
  if (!/^https?:$/.test(location.protocol)) {
    setStatus("Page ouverte depuis un fichier : lancez le service puis ouvrez le lien affiché par lancer_nexus.cmd.", "off");
    manual.open = true;
    return;
  }
  serviceFetch("/api/health")
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error("http"))))
    .then((info) => {
      PRC_SERVICE.ready = true;
      $("#prcSearch").disabled = false;
      manual.open = false;
      setStatus(`Service local actif · ${info.pv_indexes} PV indexés`, "ok");
    })
    .catch(() => {
      setStatus("Service local non lancé : exécutez service/lancer_nexus.cmd, ou utilisez le mode manuel.", "off");
      manual.open = true;
    });
}

function runSearch() {
  const groups = $("#prcGroups").value.split("\n").map((line) => line.trim()).filter(Boolean);
  if (!groups.length) return showToast("Saisissez au moins un groupe de formulations.");
  const params = new URLSearchParams();
  groups.slice(0, 6).forEach((group) => params.append("q", group));
  const since = $("#prcSince").value.trim();
  const until = $("#prcUntil").value.trim();
  if (/^\d{4}$/.test(since)) params.set("since", since);
  if (/^\d{4}$/.test(until)) params.set("until", until);
  const button = $("#prcSearch");
  button.disabled = true;
  setStatus("Recherche en cours…");
  serviceFetch(`/api/precedents?${params}`)
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error("http"))))
    .then((raw) => {
      if (!Array.isArray(raw.resultats) || !raw.resultats.length) {
        prc.data = null;
        render();
        setStatus("Aucun précédent trouvé : élargissez les formulations (synonymes, anciennes appellations).", "off");
        return;
      }
      const clean = sanitize(raw);
      prc.data = clean;
      prc.year = null;
      saveStored(clean);
      render();
      setStatus(`${clean.resultats.length} PV trouvés`, "ok");
      $("#prcResults").scrollIntoView({ behavior: "smooth", block: "start" });
    })
    .catch(() => setStatus("Échec de la recherche : le service local est-il toujours lancé ?", "off"))
    .finally(() => { button.disabled = !PRC_SERVICE.ready; });
}

/* ---------- import / stockage ---------- */
function importFile(event) {
  const file = event.target.files && event.target.files[0];
  event.target.value = "";
  if (!file) return;
  if (file.size > PRC_MAX_BYTES) return showToast("Fichier trop volumineux (2 Mo max).");
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const clean = sanitize(JSON.parse(String(reader.result).replace(/^﻿/, "")));
      prc.data = clean;
      prc.year = null;
      saveStored(clean);
      render();
      showToast(`${clean.resultats.length} références importées (extraits ignorés).`);
    } catch (error) {
      showToast("Fichier non reconnu : exportez-le avec la commande ci-dessus.");
    }
  };
  reader.onerror = () => showToast("Lecture du fichier impossible.");
  reader.readAsText(file, "utf-8");
}

function sanitize(raw) {
  if (!raw || !Array.isArray(raw.resultats)) throw new Error("format");
  const resultats = raw.resultats
    .map((item) => {
      const out = {};
      PRC_ALLOWED.forEach((key) => { if (item && key in item) out[key] = item[key]; });
      out.pertinence = clamp(Number(out.pertinence) || 0, 0, 100);
      out.page = Number(out.page) || 1;
      out.passages = Number(out.passages) || 1;
      out.date = /^\d{4}-\d{2}-\d{2}$/.test(String(out.date)) ? String(out.date) : "0000-00-00";
      out.precision_date = ["jour", "mois", "année"].includes(out.precision_date) ? out.precision_date : "?";
      out.fichier = String(out.fichier || "").slice(0, 300);
      out.groupes_couverts = String(out.groupes_couverts || "").slice(0, 12);
      out.lecture = String(out.lecture || "").slice(0, 20);
      return out;
    })
    .filter((item) => item.fichier);
  if (!resultats.length) throw new Error("vide");
  return {
    requete: (Array.isArray(raw.requete) ? raw.requete : []).map((q) => String(q).slice(0, 300)).slice(0, 8),
    genere: String(raw.genere || "").slice(0, 10),
    pv_indexes: Number(raw.pv_indexes) || 0,
    resultats,
  };
}

function loadStored() {
  try {
    const raw = localStorage.getItem(PRC_STORAGE_KEY);
    return raw ? sanitize(JSON.parse(raw)) : null;
  } catch (error) {
    return null;
  }
}

function saveStored(data) {
  try { localStorage.setItem(PRC_STORAGE_KEY, JSON.stringify(data)); } catch (error) { /* stockage indisponible */ }
}

/* ---------- rendu ---------- */
function render() {
  const has = Boolean(prc.data);
  $("#prcResults").hidden = !has;
  $("#prcEmpty").hidden = has;
  if (!has) return;
  const { resultats, requete, genere, pv_indexes: indexed } = prc.data;
  const dated = resultats.filter((item) => item.date !== "0000-00-00").sort((a, b) => a.date.localeCompare(b.date));
  const first = dated[0];
  const last = dated[dated.length - 1];
  $("#prcTitle").textContent = requete[0] ? `Précédents : « ${requete[0].split("|")[0]} »` : "Précédents";
  $("#prcSummary").textContent = [
    `${resultats.length} PV mentionnent le sujet${indexed ? ` (sur ${indexed} PV indexés)` : ""}`,
    first ? `première mention ${formatDate(first)}` : "",
    last && last !== first ? `dernière mention ${formatDate(last)}` : "",
    genere ? `recherche du ${genere}` : "",
  ].filter(Boolean).join(" · ");
  $("#prcLimits").textContent =
    "Limites : PV du CE/CSE uniquement (pas de CHSCT/CSSCT) ; anciens .ppt non lus ; OCR imparfait sur les vieux scans ; " +
    "dates déduites des noms de fichiers. Une absence de résultat ne prouve pas qu'un sujet n'a jamais été traité.";
  renderTimeline();
  renderList();
}

function renderTimeline() {
  const counts = {};
  prc.data.resultats.forEach((item) => {
    const year = item.date.slice(0, 4);
    if (year !== "0000") counts[year] = (counts[year] || 0) + 1;
  });
  const years = Object.keys(counts).map(Number);
  const box = $("#prcTimeline");
  box.textContent = "";
  if (!years.length) return;
  const max = Math.max(...Object.values(counts));
  for (let year = Math.min(...years); year <= Math.max(...years); year += 1) {
    const count = counts[year] || 0;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "prc-bar" + (prc.year === year ? " prc-bar--active" : "");
    button.setAttribute("aria-pressed", String(prc.year === year));
    button.title = `${year} : ${count} PV`;
    const fill = document.createElement("span");
    fill.className = "prc-bar__fill";
    fill.style.height = `${count ? Math.max(4, Math.round((count / max) * 100)) : 0}%`;
    if (!count) fill.style.minHeight = "0";
    const num = document.createElement("span");
    num.className = "prc-bar__count";
    num.textContent = count ? String(count) : "";
    const label = document.createElement("span");
    label.textContent = String(year).slice(2);
    button.append(fill, num, label);
    button.addEventListener("click", () => {
      prc.year = prc.year === year ? null : year;
      renderTimeline();
      renderList();
    });
    box.append(button);
  }
  $("#prcYearHint").textContent = prc.year ? `filtre : ${prc.year} (cliquer à nouveau pour retirer)` : "cliquer une année pour filtrer";
}

function visibleItems() {
  const items = prc.data.resultats.filter((item) =>
    item.pertinence >= prc.min && (prc.year === null || item.date.startsWith(String(prc.year))));
  const byDate = (a, b) => a.date.localeCompare(b.date);
  if (prc.sort === "asc") return items.sort(byDate);
  if (prc.sort === "desc") return items.sort((a, b) => byDate(b, a));
  return items.sort((a, b) => b.pertinence - a.pertinence || byDate(a, b));
}

function renderList() {
  if (!prc.data) return;
  const items = visibleItems();
  $("#prcCount").textContent = `${items.length} affiché(s) sur ${prc.data.resultats.length}`;
  const list = $("#prcList");
  list.textContent = "";
  if (!items.length) {
    const empty = document.createElement("li");
    empty.className = "prc-hint";
    empty.textContent = "Aucun précédent avec ces filtres.";
    list.append(empty);
    return;
  }
  items.forEach((item) => list.append(itemNode(item)));
}

function itemNode(item) {
  const li = document.createElement("li");
  li.className = "prc-item";

  const score = document.createElement("div");
  score.className = "prc-score";
  const value = document.createElement("strong");
  value.textContent = String(item.pertinence);
  const bar = document.createElement("div");
  bar.className = "prc-score__bar";
  const fill = document.createElement("span");
  fill.style.width = `${item.pertinence}%`;
  bar.append(fill);
  const caption = document.createElement("small");
  caption.textContent = "pertinence";
  score.append(value, bar, caption);

  const body = document.createElement("div");
  const title = document.createElement("p");
  title.className = "prc-item__title";
  title.textContent = item.fichier.split("\\").pop();
  const meta = document.createElement("div");
  meta.className = "prc-item__meta";
  [
    formatDate(item),
    `page ${item.page}`,
    `${item.passages} passage(s)`,
    item.groupes_couverts ? `groupes ${item.groupes_couverts}` : "",
    item.fichier.split("\\").slice(0, -1).join(" › "),
  ].filter(Boolean).forEach((text) => {
    const span = document.createElement("span");
    span.textContent = text;
    meta.append(span);
  });
  if (item.precision_date !== "jour") {
    const badge = document.createElement("span");
    badge.className = "prc-badge";
    badge.textContent = `date approximative (${item.precision_date})`;
    meta.append(badge);
  }
  body.append(title, meta);

  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "button button--ghost";
  copy.textContent = "Copier la référence";
  copy.addEventListener("click", () => copyText(referenceLine(item), "Référence copiée."));

  li.append(score, body, copy);
  return li;
}

/* ---------- utilitaires ---------- */
function formatDate(item) {
  const [y, m, d] = item.date.split("-");
  if (y === "0000") return "date inconnue";
  if (item.precision_date === "jour") return `${d}/${m}/${y}`;
  if (item.precision_date === "mois") return `${m}/${y}`;
  return y;
}

function referenceLine(item) {
  return `${formatDate(item)} - ${item.fichier} (p. ${item.page}, pertinence ${item.pertinence}/100)`;
}

function timelineMarkdown() {
  const head = prc.data.requete.length ? `Précédents pour : ${prc.data.requete.join(" + ")}\n\n` : "";
  const rows = [...prc.data.resultats]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => `- ${referenceLine(item)}`);
  return `${head}${rows.join("\n")}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function copyText(text, message) {
  const done = () => showToast(message);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  try { document.execCommand("copy"); done(); } catch (error) { showToast("Copie impossible : sélectionnez le texte."); }
  area.remove();
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("toast--visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("toast--visible"), 2600);
}

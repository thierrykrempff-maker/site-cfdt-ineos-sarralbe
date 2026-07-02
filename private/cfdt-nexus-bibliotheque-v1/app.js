const STORAGE_KEY = "cfdt-nexus-bibliotheque-v1";
const SCHEMA_VERSION = "library-document-v1";

const CATEGORIES = [
  { id: "convention", marker: "CC", label: "Convention collective" },
  { id: "accord", marker: "AE", label: "Accord d'entreprise" },
  { id: "reglement", marker: "RI", label: "Règlement intérieur" },
  { id: "jurisprudence", marker: "J", label: "Jurisprudence" },
  { id: "modele", marker: "MC", label: "Modèle de courrier" },
  { id: "pv-cse", marker: "PV", label: "PV CSE" },
];

const CONFIDENTIALITY = [
  { id: "public", label: "Public", rank: 1 },
  { id: "interne", label: "Interne", rank: 2 },
  { id: "confidentiel", label: "Confidentiel", rank: 3 },
];

const FUTURE_CONNECTORS = [
  ["Indexation IA", "Texte normalisé, catégorie, mots-clés et niveau de confidentialité."],
  ["Recherche sémantique", "Recherche par sens, situation ou question salarié."],
  ["Routeur Intelligent", "Orientation vers Défenseur syndical, Conseiller salarié ou Rédacteur CFDT."],
  ["Alimentation Agents IA", "Flux documentaire filtré selon catégorie, usage et confidentialité."],
];

const els = {};

let documents = loadDocuments();
let state = {
  search: "",
  categories: new Set(CATEGORIES.map((item) => item.id)),
  confidentiality: new Set(CONFIDENTIALITY.map((item) => item.id)),
  sort: "recent",
  selectedId: documents[0]?.id || null,
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  populateSelects();
  bindEvents();
  render();
}

function cacheElements() {
  els.searchInput = document.querySelector("#searchInput");
  els.categoryFilters = document.querySelector("#categoryFilters");
  els.confidentialityFilters = document.querySelector("#confidentialityFilters");
  els.metricGrid = document.querySelector("#metricGrid");
  els.documentList = document.querySelector("#documentList");
  els.documentDetail = document.querySelector("#documentDetail");
  els.resultCount = document.querySelector("#resultCount");
  els.sortSelect = document.querySelector("#sortSelect");
  els.addPanel = document.querySelector("#addPanel");
  els.documentForm = document.querySelector("#documentForm");
  els.toast = document.querySelector("#toast");
}

function populateSelects() {
  document.querySelector("#categorySelect").innerHTML = CATEGORIES.map((item) =>
    optionHtml(item.id, `${item.marker} - ${item.label}`),
  ).join("");
  document.querySelector("#confidentialitySelect").innerHTML = CONFIDENTIALITY.map((item) =>
    optionHtml(item.id, item.label),
  ).join("");
  els.documentForm.date.value = today();
}

function bindEvents() {
  document.querySelector("#openAddPanel").addEventListener("click", () => {
    els.addPanel.hidden = false;
    els.documentForm.title.focus();
  });
  document.querySelector("#closeAddPanel").addEventListener("click", closeAddPanel);
  document.querySelector("#cancelAdd").addEventListener("click", closeAddPanel);
  document.querySelector("#resetFilters").addEventListener("click", resetFilters);
  document.querySelector("#exportButton").addEventListener("click", exportLibrary);

  els.searchInput.addEventListener("input", (event) => {
    state.search = normalizeText(event.target.value);
    renderListAndDetail();
  });
  els.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderListAndDetail();
  });
  els.documentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const created = createDocument(new FormData(els.documentForm));
    documents.unshift(created);
    state.selectedId = created.id;
    resetFilterState();
    saveDocuments();
    closeAddPanel();
    els.documentForm.reset();
    populateSelects();
    render();
    showToast("Document ajouté à la bibliothèque locale.");
  });
}

function closeAddPanel() {
  els.addPanel.hidden = true;
}

function resetFilters() {
  resetFilterState();
  render();
}

function resetFilterState() {
  state.search = "";
  state.categories = new Set(CATEGORIES.map((item) => item.id));
  state.confidentiality = new Set(CONFIDENTIALITY.map((item) => item.id));
  els.searchInput.value = "";
}

function render() {
  renderFilters();
  renderMetrics();
  renderListAndDetail();
}

function renderFilters() {
  const categoryCounts = countBy(documents, "category");
  els.categoryFilters.innerHTML = CATEGORIES.map((item) => filterOption({
    group: "category",
    id: item.id,
    label: `${item.marker} ${item.label}`,
    count: categoryCounts[item.id] || 0,
    checked: state.categories.has(item.id),
  })).join("");

  const confidentialityCounts = countBy(documents, "confidentiality");
  els.confidentialityFilters.innerHTML = CONFIDENTIALITY.map((item) => filterOption({
    group: "confidentiality",
    id: item.id,
    label: item.label,
    count: confidentialityCounts[item.id] || 0,
    checked: state.confidentiality.has(item.id),
  })).join("");

  document.querySelectorAll("[data-filter-group]").forEach((input) => {
    input.addEventListener("change", () => {
      const target = input.dataset.filterGroup === "category" ? state.categories : state.confidentiality;
      if (input.checked) target.add(input.value);
      else target.delete(input.value);
      renderListAndDetail();
    });
  });
}

function renderMetrics() {
  const confidentialCount = documents.filter((doc) => doc.confidentiality === "confidentiel").length;
  const internalCount = documents.filter((doc) => doc.confidentiality === "interne").length;
  const aiReady = documents.filter((doc) => integrationFor(doc)["Indexation IA"] === "ready").length;
  els.metricGrid.innerHTML = [
    ["Documents", documents.length],
    ["Internes", internalCount],
    ["Confidentiels", confidentialCount],
    ["IA prêts", aiReady],
  ].map(([label, value]) => `<div class="metric"><strong>${value}</strong><span>${escapeHtml(label)}</span></div>`).join("");
}

function renderListAndDetail() {
  const visible = sortedDocuments(filteredDocuments());
  if (visible.length && !visible.some((doc) => doc.id === state.selectedId)) state.selectedId = visible[0].id;
  els.resultCount.textContent = `${visible.length} document${visible.length > 1 ? "s" : ""}`;

  if (!visible.length) {
    els.documentList.innerHTML = `<div class="empty-state">Aucun document ne correspond aux critères.</div>`;
    renderDetail(null);
    return;
  }

  els.documentList.innerHTML = visible.map(documentCard).join("");
  document.querySelectorAll("[data-select-document]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedId = button.dataset.selectDocument;
      renderListAndDetail();
    });
  });
  renderDetail(documents.find((doc) => doc.id === state.selectedId) || visible[0]);
}

function documentCard(doc) {
  const category = categoryFor(doc.category);
  const confidentiality = confidentialityFor(doc.confidentiality);
  const selected = doc.id === state.selectedId ? " document-card--active" : "";
  return `
    <button class="document-card${selected}" type="button" data-select-document="${escapeAttr(doc.id)}">
      <div class="tag-row">
        ${badge(`${category.marker} ${category.label}`, "category")}
        ${badge(confidentiality.label, doc.confidentiality)}
        ${badge(doc.version)}
        ${badge(formatDate(doc.date))}
      </div>
      <h2>${escapeHtml(doc.title)}</h2>
      <p>${escapeHtml(doc.description)}</p>
      <div class="document-meta">
        ${doc.keywords.slice(0, 4).map((keyword) => `<span class="keyword">${escapeHtml(keyword)}</span>`).join("")}
      </div>
    </button>
  `;
}

function renderDetail(doc) {
  if (!doc) {
    els.documentDetail.innerHTML = `<div class="detail-empty"><h2>Aucun document</h2><p>Modifie la recherche ou les filtres.</p></div>`;
    return;
  }
  const category = categoryFor(doc.category);
  const confidentiality = confidentialityFor(doc.confidentiality);
  const integration = integrationFor(doc);
  const warning = doc.confidentiality === "confidentiel"
    ? `<div class="confidential-warning">Document confidentiel : accès et diffusion à encadrer avant usage réel.</div>`
    : "";
  els.documentDetail.innerHTML = `
    <article class="detail-card">
      <div>
        <p class="eyebrow">Fiche document</p>
        <h2>${escapeHtml(doc.title)}</h2>
        <div class="tag-row">${badge(`${category.marker} ${category.label}`, "category")}${badge(confidentiality.label, doc.confidentiality)}</div>
      </div>
      ${warning}
      <p>${escapeHtml(doc.description)}</p>
      <section class="detail-section">
        <h3>Informations</h3>
        <div class="info-grid">
          ${infoTile("Catégorie", category.label)}
          ${infoTile("Date", formatDate(doc.date))}
          ${infoTile("Version", doc.version)}
          ${infoTile("Fichier", doc.fileName || "Non lié")}
          ${infoTile("Confidentialité", confidentiality.label)}
        </div>
      </section>
      <section class="detail-section">
        <h3>Mots-clés</h3>
        <div class="keyword-list">${doc.keywords.map((keyword) => `<span class="keyword">${escapeHtml(keyword)}</span>`).join("")}</div>
      </section>
      <section class="detail-section">
        <h3>Préparation des intégrations futures</h3>
        <div class="connector-list">
          ${FUTURE_CONNECTORS.map(([name, description]) => connectorItem(name, description)).join("")}
        </div>
      </section>
      <section class="detail-section">
        <h3>Données prêtes pour le Cockpit</h3>
        <div class="connector-list">
          ${Object.entries(integration).map(([name, value]) => connectorItem(name, Array.isArray(value) ? value.join(", ") : value)).join("")}
        </div>
      </section>
    </article>
  `;
}

function createDocument(form) {
  const category = String(form.get("category") || CATEGORIES[0].id);
  const keywords = splitKeywords(form.get("keywords"));
  return normalizeDocument({
    id: uid("doc"),
    schemaVersion: SCHEMA_VERSION,
    title: String(form.get("title") || "").trim(),
    category,
    description: String(form.get("description") || "").trim(),
    keywords: keywords.length ? keywords : [categoryFor(category).label.toLowerCase()],
    date: String(form.get("date") || today()),
    version: String(form.get("version") || "v1").trim(),
    confidentiality: String(form.get("confidentiality") || "interne"),
    fileName: String(form.get("fileName") || "").trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "ajout manuel local",
  });
}

function filteredDocuments() {
  return documents.filter((doc) => {
    if (!state.categories.has(doc.category)) return false;
    if (!state.confidentiality.has(doc.confidentiality)) return false;
    if (!state.search) return true;
    return normalizeText([doc.title, doc.category, categoryFor(doc.category).label, doc.description, doc.keywords.join(" "), doc.version, doc.confidentiality].join(" ")).includes(state.search);
  });
}

function sortedDocuments(items) {
  return [...items].sort((a, b) => {
    if (state.sort === "title") return a.title.localeCompare(b.title, "fr");
    if (state.sort === "category") return categoryFor(a.category).label.localeCompare(categoryFor(b.category).label, "fr");
    if (state.sort === "confidentiality") return confidentialityFor(b.confidentiality).rank - confidentialityFor(a.confidentiality).rank;
    return String(b.date).localeCompare(String(a.date));
  });
}

function loadDocuments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedDocuments();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedDocuments();
    const valid = parsed.filter((doc) => CATEGORIES.some((category) => category.id === doc.category));
    return valid.length ? valid.map(normalizeDocument) : seedDocuments();
  } catch {
    return seedDocuments();
  }
}

function saveDocuments() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
}

function seedDocuments() {
  const now = "2026-07-02T09:00:00.000Z";
  return [
    ["doc-convention-chimie", "Convention collective nationale des industries chimiques", "convention", "Socle conventionnel pour analyser classifications, salaires minima, ancienneté et droits de branche.", ["chimie", "classification", "salaires minima", "branche"], "2026-01-01", "v2026.1", "public", "convention-collective-chimie.pdf"],
    ["doc-accords-ineos", "Accords INEOS", "accord", "Point d'entrée pour classer les accords d'entreprise utiles aux dossiers : temps de travail, rémunération, santé et organisation.", ["INEOS", "accord", "temps de travail", "rémunération"], "2026-02-15", "v1", "interne", "accords-ineos-index.pdf"],
    ["doc-reglement-interieur", "Règlement intérieur", "reglement", "Référence interne pour les règles disciplinaires, sécurité, comportement et procédure de sanction.", ["discipline", "sécurité", "sanction", "règlement"], "2025-09-01", "v2025", "confidentiel", "reglement-interieur.pdf"],
    ["doc-jurisprudence-comparaison", "Jurisprudence - éléments de comparaison", "jurisprudence", "Repère de travail pour préparer une analyse prudente sur discrimination, égalité de traitement ou sanction disproportionnée.", ["jurisprudence", "comparaison", "preuve", "discrimination"], "2025-09-12", "note v1", "interne", "jurisprudence-elements-comparaison.pdf"],
    ["doc-modele-explications-rh", "Modèle de courrier - demande d'explications RH", "modele", "Trame prudente pour demander des explications sans accusation ni conclusion prématurée.", ["courrier", "RH", "demande", "prudence"], "2026-03-10", "v1", "public", "modele-demande-explications-rh.docx"],
    ["doc-pv-cse-conditions-travail", "PV CSE - suivi conditions de travail", "pv-cse", "Référence interne pour retrouver les alertes, questions et engagements de suivi en matière de conditions de travail.", ["CSE", "PV", "conditions de travail", "alerte"], "2026-04-18", "avril 2026", "confidentiel", "pv-cse-conditions-travail.pdf"],
  ].map(([id, title, category, description, keywords, date, version, confidentiality, fileName]) => normalizeDocument({
    id, schemaVersion: SCHEMA_VERSION, title, category, description, keywords, date, version, confidentiality, fileName, createdAt: now, updatedAt: now, source: "démonstration",
  }));
}

function normalizeDocument(doc) {
  return {
    id: doc.id || uid("doc"),
    schemaVersion: SCHEMA_VERSION,
    title: String(doc.title || "Document sans titre").trim(),
    category: CATEGORIES.some((item) => item.id === doc.category) ? doc.category : CATEGORIES[0].id,
    description: String(doc.description || "").trim(),
    keywords: Array.isArray(doc.keywords) ? doc.keywords.map((item) => String(item).trim()).filter(Boolean) : splitKeywords(doc.keywords),
    date: doc.date || today(),
    version: String(doc.version || "v1").trim(),
    confidentiality: CONFIDENTIALITY.some((item) => item.id === doc.confidentiality) ? doc.confidentiality : "interne",
    fileName: String(doc.fileName || "").trim(),
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
    source: doc.source || "bibliothèque locale",
  };
}

function exportLibrary() {
  const payload = { exportedAt: new Date().toISOString(), module: "CFDT Nexus - Bibliothèque documentaire", version: "1.0", schemaVersion: SCHEMA_VERSION, categories: CATEGORIES, confidentiality: CONFIDENTIALITY, documents: documents.map((doc) => ({ ...doc, integration: integrationFor(doc) })) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cfdt-nexus-bibliotheque-${today()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Export JSON préparé.");
}

function integrationFor(doc) {
  const routeKeys = [doc.category, doc.confidentiality, ...doc.keywords].map((item) => normalizeText(item).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).filter(Boolean);
  const agents = { convention: ["defenseur-syndical", "conseiller-salarie"], accord: ["defenseur-syndical", "redacteur-cfdt"], reglement: ["defenseur-syndical"], jurisprudence: ["defenseur-syndical"], modele: ["defenseur-syndical", "redacteur-cfdt"], "pv-cse": ["defenseur-syndical", "redacteur-cfdt"] };
  return { "Indexation IA": "ready", "Recherche sémantique": normalizeText(`${doc.title} ${categoryFor(doc.category).label} ${doc.description} ${doc.keywords.join(" ")}`), "Routeur Intelligent": routeKeys, "Agents IA": agents[doc.category] || ["defenseur-syndical"] };
}

function filterOption({ group, id, label, count, checked }) {
  return `<label class="filter-option"><input type="checkbox" data-filter-group="${escapeAttr(group)}" value="${escapeAttr(id)}"${checked ? " checked" : ""}><span>${escapeHtml(label)}</span><small>${count}</small></label>`;
}
function infoTile(label, value) { return `<div class="info-tile"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "Non renseigné")}</strong></div>`; }
function connectorItem(label, value) { return `<div class="connector-item"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value || "Non renseigné")}</span></div>`; }
function badge(label, variant = "") { return `<span class="badge${variant ? ` badge--${escapeAttr(variant)}` : ""}">${escapeHtml(label)}</span>`; }
function categoryFor(id) { return CATEGORIES.find((item) => item.id === id) || CATEGORIES[0]; }
function confidentialityFor(id) { return CONFIDENTIALITY.find((item) => item.id === id) || CONFIDENTIALITY[1]; }
function countBy(items, key) { return items.reduce((acc, item) => { acc[item[key]] = (acc[item[key]] || 0) + 1; return acc; }, {}); }
function splitKeywords(value) { return String(value || "").split(",").map((item) => item.trim()).filter(Boolean); }
function normalizeText(value) { return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
function optionHtml(value, label) { return `<option value="${escapeAttr(value)}">${escapeHtml(label)}</option>`; }
function uid(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
function today() { return new Date().toISOString().slice(0, 10); }
function formatDate(value) { if (!value) return "Non daté"; return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value)); }
function showToast(message) { els.toast.textContent = message; els.toast.classList.add("toast--visible"); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => els.toast.classList.remove("toast--visible"), 2600); }
function escapeHtml(value) { return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
function escapeAttr(value) { return escapeHtml(value).replace(/`/g, "&#096;"); }

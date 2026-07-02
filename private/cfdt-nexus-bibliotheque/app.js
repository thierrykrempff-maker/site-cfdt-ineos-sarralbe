const STORAGE_KEY = "cfdt-nexus-bibliotheque-v1-1";
const SCHEMA_VERSION = "library-document-v1-1";

const CATEGORIES = [
  { id: "convention", marker: "📘", label: "Convention collective" },
  { id: "accord", marker: "📄", label: "Accord d'entreprise" },
  { id: "jurisprudence", marker: "⚖", label: "Jurisprudence" },
  { id: "reglement", marker: "📋", label: "Règlement intérieur" },
  { id: "procedure", marker: "📝", label: "Procédure interne" },
  { id: "pv-cse", marker: "📂", label: "PV CSE" },
  { id: "modele", marker: "📑", label: "Modèle de courrier" },
  { id: "doc-cfdt", marker: "📰", label: "Documentation CFDT" },
];

const CONFIDENTIALITY = [
  { id: "public", label: "Public", rank: 1 },
  { id: "interne", label: "Interne CFDT", rank: 2 },
  { id: "confidentiel", label: "Confidentiel", rank: 3 },
];

const FUTURE_CONNECTORS = [
  ["Assistant IA", "Synthèse, questions utiles et documents liés."],
  ["Routeur intelligent", "Orientation vers expert Paie, CSSCT, Défenseur syndical ou Convention collective."],
  ["Recherche sémantique", "Recherche par sens, situation ou question salarié."],
  ["n8n", "Indexation, notifications, relances et archivage."],
  ["OCR", "Extraction automatique depuis scan ou photo."],
  ["PDF / Word", "Lecture, versioning et génération de modèles."],
];

const els = {};

let documents = loadDocuments();
let state = {
  search: "",
  selectedCategories: new Set(CATEGORIES.map((item) => item.id)),
  selectedConfidentiality: new Set(CONFIDENTIALITY.map((item) => item.id)),
  sort: "recent",
  view: "list",
  selectedId: documents[0]?.id || null,
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  populateSelects();
  bindStaticEvents();
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

function bindStaticEvents() {
  document.querySelector("#openAddPanel").addEventListener("click", () => {
    els.addPanel.hidden = false;
    els.documentForm.title.focus();
  });

  document.querySelector("#closeAddPanel").addEventListener("click", closeAddPanel);
  document.querySelector("#cancelAddDocument").addEventListener("click", closeAddPanel);
  document.querySelector("#resetFiltersButton").addEventListener("click", resetFilters);
  document.querySelector("#exportLibraryButton").addEventListener("click", exportLibrary);

  els.searchInput.addEventListener("input", (event) => {
    state.search = normalizeText(event.target.value.trim());
    renderListAndDetail();
  });

  els.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderListAndDetail();
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      renderListAndDetail();
    });
  });

  els.documentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const created = createDocument(new FormData(els.documentForm));
    documents.unshift(created);
    state.selectedId = created.id;
    state.search = "";
    state.selectedCategories = new Set(CATEGORIES.map((item) => item.id));
    state.selectedConfidentiality = new Set(CONFIDENTIALITY.map((item) => item.id));
    els.searchInput.value = "";
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
  state.search = "";
  state.selectedCategories = new Set(CATEGORIES.map((item) => item.id));
  state.selectedConfidentiality = new Set(CONFIDENTIALITY.map((item) => item.id));
  els.searchInput.value = "";
  render();
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
    checked: state.selectedCategories.has(item.id),
  })).join("");

  const confidentialityCounts = countBy(documents, "confidentiality");
  els.confidentialityFilters.innerHTML = CONFIDENTIALITY.map((item) => filterOption({
    group: "confidentiality",
    id: item.id,
    label: item.label,
    count: confidentialityCounts[item.id] || 0,
    checked: state.selectedConfidentiality.has(item.id),
  })).join("");

  document.querySelectorAll("[data-filter-group]").forEach((input) => {
    input.addEventListener("change", () => {
      const targetSet = input.dataset.filterGroup === "category"
        ? state.selectedCategories
        : state.selectedConfidentiality;
      if (input.checked) {
        targetSet.add(input.value);
      } else {
        targetSet.delete(input.value);
      }
      renderListAndDetail();
    });
  });
}

function renderMetrics() {
  const confidentialCount = documents.filter((doc) => doc.confidentiality === "confidentiel").length;
  const internalCount = documents.filter((doc) => doc.confidentiality === "interne").length;
  const companies = new Set(documents.map((doc) => doc.company).filter(Boolean));

  els.metricGrid.innerHTML = [
    ["Documents", documents.length],
    ["Confidentiels", confidentialCount],
    ["Internes", internalCount],
    ["Sources", companies.size],
  ].map(([label, value]) => `<div class="metric"><strong>${value}</strong><span>${escapeHtml(label)}</span></div>`).join("");
}

function renderListAndDetail() {
  const visible = sortedDocuments(filteredDocuments());
  if (visible.length && !visible.some((doc) => doc.id === state.selectedId)) {
    state.selectedId = visible[0].id;
  }

  updateViewButtons();
  els.resultCount.textContent = `${visible.length} document${visible.length > 1 ? "s" : ""}`;
  els.documentList.className = `document-list document-list--${state.view}`;

  if (!visible.length) {
    els.documentList.innerHTML = `<div class="empty-state">Aucun document ne correspond aux critères.</div>`;
    renderDetail(null);
    return;
  }

  els.documentList.innerHTML = visible.map((doc) => documentCard(doc)).join("");
  document.querySelectorAll("[data-select-document]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedId = button.dataset.selectDocument;
      renderListAndDetail();
    });
  });

  renderDetail(documents.find((doc) => doc.id === state.selectedId) || visible[0]);
}

function updateViewButtons() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("segmented__button--active", button.dataset.view === state.view);
  });
}

function documentCard(doc) {
  const category = categoryFor(doc.category);
  const confidentiality = confidentialityFor(doc.confidentiality);
  const selected = doc.id === state.selectedId ? " document-card--active" : "";
  const keywords = doc.keywords.slice(0, state.view === "cards" ? 4 : 3);

  return `
    <button class="document-card${selected}" type="button" data-select-document="${escapeAttr(doc.id)}">
      <div class="document-card__topline">
        <span class="category-icon" aria-hidden="true">${escapeHtml(category.marker)}</span>
        <span class="badge badge--category">${escapeHtml(category.label)}</span>
        <span class="badge badge--${escapeAttr(doc.confidentiality)}">${escapeHtml(confidentiality.label)}</span>
      </div>
      <h2>${escapeHtml(doc.title)}</h2>
      <p>${escapeHtml(doc.description)}</p>
      <div class="document-meta">
        <span>${escapeHtml(doc.company)}</span>
        <span>${formatDate(doc.date)}</span>
        <span>${escapeHtml(doc.version)}</span>
      </div>
      <div class="tag-row">
        ${keywords.map((keyword) => `<span class="keyword">${escapeHtml(keyword)}</span>`).join("")}
      </div>
    </button>
  `;
}

function renderDetail(doc) {
  if (!doc) {
    els.documentDetail.innerHTML = `
      <div class="detail-empty">
        <div>
          <h2>Aucun document</h2>
          <p>Modifie la recherche ou les filtres.</p>
        </div>
      </div>
    `;
    return;
  }

  const category = categoryFor(doc.category);
  const confidentiality = confidentialityFor(doc.confidentiality);
  const confidentialNotice = doc.confidentiality === "confidentiel"
    ? `<div class="confidential-warning">Document confidentiel : accès et diffusion à encadrer lors des futures règles de sécurité.</div>`
    : "";

  els.documentDetail.innerHTML = `
    <article class="detail-card">
      <div>
        <p class="eyebrow">Fiche document</p>
        <h2>${escapeHtml(doc.title)}</h2>
        <div class="tag-row detail-tags">
          <span class="badge badge--category">${escapeHtml(category.marker)} ${escapeHtml(category.label)}</span>
          <span class="badge badge--${escapeAttr(doc.confidentiality)}">${escapeHtml(confidentiality.label)}</span>
        </div>
      </div>

      ${confidentialNotice}
      <p>${escapeHtml(doc.description)}</p>

      <section class="detail-section">
        <h3>Informations</h3>
        <div class="info-grid">
          ${infoTile("Catégorie", category.label)}
          ${infoTile("Entreprise", doc.company)}
          ${infoTile("Date", formatDate(doc.date))}
          ${infoTile("Version", doc.version)}
          ${infoTile("Auteur", doc.author)}
          ${infoTile("Fichier", doc.fileName || "Non lié")}
          ${infoTile("Confidentialité", confidentiality.label)}
        </div>
      </section>

      <section class="detail-section">
        <h3>Mots-clés</h3>
        <div class="keyword-list">
          ${doc.keywords.map((keyword) => `<span class="keyword">${escapeHtml(keyword)}</span>`).join("")}
        </div>
      </section>

      <section class="detail-section">
        <h3>Notes internes</h3>
        <p>${escapeHtml(doc.notes || "Aucune note interne.")}</p>
      </section>

      <section class="detail-section">
        <h3>Préparation des intégrations futures</h3>
        <div class="connector-list">
          ${FUTURE_CONNECTORS.map(([name, description]) => `
            <div class="connector-item">
              <strong>${escapeHtml(name)}</strong>
              <span>${escapeHtml(description)}</span>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="detail-section">
        <h3>Données prêtes pour le Cockpit</h3>
        <div class="connector-list">
          ${Object.entries(integrationFor(doc)).map(([label, value]) => `
            <div class="connector-item">
              <strong>${escapeHtml(label)}</strong>
              <span>${escapeHtml(Array.isArray(value) ? value.join(", ") : value)}</span>
            </div>
          `).join("")}
        </div>
      </section>
    </article>
  `;
}

function createDocument(form) {
  const keywords = splitKeywords(String(form.get("keywords") || ""));
  const category = String(form.get("category") || CATEGORIES[0].id);

  return {
    id: uid("doc"),
    schemaVersion: SCHEMA_VERSION,
    title: String(form.get("title") || "").trim(),
    category,
    description: String(form.get("description") || "").trim(),
    company: String(form.get("company") || "").trim(),
    date: String(form.get("date") || today()),
    version: String(form.get("version") || "v1").trim(),
    author: String(form.get("author") || "").trim(),
    keywords: keywords.length ? keywords : [categoryFor(category).label.toLowerCase()],
    confidentiality: String(form.get("confidentiality") || "interne"),
    fileName: String(form.get("fileName") || "").trim(),
    notes: String(form.get("notes") || "").trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "ajout manuel local",
  };
}

function filteredDocuments() {
  return documents.filter((doc) => {
    if (!state.selectedCategories.has(doc.category)) return false;
    if (!state.selectedConfidentiality.has(doc.confidentiality)) return false;
    if (!state.search) return true;

    const haystack = normalizeText([
      doc.title,
      doc.description,
      doc.company,
      doc.author,
      doc.version,
      categoryFor(doc.category).label,
      confidentialityFor(doc.confidentiality).label,
      doc.keywords.join(" "),
    ].join(" "));

    return haystack.includes(state.search);
  });
}

function sortedDocuments(items) {
  return [...items].sort((a, b) => {
    if (state.sort === "title") return a.title.localeCompare(b.title, "fr");
    if (state.sort === "category") return categoryFor(a.category).label.localeCompare(categoryFor(b.category).label, "fr");
    if (state.sort === "company") return a.company.localeCompare(b.company, "fr");
    if (state.sort === "confidentiality") {
      return confidentialityFor(b.confidentiality).rank - confidentialityFor(a.confidentiality).rank;
    }
    return String(b.date).localeCompare(String(a.date));
  });
}

function loadDocuments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedDocuments();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedDocuments();
    const validDocs = parsed.filter((doc) => CATEGORIES.some((category) => category.id === doc.category));
    if (!validDocs.length) return seedDocuments();
    return validDocs.map(normalizeDocument);
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
    {
      id: "doc-convention-chimie",
      title: "Convention collective nationale des industries chimiques",
      category: "convention",
      description: "Socle conventionnel pour analyser classifications, salaires minima, ancienneté et droits de branche.",
      company: "Branche Chimie",
      date: "2026-01-01",
      version: "v2026.1",
      author: "FCE-CFDT / Branche",
      keywords: ["chimie", "classification", "salaires minima", "branche"],
      confidentiality: "public",
      fileName: "convention-collective-chimie.pdf",
      notes: "Document de référence à relier au futur expert Convention collective.",
    },
    {
      id: "doc-accord-temps-travail",
      title: "Accord Temps de travail",
      category: "accord",
      description: "Accord d'entreprise utilisé pour vérifier horaires, cycles, repos, majorations et organisation du temps de travail.",
      company: "INEOS Sarralbe",
      date: "2024-06-18",
      version: "v1.3",
      author: "Direction / Organisations syndicales",
      keywords: ["horaires", "repos", "cycle", "temps de travail"],
      confidentiality: "interne",
      fileName: "accord-temps-de-travail.pdf",
      notes: "Vérifier la version applicable avant toute réponse.",
    },
    {
      id: "doc-accord-astreinte",
      title: "Accord Astreinte",
      category: "accord",
      description: "Repères pour comprendre périodes d'astreinte, compensations, délais de prévenance et interventions.",
      company: "INEOS Sarralbe",
      date: "2023-11-30",
      version: "v2",
      author: "Direction / Organisations syndicales",
      keywords: ["astreinte", "intervention", "compensation", "prévenance"],
      confidentiality: "interne",
      fileName: "accord-astreinte.pdf",
      notes: "À connecter au futur expert Paie pour les compensations.",
    },
    {
      id: "doc-accord-teletravail",
      title: "Accord Télétravail",
      category: "accord",
      description: "Cadre d'accès au télétravail, modalités de demande, refus, équipements et suivi de la charge de travail.",
      company: "INEOS Sarralbe",
      date: "2025-03-12",
      version: "v1",
      author: "Direction / Organisations syndicales",
      keywords: ["télétravail", "organisation", "charge de travail", "refus"],
      confidentiality: "interne",
      fileName: "accord-teletravail.pdf",
      notes: "Utile pour les dossiers d'organisation du travail et QVCT.",
    },
    {
      id: "doc-reglement-interieur",
      title: "Règlement intérieur",
      category: "reglement",
      description: "Référence interne pour les règles disciplinaires, sécurité, comportement et procédure de sanction.",
      company: "INEOS Sarralbe",
      date: "2025-09-01",
      version: "v2025",
      author: "Direction",
      keywords: ["discipline", "sécurité", "sanction", "règlement"],
      confidentiality: "confidentiel",
      fileName: "reglement-interieur.pdf",
      notes: "Prévoir droits d'accès avant usage réel.",
    },
    {
      id: "doc-jurisprudence-discrimination",
      title: "Jurisprudence - éléments de comparaison",
      category: "jurisprudence",
      description: "Repère de travail pour préparer une analyse prudente sur discrimination, égalité de traitement ou sanction disproportionnée.",
      company: "Références droit social",
      date: "2025-09-12",
      version: "note v1",
      author: "CFDT Nexus",
      keywords: ["jurisprudence", "comparaison", "preuve", "discrimination"],
      confidentiality: "interne",
      fileName: "jurisprudence-elements-comparaison.pdf",
      notes: "Ne pas citer sans vérification de la décision source et du contexte applicable.",
    },
    {
      id: "doc-procedure-signalement",
      title: "Procédure interne - signalement santé sécurité",
      category: "procedure",
      description: "Repère de procédure pour orienter un signalement santé, sécurité ou conditions de travail vers les bons interlocuteurs.",
      company: "INEOS Sarralbe",
      date: "2026-02-10",
      version: "v1",
      author: "CFDT Nexus",
      keywords: ["procédure", "signalement", "CSSCT", "santé sécurité"],
      confidentiality: "interne",
      fileName: "procedure-signalement-sante-securite.pdf",
      notes: "À connecter au futur expert CSSCT et aux automatisations n8n.",
    },
    {
      id: "doc-cfdt-repere-accompagnement",
      title: "Repère CFDT - accompagner un salarié",
      category: "doc-cfdt",
      description: "Documentation CFDT de référence pour garder une posture claire, humaine, factuelle et prudente dans les accompagnements.",
      company: "CFDT INEOS Sarralbe",
      date: "2026-07-02",
      version: "v1",
      author: "CFDT Nexus",
      keywords: ["CFDT", "accompagnement", "écoute", "prudence"],
      confidentiality: "public",
      fileName: "repere-cfdt-accompagnement.pdf",
      notes: "Document socle pour le ton et les limites des futurs assistants.",
    },
    {
      id: "doc-modele-convocation",
      title: "Modèle Convocation",
      category: "modele",
      description: "Modèle de courrier pour préparer une convocation ou analyser les mentions utiles avant entretien.",
      company: "CFDT INEOS Sarralbe",
      date: "2026-07-02",
      version: "v1",
      author: "CFDT Nexus",
      keywords: ["convocation", "entretien", "courrier", "modèle"],
      confidentiality: "interne",
      fileName: "modele-convocation.docx",
      notes: "Validation humaine obligatoire avant utilisation.",
    },
    {
      id: "doc-pv-cse-conditions-travail",
      title: "PV CSE - suivi conditions de travail",
      category: "pv-cse",
      description: "Référence interne pour retrouver les alertes, questions et engagements de suivi en matière de conditions de travail.",
      company: "INEOS Sarralbe",
      date: "2026-04-18",
      version: "avril 2026",
      author: "CSE",
      keywords: ["CSE", "PV", "conditions de travail", "alerte"],
      confidentiality: "confidentiel",
      fileName: "pv-cse-conditions-travail.pdf",
      notes: "Document confidentiel : accès à restreindre avant toute connexion à une base réelle.",
    },
  ].map((item) => normalizeDocument({ ...item, createdAt: now, updatedAt: now, source: "démonstration" }));
}

function normalizeDocument(doc) {
  const category = CATEGORIES.some((item) => item.id === doc.category) ? doc.category : "convention";
  const confidentiality = CONFIDENTIALITY.some((item) => item.id === doc.confidentiality) ? doc.confidentiality : "interne";
  return {
    id: doc.id || uid("doc"),
    schemaVersion: doc.schemaVersion || SCHEMA_VERSION,
    title: String(doc.title || "Document sans titre").trim(),
    category,
    description: String(doc.description || "").trim(),
    company: String(doc.company || "").trim(),
    date: doc.date || today(),
    version: String(doc.version || "v1").trim(),
    author: String(doc.author || "").trim(),
    keywords: Array.isArray(doc.keywords) ? doc.keywords.map((item) => String(item).trim()).filter(Boolean) : splitKeywords(doc.keywords || ""),
    confidentiality,
    fileName: String(doc.fileName || "").trim(),
    notes: String(doc.notes || "").trim(),
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
    source: doc.source || "bibliothèque locale",
  };
}

function exportLibrary() {
  const payload = {
    exportedAt: new Date().toISOString(),
    module: "CFDT Nexus - Bibliothèque documentaire intelligente",
    version: "1.1",
    categories: CATEGORIES,
    confidentiality: CONFIDENTIALITY,
    documents: documents.map((doc) => ({
      ...doc,
      integration: integrationFor(doc),
    })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cfdt-nexus-bibliotheque-${today()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Export JSON préparé.");
}

function filterOption({ group, id, label, count, checked }) {
  return `
    <label class="filter-option">
      <input type="checkbox" data-filter-group="${escapeAttr(group)}" value="${escapeAttr(id)}"${checked ? " checked" : ""}>
      <span>${escapeHtml(label)}</span>
      <small>${count}</small>
    </label>
  `;
}

function infoTile(label, value) {
  return `
    <div class="info-tile">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value || "Non renseigné")}</strong>
    </div>
  `;
}

function integrationFor(doc) {
  const category = categoryFor(doc.category).label;
  const routeKeys = [doc.category, doc.confidentiality, ...doc.keywords]
    .map((item) => normalizeText(item).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))
    .filter(Boolean);
  const agentMap = {
    convention: ["defenseur-syndical", "conseiller-salarie"],
    accord: ["defenseur-syndical", "redacteur-cfdt"],
    reglement: ["defenseur-syndical"],
    jurisprudence: ["defenseur-syndical"],
    procedure: ["cssct", "defenseur-syndical"],
    modele: ["defenseur-syndical", "redacteur-cfdt"],
    "pv-cse": ["defenseur-syndical", "redacteur-cfdt"],
    "doc-cfdt": ["conseiller-salarie", "redacteur-cfdt"],
  };
  return {
    "Assistant IA": "ready",
    "Recherche sémantique": normalizeText(`${doc.title} ${category} ${doc.description} ${doc.keywords.join(" ")}`),
    "Routeur intelligent": routeKeys,
    "n8n": `library.document.${doc.category}.${doc.confidentiality}`,
    "OCR": doc.fileName ? "pending-extraction" : "no-file",
    "PDF / Word": doc.fileName || "no-file",
    "Agents IA": agentMap[doc.category] || ["defenseur-syndical"],
  };
}

function categoryFor(id) {
  return CATEGORIES.find((item) => item.id === id) || CATEGORIES[0];
}

function confidentialityFor(id) {
  return CONFIDENTIALITY.find((item) => item.id === id) || CONFIDENTIALITY[1];
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}

function splitKeywords(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function optionHtml(value, label) {
  return `<option value="${escapeAttr(value)}">${escapeHtml(label)}</option>`;
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "Non daté";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("toast--visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove("toast--visible");
  }, 2600);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

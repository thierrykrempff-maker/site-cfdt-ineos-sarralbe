const profiles = [
  {
    id: "summary",
    title: "Résumé intelligent",
    description: "Comprendre vite l'essentiel du document.",
  },
  {
    id: "agreement",
    title: "Projet d'accord",
    description: "Identifier impacts, reculs possibles et leviers de négociation.",
  },
  {
    id: "cse",
    title: "CSE",
    description: "Préparer les questions et points à inscrire au suivi CSE.",
  },
  {
    id: "defender",
    title: "Défenseur syndical",
    description: "Repérer les faits, pièces, délais et risques de procédure.",
  },
  {
    id: "cssct",
    title: "CSSCT",
    description: "Lire le document sous l'angle santé, sécurité et conditions de travail.",
  },
  {
    id: "pay",
    title: "Paie",
    description: "Contrôler les impacts paie, primes, astreintes et régularisations.",
  },
  {
    id: "communication",
    title: "Communication CFDT",
    description: "Préparer un message clair, utile et prudent pour les salariés.",
  },
  {
    id: "blindspots",
    title: "Qu'est-ce que je n'ai pas vu ?",
    description: "Chercher les angles morts et vérifications oubliées.",
  },
];

const futureConnectors = [
  ["Routeur Intelligent", "Choisir le bon profil et le bon agent selon le document."],
  ["Agent Défenseur Syndical", "Analyser faits, pièces, délais et procédure."],
  ["Agent Paie", "Vérifier primes, temps, astreintes et régularisations."],
  ["Agent CSSCT", "Repérer risques santé, sécurité et conditions de travail."],
  ["Agent Convention Chimie", "Comparer avec la convention collective Chimie."],
  ["Bibliothèque documentaire", "Retrouver accords, modèles et fiches expurgées."],
  ["n8n", "Créer tâches, alertes, exports et circuits de validation."],
  ["GPT CFDT Nexus", "Générer des synthèses prudentes et relues par l'humain."],
];

const analysisBlocks = [
  "Résumé exécutif",
  "Points importants",
  "Points de vigilance",
  "Questions à poser",
  "Documents manquants",
  "Risques",
  "Textes à vérifier",
  "Actions recommandées",
  "Proposition de communication CFDT",
];

const agreementBlocks = [
  "Ce que prévoit le projet",
  "Ce qui change par rapport à l'existant",
  "Salariés concernés",
  "Avantages",
  "Risques ou reculs possibles",
  "Points flous",
  "Questions à poser en CSE",
  "Points de négociation",
  "Vérification Convention Chimie",
  "Vérification accords existants",
  "Proposition d'article ou de tract CFDT",
];

const profileContent = {
  summary: {
    tone: "lecture synthétique",
    questions: [
      "Quel est l'objectif exact du document ?",
      "Quelle décision ou information doit être retenue en priorité ?",
      "Qui est concerné concrètement ?",
      "Quelle échéance impose une action rapide ?",
    ],
  },
  agreement: {
    tone: "lecture de négociation",
    questions: [
      "Quel problème l'accord prétend-il résoudre ?",
      "Quels droits existants sont modifiés ou encadrés ?",
      "Quels salariés sont exclus ou moins protégés ?",
      "Quelles garanties la direction accepte-t-elle d'écrire ?",
      "Quelle clause de revoyure peut être demandée ?",
    ],
  },
  cse: {
    tone: "lecture instance CSE",
    questions: [
      "Quelle information manque pour rendre un avis éclairé ?",
      "Quels impacts concrets sur l'organisation du travail ?",
      "Quels indicateurs doivent être transmis au CSE ?",
      "Quel calendrier de suivi demander ?",
    ],
  },
  defender: {
    tone: "lecture défense syndicale",
    questions: [
      "Quels faits sont établis par écrit ?",
      "Quels délais de contestation ou de réponse sont à surveiller ?",
      "Quelles pièces manquent pour comprendre la situation ?",
      "Le salarié a-t-il une version chronologique des faits ?",
    ],
  },
  cssct: {
    tone: "lecture santé sécurité",
    questions: [
      "Le document modifie-t-il l'exposition aux risques ?",
      "Quels postes ou équipes sont concernés ?",
      "La charge de travail ou la fatigue est-elle prise en compte ?",
      "Une analyse de risque doit-elle être demandée ?",
    ],
  },
  pay: {
    tone: "lecture paie",
    questions: [
      "Quelles rubriques de paie sont touchées ?",
      "Les primes ou majorations sont-elles clairement définies ?",
      "Quelle période de régularisation est prévue ?",
      "Quels justificatifs demander pour contrôler le calcul ?",
    ],
  },
  communication: {
    tone: "lecture communication",
    questions: [
      "Quel message utile faut-il transmettre aux salariés ?",
      "Quels faits sont vérifiés et publiables ?",
      "Quelle formulation éviter pour rester prudent ?",
      "Quelle action concrète proposer en conclusion ?",
    ],
  },
  blindspots: {
    tone: "lecture angles morts",
    questions: [
      "Quel public semble oublié par le document ?",
      "Quelle conséquence indirecte peut apparaître plus tard ?",
      "Quelle information manque pour éviter une conclusion trop rapide ?",
      "Quel document de référence doit être comparé ?",
    ],
  },
};

const blindSpotItems = {
  oftenForgotten: [
    "Les salariés exclus du périmètre ou concernés indirectement.",
    "La date d'entrée en vigueur et les périodes transitoires.",
    "Les effets sur les primes, horaires, repos ou charge de travail.",
  ],
  missingInfo: [
    "Version applicable du document de référence.",
    "Liste précise des services ou équipes concernés.",
    "Indicateurs chiffrés permettant de vérifier les affirmations.",
  ],
  hiddenRisks: [
    "Clause floue laissant une marge d'interprétation trop large.",
    "Recul discret par rapport à un usage ou un accord existant.",
    "Absence de suivi CSE ou de clause de revoyure.",
  ],
  nextChecks: [
    "Comparer avec la Convention collective Chimie.",
    "Chercher les accords existants sur le même sujet.",
    "Préparer une question écrite avant la prochaine réunion.",
  ],
};

let activeProfile = "summary";
let currentFile = null;

const els = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  renderProfiles();
  renderConnectors();
  renderAnalysis();
  bindEvents();
}

function cacheElements() {
  els.profileGrid = document.querySelector("#profileGrid");
  els.connectorList = document.querySelector("#connectorList");
  els.analysisResult = document.querySelector("#analysisResult");
  els.agreementPanel = document.querySelector("#agreementPanel");
  els.agreementGrid = document.querySelector("#agreementGrid");
  els.activeProfileTitle = document.querySelector("#activeProfileTitle");
  els.documentInput = document.querySelector("#documentInput");
  els.fileSummary = document.querySelector("#fileSummary");
  els.confidentialitySelect = document.querySelector("#confidentialitySelect");
  els.documentKindSelect = document.querySelector("#documentKindSelect");
  els.questionsOutput = document.querySelector("#questionsOutput");
  els.blindSpotPanel = document.querySelector("#blindSpotPanel");
  els.toast = document.querySelector("#toast");
}

function bindEvents() {
  els.documentInput.addEventListener("change", handleFileSelection);
  els.confidentialitySelect.addEventListener("change", renderAnalysis);
  els.documentKindSelect.addEventListener("change", renderAnalysis);

  document.querySelector("#prepareQuestionsButton").addEventListener("click", () => {
    renderQuestions();
    showToast("Questions préparées.");
  });

  document.querySelector("#blindSpotsButton").addEventListener("click", () => {
    activeProfile = "blindspots";
    renderProfiles();
    renderAnalysis();
    renderBlindSpots();
    showToast("Angles morts simulés affichés.");
  });
}

function renderProfiles() {
  els.profileGrid.innerHTML = profiles.map((profile) => `
    <button class="profile-card${profile.id === activeProfile ? " profile-card--active" : ""}" type="button" data-profile="${profile.id}">
      <strong>${escapeHtml(profile.title)}</strong>
      <span>${escapeHtml(profile.description)}</span>
    </button>
  `).join("");

  document.querySelectorAll("[data-profile]").forEach((button) => {
    button.addEventListener("click", () => {
      activeProfile = button.dataset.profile;
      renderProfiles();
      renderAnalysis();
      els.blindSpotPanel.hidden = true;
      els.questionsOutput.textContent = "Cliquez sur \"Préparer mes questions\" pour générer une liste adaptée.";
    });
  });
}

function renderConnectors() {
  els.connectorList.innerHTML = futureConnectors.map(([name, description]) => `
    <div class="connector-item">
      <strong>${escapeHtml(name)}</strong>
      <span>${escapeHtml(description)}</span>
    </div>
  `).join("");
}

function handleFileSelection(event) {
  const file = event.target.files?.[0] || null;
  currentFile = file ? {
    name: file.name,
    size: file.size,
    type: file.type || inferType(file.name),
  } : null;
  renderFileSummary();
  renderAnalysis();
}

function renderFileSummary() {
  if (!currentFile) {
    els.fileSummary.innerHTML = `
      <strong>Aucun document importé</strong>
      <span>La V1 conserve uniquement les métadonnées affichées à l'écran.</span>
    `;
    return;
  }

  els.fileSummary.innerHTML = `
    <strong>${escapeHtml(currentFile.name)}</strong>
    <span>${escapeHtml(formatBytes(currentFile.size))} · ${escapeHtml(currentFile.type)}</span>
  `;
}

function renderAnalysis() {
  const profile = profileById(activeProfile);
  els.activeProfileTitle.textContent = profile.title;
  const context = analysisContext(profile);

  els.analysisResult.innerHTML = analysisBlocks.map((title) => analysisCard(title, simulatedItems(title, context))).join("");

  if (activeProfile === "agreement") {
    els.agreementPanel.hidden = false;
    els.agreementGrid.innerHTML = agreementBlocks.map((title) => analysisCard(title, simulatedAgreementItems(title, context))).join("");
  } else {
    els.agreementPanel.hidden = true;
  }
}

function renderQuestions() {
  const profile = profileById(activeProfile);
  const questions = profileContent[profile.id]?.questions || profileContent.summary.questions;
  els.questionsOutput.innerHTML = `
    <ul>
      ${questions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}
    </ul>
  `;
}

function renderBlindSpots() {
  els.blindSpotPanel.hidden = false;
  els.blindSpotPanel.innerHTML = `
    <h2>Ce qui peut avoir été oublié</h2>
    <div class="alert-grid">
      ${analysisCard("Points souvent oubliés", blindSpotItems.oftenForgotten)}
      ${analysisCard("Informations manquantes", blindSpotItems.missingInfo)}
      ${analysisCard("Risques cachés", blindSpotItems.hiddenRisks)}
      ${analysisCard("Prochaines vérifications utiles", blindSpotItems.nextChecks)}
    </div>
  `;
}

function analysisContext(profile) {
  return {
    profile,
    confidentiality: confidentialityLabel(els.confidentialitySelect.value),
    kind: documentKindLabel(els.documentKindSelect.value),
    fileName: currentFile?.name || "Document de démonstration",
    tone: profileContent[profile.id]?.tone || "lecture syndicale",
  };
}

function simulatedItems(title, context) {
  const shared = {
    "Résumé exécutif": [
      `${context.fileName} est lu en mode ${context.tone}.`,
      `Niveau déclaré : ${context.confidentiality}. Format : ${context.kind}.`,
      "Cette V1 simule l'analyse sans lire réellement le contenu du fichier.",
    ],
    "Points importants": [
      "Identifier les salariés concernés et la date d'application.",
      "Repérer les engagements écrits, les obligations et les marges d'interprétation.",
      "Distinguer faits établis, hypothèses et points à vérifier.",
    ],
    "Points de vigilance": [
      "Ne pas conclure sans comparer avec les accords existants.",
      "Vérifier si une clause crée un recul ou un flou d'application.",
      "Contrôler le niveau de diffusion avant tout partage.",
    ],
    "Questions à poser": profileContent[context.profile.id]?.questions || profileContent.summary.questions,
    "Documents manquants": [
      "Version précédente du document.",
      "Accords existants sur le même sujet.",
      "Éléments de contexte fournis en CSE ou par la direction.",
    ],
    "Risques": [
      "Risque d'interprétation trop large par l'employeur.",
      "Risque de communication prématurée si les faits ne sont pas validés.",
      "Risque de traiter un document confidentiel comme un document public.",
    ],
    "Textes à vérifier": [
      "Convention collective nationale des industries chimiques.",
      "Accords d'entreprise déjà applicables.",
      "Code du travail et éventuelles notes internes expurgées.",
    ],
    "Actions recommandées": [
      "Préparer les questions prioritaires.",
      "Comparer avec la bibliothèque documentaire.",
      "Créer une tâche de suivi et demander les pièces manquantes.",
    ],
    "Proposition de communication CFDT": [
      "Informer sans dramatiser.",
      "Séparer les faits, les questions et la position CFDT.",
      "Terminer par une action concrète ou un contact.",
    ],
  };

  return shared[title] || ["Analyse simulée à connecter à un agent IA."];
}

function simulatedAgreementItems(title) {
  const items = {
    "Ce que prévoit le projet": [
      "Un cadre d'application nouveau ou révisé.",
      "Des modalités à confirmer avec la direction.",
    ],
    "Ce qui change par rapport à l'existant": [
      "Comparer les droits actuels avec les nouvelles clauses.",
      "Identifier les usages non repris dans le projet.",
    ],
    "Salariés concernés": [
      "Services, équipes, horaires ou métiers visés.",
      "Salariés exclus ou cas particuliers.",
    ],
    "Avantages": [
      "Clarification possible des règles.",
      "Meilleur suivi si des indicateurs sont ajoutés.",
    ],
    "Risques ou reculs possibles": [
      "Perte d'un usage favorable.",
      "Clause trop large ou absence de garantie écrite.",
    ],
    "Points flous": [
      "Critères d'éligibilité.",
      "Modalités de contrôle et de révision.",
    ],
    "Questions à poser en CSE": [
      "Quels impacts mesurables pour les salariés ?",
      "Quel suivi sera transmis au CSE ?",
    ],
    "Points de négociation": [
      "Clause de revoyure.",
      "Garantie de non-régression.",
      "Indicateurs de suivi.",
    ],
    "Vérification Convention Chimie": [
      "Comparer avec les minima conventionnels.",
      "Vérifier les classifications et majorations concernées.",
    ],
    "Vérification accords existants": [
      "Contrôler les accords temps de travail, astreinte ou télétravail.",
      "Repérer les clauses incompatibles.",
    ],
    "Proposition d'article ou de tract CFDT": [
      "Titre : Projet d'accord, les points que la CFDT veut clarifier.",
      "Message : informer les salariés et préparer les questions utiles.",
    ],
  };

  return items[title] || ["Point à connecter à la bibliothèque documentaire."];
}

function analysisCard(title, items) {
  const wide = title === "Proposition de communication CFDT" || title === "Proposition d'article ou de tract CFDT";
  return `
    <article class="analysis-card${wide ? " analysis-card--wide" : ""}">
      <h3>${escapeHtml(title)}</h3>
      <ul>
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </article>
  `;
}

function profileById(id) {
  return profiles.find((profile) => profile.id === id) || profiles[0];
}

function confidentialityLabel(value) {
  const labels = {
    public: "Public",
    interne: "Interne CFDT",
    confidentiel: "Confidentiel",
  };
  return labels[value] || labels.interne;
}

function documentKindLabel(value) {
  const labels = {
    pdf: "PDF",
    word: "Word",
    image: "image",
    text: "texte",
  };
  return labels[value] || labels.pdf;
}

function inferType(name) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "PDF";
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "Word";
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "Image";
  if (lower.endsWith(".txt")) return "Texte";
  return "Format à vérifier";
}

function formatBytes(size) {
  if (!Number.isFinite(size)) return "taille inconnue";
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} Ko`;
  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("toast--visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove("toast--visible");
  }, 2400);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

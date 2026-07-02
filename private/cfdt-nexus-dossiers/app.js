const STORAGE_KEY = "cfdt-nexus-dossiers-v1";

const STATUS = {
  new: "Nouveau",
  qualifying: "À qualifier",
  active: "En cours",
  waiting: "En attente",
  escalated: "Escaladé",
  closed: "Clôturé",
};

const URGENCY = {
  normal: "Normale",
  watch: "À surveiller",
  urgent: "Urgente",
  critical: "Critique",
};

const ITEM_STATUS = {
  todo: "À faire",
  progress: "En cours",
  done: "Fait",
  blocked: "Bloqué",
  na: "Non applicable",
};

const DOC_STATUS = {
  missing: "À demander",
  requested: "Demandé",
  received: "Reçu",
  na: "Non applicable",
};

const CASE_TEMPLATES = {
  sanction: {
    label: "Sanction disciplinaire",
    questions: [
      ["date_reception", "Date de réception du courrier"],
      ["sanction_nature", "Nature exacte de la sanction"],
      ["facts", "Faits reprochés"],
      ["contest", "Le salarié conteste-t-il les faits ?"],
      ["witnesses", "Témoins ou éléments disponibles"],
    ],
    docs: [
      ["courrier_sanction", "Courrier de sanction ou avertissement"],
      ["convocation", "Convocation ou échange préalable"],
      ["preuves", "Documents, mails ou témoignages utiles"],
    ],
    checklist: [
      ["Conserver le courrier original", "document", "haute"],
      ["Identifier la date de réception", "information", "haute"],
      ["Clarifier les faits reprochés", "information", "haute"],
      ["Demander la version du salarié", "action", "haute"],
      ["Repérer les délais à surveiller", "vérification", "moyenne"],
      ["Préparer une réponse écrite si nécessaire", "action", "moyenne"],
    ],
    resources: ["Fiche sanction disciplinaire", "Modèle de réponse prudente", "Règlement intérieur"],
  },
  convocation: {
    label: "Convocation",
    questions: [
      ["date_convocation", "Date de réception de la convocation"],
      ["date_entretien", "Date et heure de l'entretien"],
      ["motif", "Motif indiqué"],
      ["assistance", "Assistance possible mentionnée ?"],
      ["urgent_risk", "Risque immédiat identifié"],
    ],
    docs: [
      ["convocation", "Convocation reçue"],
      ["courriers_rh", "Courriers ou mails RH liés"],
      ["planning", "Planning concerné si utile"],
    ],
    checklist: [
      ["Lire précisément le motif de convocation", "vérification", "haute"],
      ["Vérifier la date et le délai de préparation", "information", "haute"],
      ["Confirmer si le salarié souhaite être accompagné", "action", "haute"],
      ["Préparer les questions à poser en entretien", "action", "moyenne"],
      ["Créer une note de compte rendu après entretien", "action", "moyenne"],
    ],
    resources: ["Fiche entretien préalable", "Check-list préparation entretien", "Modèle de compte rendu"],
  },
  pay: {
    label: "Paie",
    questions: [
      ["period", "Mois ou période concernée"],
      ["amount", "Montant ou rubrique contestée"],
      ["usual_amount", "Écart avec la situation habituelle"],
      ["already_contacted", "RH ou paie déjà contactées ?"],
      ["impact", "Impact immédiat pour le salarié"],
    ],
    docs: [
      ["fiche_paie", "Fiche de paie concernée"],
      ["fiche_paie_reference", "Fiche de paie de comparaison"],
      ["contrat_accord", "Contrat, accord ou note applicable"],
    ],
    checklist: [
      ["Identifier la période exacte", "information", "haute"],
      ["Comparer avec une fiche de paie précédente", "document", "haute"],
      ["Lister les rubriques concernées", "information", "haute"],
      ["Préparer une demande écrite à la paie", "action", "moyenne"],
      ["Suivre la réponse RH", "action", "moyenne"],
    ],
    resources: ["Fiche lecture bulletin de paie", "Modèle demande d'explication paie"],
  },
  schedule: {
    label: "Horaires",
    questions: [
      ["period", "Période concernée"],
      ["team", "Équipe ou service concerné"],
      ["change", "Changement ou difficulté constatée"],
      ["notice", "Délai d'information donné au salarié"],
      ["collective", "Situation individuelle ou collective ?"],
    ],
    docs: [
      ["planning", "Planning concerné"],
      ["mail_horaires", "Mail ou note d'organisation"],
      ["accord_temps", "Accord temps de travail si disponible"],
    ],
    checklist: [
      ["Récupérer le planning initial et modifié", "document", "haute"],
      ["Identifier les salariés ou équipes concernées", "information", "haute"],
      ["Vérifier les délais d'information", "vérification", "moyenne"],
      ["Noter les impacts concrets", "information", "moyenne"],
      ["Préparer une question à poser à la direction", "action", "moyenne"],
    ],
    resources: ["Fiche horaires", "Accord temps de travail", "Question CSE type"],
  },
  leave: {
    label: "Congés",
    questions: [
      ["leave_type", "Type de congé"],
      ["period", "Dates demandées ou refusées"],
      ["request_date", "Date de demande initiale"],
      ["reason", "Motif du refus ou du litige"],
      ["impact", "Conséquence pour le salarié"],
    ],
    docs: [
      ["demande_conges", "Demande de congés"],
      ["refus_conges", "Réponse ou refus"],
      ["planning", "Planning ou compteur de congés"],
    ],
    checklist: [
      ["Identifier le type de congé", "information", "haute"],
      ["Conserver la demande et la réponse", "document", "haute"],
      ["Vérifier les dates et compteurs", "vérification", "moyenne"],
      ["Clarifier le motif du refus", "information", "moyenne"],
      ["Préparer une demande de réexamen si utile", "action", "moyenne"],
    ],
    resources: ["Fiche congés", "Modèle demande de réexamen"],
  },
  health: {
    label: "Santé / sécurité",
    questions: [
      ["risk", "Risque ou événement constaté"],
      ["date_event", "Date ou période"],
      ["location", "Lieu ou poste concerné"],
      ["immediate_danger", "Danger grave ou immédiat ?"],
      ["reported", "Signalement déjà réalisé ?"],
    ],
    docs: [
      ["signalement", "Signalement ou alerte"],
      ["photo_note", "Photo, note ou constat"],
      ["medical", "Document médical si le salarié accepte de le fournir"],
    ],
    checklist: [
      ["Identifier le risque concret", "information", "haute"],
      ["Évaluer l'urgence santé/sécurité", "vérification", "haute"],
      ["Noter le lieu, la date et les personnes exposées", "information", "haute"],
      ["Conserver les traces disponibles", "document", "moyenne"],
      ["Contacter rapidement un élu compétent si danger", "action", "haute"],
    ],
    resources: ["Fiche santé sécurité", "Droit d'alerte", "Trame de signalement"],
  },
  harassment: {
    label: "Harcèlement",
    questions: [
      ["facts", "Faits décrits par le salarié"],
      ["period", "Période et fréquence"],
      ["people", "Personnes impliquées ou témoins"],
      ["health_impact", "Impact sur la santé ou le travail"],
      ["already_reported", "Signalement déjà réalisé ?"],
    ],
    docs: [
      ["chronologie", "Chronologie écrite"],
      ["messages", "Messages, mails ou traces"],
      ["medical", "Documents médicaux uniquement si nécessaires et consentis"],
    ],
    checklist: [
      ["Écouter sans conclure trop vite", "action", "haute"],
      ["Établir une chronologie factuelle", "information", "haute"],
      ["Séparer faits, ressentis et hypothèses", "vérification", "haute"],
      ["Identifier les témoins ou traces", "information", "haute"],
      ["Orienter vers un représentant CFDT expérimenté", "action", "haute"],
      ["Évaluer la nécessité d'une aide externe", "vérification", "moyenne"],
    ],
    resources: ["Fiche harcèlement", "Trame chronologie factuelle", "Contacts utiles"],
  },
  discrimination: {
    label: "Discrimination",
    questions: [
      ["criterion", "Critère possible de discrimination"],
      ["facts", "Faits ou décisions contestées"],
      ["comparison", "Éléments de comparaison disponibles"],
      ["period", "Période concernée"],
      ["impact", "Conséquence pour le salarié"],
    ],
    docs: [
      ["preuves", "Documents ou messages utiles"],
      ["comparaison", "Éléments de comparaison"],
      ["decision", "Décision ou refus contesté"],
    ],
    checklist: [
      ["Identifier le critère possible", "information", "haute"],
      ["Décrire les faits de façon chronologique", "information", "haute"],
      ["Chercher des éléments de comparaison", "document", "haute"],
      ["Éviter toute accusation sans élément vérifiable", "vérification", "haute"],
      ["Préparer les questions avant toute escalade", "action", "moyenne"],
    ],
    resources: ["Fiche discrimination", "Trame de comparaison", "Formulations prudentes"],
  },
  rupture: {
    label: "Rupture du contrat",
    questions: [
      ["procedure", "Type de procédure ou demande"],
      ["date", "Date de notification ou d'échange"],
      ["reason", "Motif annoncé"],
      ["documents_received", "Documents déjà reçus"],
      ["deadline", "Échéance ou délai identifié"],
    ],
    docs: [
      ["courrier_rupture", "Courrier ou proposition de rupture"],
      ["contrat", "Contrat de travail"],
      ["documents_rh", "Documents RH associés"],
    ],
    checklist: [
      ["Identifier la procédure exacte", "information", "haute"],
      ["Relever les dates et délais", "information", "haute"],
      ["Conserver tous les documents RH", "document", "haute"],
      ["Ne pas signer dans la précipitation", "vérification", "haute"],
      ["Orienter vers un accompagnement spécialisé", "action", "haute"],
    ],
    resources: ["Fiche rupture du contrat", "Check-list avant signature", "Contacts d'accompagnement"],
  },
  mutual: {
    label: "Mutuelle / prévoyance",
    questions: [
      ["subject", "Sujet précis"],
      ["period", "Période concernée"],
      ["organism", "Organisme ou interlocuteur"],
      ["already_done", "Démarches déjà faites"],
      ["impact", "Impact financier ou santé"],
    ],
    docs: [
      ["courrier_organisme", "Courrier ou mail de l'organisme"],
      ["justificatif", "Justificatif ou décompte"],
      ["bulletin", "Bulletin ou document d'affiliation si utile"],
    ],
    checklist: [
      ["Identifier l'organisme concerné", "information", "haute"],
      ["Rassembler les courriers et décomptes", "document", "haute"],
      ["Lister les démarches déjà faites", "information", "moyenne"],
      ["Préparer une demande claire", "action", "moyenne"],
      ["Suivre la réponse et la date de relance", "action", "moyenne"],
    ],
    resources: ["Fiche mutuelle", "Modèle de demande de régularisation"],
  },
};

const WORKFLOW_PHASES = [
  ["open", "Ouvrir", "Créer le dossier et lancer la préqualification"],
  ["complete", "Compléter", "Documents, chronologie et checklist"],
  ["prepare", "Préparer", "Entretien puis stratégie"],
  ["close", "Clôturer", "Validation humaine et trace finale"],
];

const STRATEGY_REFERENCES = {
  sanction: {
    texts: ["Code du travail - procédure disciplinaire", "Règlement intérieur", "Convention collective si elle encadre la sanction"],
    agreements: ["Règlement intérieur de l'établissement", "Accord ou note interne sur la discipline si disponible"],
  },
  convocation: {
    texts: ["Code du travail - entretien préalable", "Règlement intérieur", "Courrier de convocation"],
    agreements: ["Règles internes d'assistance du salarié", "Accord d'entreprise si une procédure spécifique existe"],
  },
  pay: {
    texts: ["Code du travail - salaire et bulletin de paie", "Convention collective", "Contrat de travail"],
    agreements: ["Accord de rémunération", "Accord primes ou temps de travail", "Notes paie applicables"],
  },
  schedule: {
    texts: ["Code du travail - durée du travail", "Accord temps de travail", "Planning communiqué"],
    agreements: ["Accord temps de travail", "Accord équipes ou horaires", "Usage interne documenté"],
  },
  leave: {
    texts: ["Code du travail - congés payés", "Règles internes de pose des congés", "Convention collective"],
    agreements: ["Accord congés", "Accord compte épargne temps si concerné", "Note interne congés"],
  },
  health: {
    texts: ["Code du travail - santé et sécurité", "Document unique d'évaluation des risques", "Registre santé sécurité si utile"],
    agreements: ["Accord santé sécurité", "Procédure d'alerte interne", "Consignes de poste"],
  },
  harassment: {
    texts: ["Code du travail - harcèlement moral ou sexuel", "Procédure interne de signalement", "Règlement intérieur"],
    agreements: ["Accord qualité de vie au travail", "Procédure harcèlement", "Contacts référents internes"],
  },
  discrimination: {
    texts: ["Code du travail - discrimination", "Règles de preuve et éléments de comparaison", "Décision ou refus contesté"],
    agreements: ["Accord égalité professionnelle", "Accord diversité si existant", "Grille ou politique RH concernée"],
  },
  rupture: {
    texts: ["Code du travail - rupture du contrat", "Convention collective", "Courriers RH reçus"],
    agreements: ["Accord de rupture ou mobilité si concerné", "Plan ou procédure interne applicable", "Contrat de travail"],
  },
  mutual: {
    texts: ["Notice mutuelle ou prévoyance", "Garanties applicables", "Courriers de l'organisme"],
    agreements: ["Accord frais de santé", "Contrat de prévoyance", "Notice d'information remise au salarié"],
  },
};

let cases = loadCases();
let selectedCaseId = cases[0]?.id || null;
let filters = {
  search: "",
  type: "all",
  status: "all",
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  populateTypeSelects();
  bindStaticEvents();
  render();
}

function cacheElements() {
  els.metricGrid = document.querySelector("#metricGrid");
  els.caseList = document.querySelector("#caseList");
  els.caseDetail = document.querySelector("#caseDetail");
  els.assistantPanel = document.querySelector("#assistantPanel");
  els.createPanel = document.querySelector("#createPanel");
  els.createForm = document.querySelector("#createCaseForm");
  els.createType = document.querySelector("#createType");
  els.typeFilter = document.querySelector("#typeFilter");
  els.statusFilter = document.querySelector("#statusFilter");
  els.searchInput = document.querySelector("#searchInput");
  els.toast = document.querySelector("#toast");
}

function bindStaticEvents() {
  document.querySelector("#openCreatePanel").addEventListener("click", () => {
    els.createPanel.hidden = false;
    els.createForm.person.focus();
  });

  document.querySelector("#closeCreatePanel").addEventListener("click", closeCreatePanel);
  document.querySelector("#cancelCreateCase").addEventListener("click", closeCreatePanel);

  els.createForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(els.createForm);
    const newCase = createCaseFromForm(form);
    cases.unshift(newCase);
    selectedCaseId = newCase.id;
    saveCases();
    els.createForm.reset();
    closeCreatePanel();
    render();
    showToast("Dossier créé avec checklist automatique.");
  });

  els.searchInput.addEventListener("input", (event) => {
    filters.search = event.target.value.trim().toLowerCase();
    renderCaseList();
  });

  els.typeFilter.addEventListener("change", (event) => {
    filters.type = event.target.value;
    renderCaseList();
  });

  els.statusFilter.addEventListener("change", (event) => {
    filters.status = event.target.value;
    renderCaseList();
  });

  document.querySelector("#exportDataButton").addEventListener("click", exportData);
}

function closeCreatePanel() {
  els.createPanel.hidden = true;
}

function populateTypeSelects() {
  const typeOptions = Object.entries(CASE_TEMPLATES)
    .map(([value, template]) => `<option value="${value}">${escapeHtml(template.label)}</option>`)
    .join("");
  els.createType.innerHTML = typeOptions;
  els.typeFilter.innerHTML = `<option value="all">Tous</option>${typeOptions}`;
}

function createCaseFromForm(form) {
  const type = String(form.get("type"));
  const timestamp = new Date().toISOString();
  const person = String(form.get("person") || "").trim();
  const summary = String(form.get("summary") || "").trim();

  return {
    id: uid("case"),
    createdAt: timestamp,
    updatedAt: timestamp,
    person,
    contact: String(form.get("contact") || "").trim(),
    service: String(form.get("service") || "").trim(),
    origin: String(form.get("origin") || "terrain"),
    type,
    urgency: String(form.get("urgency") || "normal"),
    status: "qualifying",
    referent: String(form.get("referent") || "").trim(),
    sensitivity: String(form.get("sensitivity") || "standard"),
    consent: form.get("consent") === "on",
    summary,
    expectation: String(form.get("expectation") || "").trim(),
    answers: {},
    checklist: buildChecklist(type),
    documents: [],
    tasks: buildInitialTasks(type),
    preparations: {},
    preparationView: "",
    timeline: [
      {
        id: uid("event"),
        date: timestamp.slice(0, 10),
        kind: "Création",
        description: `Dossier ouvert : ${summary || "situation à qualifier"}`,
        visibility: "interne CFDT",
      },
    ],
    analysis: null,
  };
}

function buildChecklist(type) {
  return templateFor(type).checklist.map(([label, category, priority], index) => ({
    id: uid(`check-${index}`),
    label,
    category,
    priority,
    status: "todo",
    note: "",
  }));
}

function buildInitialTasks(type) {
  return templateFor(type).checklist
    .filter((item) => item[2] === "haute")
    .slice(0, 3)
    .map(([label], index) => ({
      id: uid(`task-${index}`),
      label,
      owner: "",
      dueDate: "",
      priority: "haute",
      status: "todo",
      source: "checklist automatique",
    }));
}

function render() {
  if (!selectedCaseId && cases.length) {
    selectedCaseId = cases[0].id;
  }
  renderMetrics();
  renderCaseList();
  renderDetail();
  renderAssistant();
  bindDynamicEvents();
  applyProgressWidths();
}

function renderMetrics() {
  const openCases = cases.filter((item) => item.status !== "closed");
  const urgentCases = cases.filter((item) => ["urgent", "critical"].includes(item.urgency));
  const waitingTasks = cases.flatMap((item) => item.tasks || []).filter((task) => task.status !== "done");
  const sensitiveCases = cases.filter((item) => ["sensitive", "very_sensitive"].includes(item.sensitivity));

  els.metricGrid.innerHTML = [
    ["Ouverts", openCases.length],
    ["Urgents", urgentCases.length],
    ["Tâches", waitingTasks.length],
    ["Sensibles", sensitiveCases.length],
  ]
    .map(([label, value]) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");
}

function renderCaseList() {
  const visibleCases = filteredCases();

  if (!visibleCases.length) {
    els.caseList.innerHTML = `
      <div class="panel panel--compact">
        <p>Aucun dossier ne correspond aux filtres.</p>
      </div>
    `;
    return;
  }

  els.caseList.innerHTML = visibleCases
    .map((item) => {
      const analysis = item.analysis || analyzeCase(item);
      const active = item.id === selectedCaseId ? " case-card--active" : "";
      return `
        <button class="case-card${active}" type="button" data-select-case="${item.id}">
          <h2>${escapeHtml(item.person || "Dossier sans nom")}</h2>
          <p>${escapeHtml(item.summary || "Situation à qualifier.")}</p>
          <div class="tag-row">
            ${badge(templateFor(item.type).label, "blue")}
            ${badge(URGENCY[item.urgency] || item.urgency, item.urgency)}
            ${badge(`${analysis.completeness}%`, "orange")}
          </div>
        </button>
      `;
    })
    .join("");
}

function renderDetail() {
  const item = selectedCase();
  if (!item) {
    els.caseDetail.innerHTML = `
      <div class="empty-state">
        <div>
          <h1>Aucun dossier sélectionné</h1>
          <p>Crée un dossier pour commencer le suivi.</p>
        </div>
      </div>
    `;
    return;
  }

  const analysis = item.analysis || analyzeCase(item);
  const template = templateFor(item.type);
  const workflow = workflowGuidance(item, analysis);

  els.caseDetail.innerHTML = `
    <div class="detail-heading">
      <div>
        <p class="eyebrow">Fiche dossier</p>
        <h1>${escapeHtml(item.person || "Dossier sans nom")}</h1>
        <p>${escapeHtml(template.label)} · mis à jour ${formatDate(item.updatedAt)}</p>
      </div>
      <div class="status-row">
        ${badge(STATUS[item.status] || item.status, item.status === "closed" ? "closed" : "blue")}
        ${badge(URGENCY[item.urgency] || item.urgency, item.urgency)}
      </div>
    </div>

    ${renderWorkflowPanel(item, analysis, workflow)}

    <section class="detail-section">
      <div class="section-title-row">
        <div>
          <h2>État du dossier</h2>
          <p>Le niveau de confiance mesure la solidité des éléments disponibles, pas l'issue du dossier.</p>
        </div>
        <button class="button button--primary" type="button" data-run-analysis>
          Que me manque-t-il ?
        </button>
      </div>
      <div class="state-grid">
        <div class="state-tile">
          <span>Complétude</span>
          <strong>${analysis.completeness}%</strong>
          <div class="progress" aria-hidden="true"><span data-progress="${analysis.completeness}"></span></div>
        </div>
        <div class="state-tile">
          <span>Confiance</span>
          <strong>${escapeHtml(analysis.confidence)}</strong>
        </div>
        <div class="state-tile">
          <span>Documents</span>
          <strong>${analysis.missingDocs.length}</strong>
        </div>
        <div class="state-tile">
          <span>Informations</span>
          <strong>${analysis.missingInfo.length}</strong>
        </div>
      </div>
    </section>

    ${renderPreparationPanel(item, analysis, template)}

    <section class="detail-section">
      <div class="section-title-row">
        <div>
          <h2>Informations principales</h2>
          <p>Champs modifiables, sauvegardés localement.</p>
        </div>
      </div>
      <form class="core-grid" id="coreFieldsForm">
        ${fieldInput("person", "Nom, prénom ou alias", item.person)}
        ${fieldInput("contact", "Contact préféré", item.contact)}
        ${fieldInput("service", "Service ou poste", item.service)}
        ${fieldInput("referent", "Référent CFDT", item.referent)}
        ${fieldSelect("type", "Type", item.type, typeOptions())}
        ${fieldSelect("status", "Statut", item.status, optionsFromMap(STATUS))}
        ${fieldSelect("urgency", "Urgence", item.urgency, optionsFromMap(URGENCY))}
        ${fieldSelect("sensitivity", "Sensibilité", item.sensitivity, [
          ["standard", "Standard"],
          ["sensitive", "Sensible"],
          ["very_sensitive", "Très sensible"],
        ])}
        ${fieldSelect("consent", "Consentement", item.consent ? "yes" : "no", [
          ["yes", "Oui"],
          ["no", "Non / à confirmer"],
        ])}
        ${fieldTextarea("summary", "Résumé factuel", item.summary, 4, "field-wide")}
        ${fieldTextarea("expectation", "Attente du salarié", item.expectation, 3, "field-wide")}
      </form>
    </section>

    <section class="detail-section">
      <div class="section-title-row">
        <div>
          <h2>Qualification ciblée</h2>
          <p>Questions liées au type de dossier.</p>
        </div>
      </div>
      <form class="qualification-grid" id="answersForm">
        ${template.questions
          .map(([key, label]) => fieldInput(key, label, item.answers?.[key] || "", "answer-input", "data-answer"))
          .join("")}
      </form>
    </section>

    <section class="detail-section">
      <div class="section-title-row">
        <div>
          <h2>Documents</h2>
          <p>Le MVP stocke les références, pas les fichiers.</p>
        </div>
      </div>
      <div class="list-stack">
        ${renderDocuments(item)}
      </div>
      <form class="mini-form detail-section" id="addDocumentForm">
        <label>
          <span>Type</span>
          <select name="type">${docTypeOptions(template)}</select>
        </label>
        <label>
          <span>Nom du document</span>
          <input name="name" required placeholder="ex. Convocation reçue le 28 juin">
        </label>
        <label>
          <span>Statut</span>
          <select name="status">${optionsFromMap(DOC_STATUS).map(optionHtml).join("")}</select>
        </label>
        <label>
          <span>Confidentialité</span>
          <select name="confidentiality">
            <option value="interne">Interne CFDT</option>
            <option value="sensible">Sensible</option>
            <option value="très sensible">Très sensible</option>
          </select>
        </label>
        <div class="form-actions field-wide">
          <button class="button button--quiet" type="submit">Ajouter le document</button>
        </div>
      </form>
    </section>

    <section class="detail-section">
      <div class="section-title-row">
        <div>
          <h2>Timeline</h2>
          <p>Chronologie factuelle du dossier.</p>
        </div>
      </div>
      <div class="list-stack">
        ${renderTimeline(item)}
      </div>
      <form class="mini-form detail-section" id="addTimelineForm">
        <label>
          <span>Date</span>
          <input name="date" type="date" required value="${today()}">
        </label>
        <label>
          <span>Type d'événement</span>
          <input name="kind" required placeholder="Échange, fait, document, action">
        </label>
        <label class="field-wide">
          <span>Description</span>
          <textarea name="description" rows="3" required placeholder="Fait ou action, rédigé sobrement"></textarea>
        </label>
        <label>
          <span>Visibilité</span>
          <select name="visibility">
            <option value="interne CFDT">Interne CFDT</option>
            <option value="partageable salarié">Partageable salarié</option>
          </select>
        </label>
        <div class="form-actions">
          <button class="button button--quiet" type="submit">Ajouter à la timeline</button>
        </div>
      </form>
    </section>

    <section class="detail-section">
      <div class="section-title-row">
        <div>
          <h2>Checklist automatique</h2>
          <p>Générée selon le type de dossier, modifiable par l'élu.</p>
        </div>
      </div>
      <div class="list-stack">
        ${renderChecklist(item)}
      </div>
      <form class="mini-form detail-section" id="addChecklistForm">
        <label>
          <span>Nouvel item</span>
          <input name="label" required placeholder="Action ou vérification à ajouter">
        </label>
        <label>
          <span>Catégorie</span>
          <select name="category">
            <option value="information">Information</option>
            <option value="document">Document</option>
            <option value="action">Action</option>
            <option value="vérification">Vérification</option>
          </select>
        </label>
        <label>
          <span>Priorité</span>
          <select name="priority">
            <option value="haute">Haute</option>
            <option value="moyenne">Moyenne</option>
            <option value="basse">Basse</option>
          </select>
        </label>
        <div class="form-actions">
          <button class="button button--quiet" type="submit">Ajouter</button>
        </div>
      </form>
    </section>

    <section class="detail-section">
      <div class="section-title-row">
        <div>
          <h2>Tâches</h2>
          <p>Actions à suivre avec responsable et échéance.</p>
        </div>
      </div>
      <div class="list-stack">
        ${renderTasks(item)}
      </div>
      <form class="mini-form detail-section" id="addTaskForm">
        <label class="field-wide">
          <span>Action</span>
          <input name="label" required placeholder="ex. Demander la convocation au salarié">
        </label>
        <label>
          <span>Responsable</span>
          <input name="owner" placeholder="Élu référent">
        </label>
        <label>
          <span>Échéance</span>
          <input name="dueDate" type="date">
        </label>
        <label>
          <span>Priorité</span>
          <select name="priority">
            <option value="haute">Haute</option>
            <option value="moyenne">Moyenne</option>
            <option value="basse">Basse</option>
          </select>
        </label>
        <div class="form-actions">
          <button class="button button--quiet" type="submit">Ajouter la tâche</button>
        </div>
      </form>
    </section>
  `;
}

function renderAssistant() {
  const item = selectedCase();
  if (!item) {
    els.assistantPanel.innerHTML = `
      <section class="assistant-card">
        <h2>Assistant de préqualification</h2>
        <p>Sélectionne ou crée un dossier.</p>
      </section>
    `;
    return;
  }

  const analysis = item.analysis || analyzeCase(item);
  const template = templateFor(item.type);
  const guidance = workflowGuidance(item, analysis);
  const missingInfo = analysis.missingInfo.slice(0, 5);
  const missingDocs = analysis.missingDocs.slice(0, 5);

  els.assistantPanel.innerHTML = `
    <section class="assistant-card">
      <h2>Prochaine action</h2>
      <p>${escapeHtml(guidance.title)}</p>
      <p>${escapeHtml(guidance.text)}</p>
      ${guidance.action ? actionButton(guidance.action) : ""}
      <div class="analysis-block">
        <h3>Niveau de confiance</h3>
        <div class="progress" aria-hidden="true"><span data-progress="${analysis.completeness}"></span></div>
        <p><strong>${escapeHtml(analysis.confidence)}</strong> · ${analysis.completeness}% de complétude</p>
      </div>
      <button class="button button--ghost" type="button" data-run-analysis>
        Actualiser l'analyse
      </button>
    </section>

    <section class="assistant-card">
      <h2>Préparation rapide</h2>
      <button class="button button--primary" type="button" data-prepare="interview">
        Préparer le prochain entretien
      </button>
      <button class="button button--ghost" type="button" data-prepare="strategy">
        Préparer la stratégie
      </button>
      <div class="analysis-block">
        <h3>État</h3>
        <p>${guidance.hasInterview ? "Entretien préparé." : "Entretien à préparer."}</p>
        <p>${guidance.hasStrategy ? "Stratégie préparée." : "Stratégie à préparer."}</p>
      </div>
    </section>

    <section class="assistant-card">
      <h2>Manques à traiter</h2>
      <div class="analysis-block">
        <h3>À demander au salarié</h3>
        ${listOrEmpty(missingInfo, "Aucune information prioritaire manquante.")}
      </div>
      <div class="analysis-block">
        <h3>Documents manquants</h3>
        ${listOrEmpty(missingDocs, "Aucun document prioritaire manquant.")}
      </div>
      <button class="button button--ghost" type="button" data-create-priority-tasks>
        Créer tâches prioritaires
      </button>
    </section>

    <section class="assistant-card">
      <h2>Préqualification</h2>
      <div class="analysis-block">
        <h3>Ce que j'ai compris</h3>
        <p>${escapeHtml(item.summary || "Situation à reformuler après échange.")}</p>
      </div>
      <div class="analysis-block">
        <h3>Points de vigilance</h3>
        ${listOrEmpty(analysis.blockers, "Aucun point bloquant détecté à ce stade.")}
      </div>
      <div class="analysis-block">
        <h3>Ressources suggérées</h3>
        ${listOrEmpty(template.resources, "Aucune ressource associée.")}
      </div>
    </section>
  `;
}

function applyProgressWidths() {
  document.querySelectorAll("[data-progress]").forEach((bar) => {
    const value = Number(bar.dataset.progress || 0);
    const bounded = Math.max(0, Math.min(100, value));
    bar.style.width = `${bounded}%`;
  });
}

function bindDynamicEvents() {
  document.querySelectorAll("[data-select-case]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCaseId = button.dataset.selectCase;
      render();
    });
  });

  document.querySelectorAll("[data-run-analysis]").forEach((button) => {
    button.addEventListener("click", () => {
      updateSelectedCase((item) => {
        item.analysis = {
          ...analyzeCase(item),
          lastRun: new Date().toISOString(),
        };
      });
      render();
      showToast("Analyse mise à jour.");
    });
  });

  document.querySelectorAll("[data-create-priority-tasks]").forEach((button) => {
    button.addEventListener("click", () => {
    const item = selectedCase();
    const analysis = item ? analyzeCase(item) : null;
    if (!item || !analysis) return;
    const labels = [...analysis.missingDocs, ...analysis.missingInfo].slice(0, 3);
    if (!labels.length) {
      showToast("Aucune tâche prioritaire à créer.");
      return;
    }
    updateSelectedCase((draft) => {
      labels.forEach((label) => {
        draft.tasks.push({
          id: uid("task"),
          label,
          owner: draft.referent || "",
          dueDate: "",
          priority: "haute",
          status: "todo",
          source: "analyse des manques",
        });
      });
    });
    render();
      showToast("Tâches prioritaires créées.");
    });
  });

  document.querySelectorAll("[data-prepare]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.prepare;
      if (!["interview", "strategy"].includes(mode)) return;
      updateSelectedCase((draft) => {
        const timestamp = new Date().toISOString();
        draft.preparations = {
          ...(draft.preparations || {}),
          [`${mode}At`]: timestamp,
        };
        draft.preparationView = mode;
        draft.analysis = {
          ...analyzeCase(draft),
          lastRun: timestamp,
        };
      });
      render();
      showToast(mode === "interview" ? "Préparation entretien affichée." : "Préparation stratégie affichée.");
    });
  });

  document.querySelectorAll("[data-close-case]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = selectedCase();
      const analysis = item ? analyzeCase(item) : null;
      if (!item || !analysis || !canCloseCase(item, analysis)) {
        showToast("Clôture impossible : il reste une action ou un point à vérifier.");
        return;
      }
      updateSelectedCase((draft) => {
        draft.status = "closed";
        draft.timeline.unshift({
          id: uid("event"),
          date: today(),
          kind: "Clôture",
          description: "Dossier clôturé après validation humaine.",
          visibility: "interne CFDT",
        });
      });
      render();
      showToast("Dossier clôturé.");
    });
  });

  document.querySelector("#coreFieldsForm")?.addEventListener("change", (event) => {
    const field = event.target.dataset.field;
    if (!field) return;
    const value = field === "consent" ? event.target.value === "yes" : event.target.value;
    if (field === "type") {
      changeCaseType(value);
      return;
    }
    updateSelectedCase((item) => {
      item[field] = value;
      item.analysis = null;
    });
    render();
  });

  document.querySelector("#answersForm")?.addEventListener("change", (event) => {
    const key = event.target.dataset.answer;
    if (!key) return;
    updateSelectedCase((item) => {
      item.answers[key] = event.target.value.trim();
      item.analysis = null;
    });
    render();
  });

  document.querySelectorAll("[data-checklist-status]").forEach((select) => {
    select.addEventListener("change", () => {
      const id = select.dataset.checklistStatus;
      updateSelectedCase((item) => {
        const target = item.checklist.find((entry) => entry.id === id);
        if (target) target.status = select.value;
        item.analysis = null;
      });
      render();
    });
  });

  document.querySelectorAll("[data-doc-status]").forEach((select) => {
    select.addEventListener("change", () => {
      const id = select.dataset.docStatus;
      updateSelectedCase((item) => {
        const target = item.documents.find((entry) => entry.id === id);
        if (target) target.status = select.value;
        item.analysis = null;
      });
      render();
    });
  });

  document.querySelectorAll("[data-task-status]").forEach((select) => {
    select.addEventListener("change", () => {
      const id = select.dataset.taskStatus;
      updateSelectedCase((item) => {
        const target = item.tasks.find((entry) => entry.id === id);
        if (target) target.status = select.value;
      });
      render();
    });
  });

  bindForm("#addChecklistForm", (form) => {
    updateSelectedCase((item) => {
      item.checklist.push({
        id: uid("check"),
        label: String(form.get("label") || "").trim(),
        category: String(form.get("category") || "action"),
        priority: String(form.get("priority") || "moyenne"),
        status: "todo",
        note: "",
      });
      item.analysis = null;
    });
    render();
  });

  bindForm("#addDocumentForm", (form) => {
    updateSelectedCase((item) => {
      item.documents.push({
        id: uid("doc"),
        type: String(form.get("type") || "other"),
        name: String(form.get("name") || "").trim(),
        status: String(form.get("status") || "missing"),
        confidentiality: String(form.get("confidentiality") || "interne"),
        date: today(),
        source: "ajout manuel",
      });
      item.analysis = null;
    });
    render();
  });

  bindForm("#addTaskForm", (form) => {
    updateSelectedCase((item) => {
      item.tasks.push({
        id: uid("task"),
        label: String(form.get("label") || "").trim(),
        owner: String(form.get("owner") || "").trim(),
        dueDate: String(form.get("dueDate") || ""),
        priority: String(form.get("priority") || "moyenne"),
        status: "todo",
        source: "ajout manuel",
      });
    });
    render();
  });

  bindForm("#addTimelineForm", (form) => {
    updateSelectedCase((item) => {
      item.timeline.unshift({
        id: uid("event"),
        date: String(form.get("date") || today()),
        kind: String(form.get("kind") || "").trim(),
        description: String(form.get("description") || "").trim(),
        visibility: String(form.get("visibility") || "interne CFDT"),
      });
      item.analysis = null;
    });
    render();
  });
}

function bindForm(selector, handler) {
  const form = document.querySelector(selector);
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    handler(new FormData(form));
  });
}

function changeCaseType(newType) {
  const item = selectedCase();
  if (!item || item.type === newType) return;

  const confirmed = window.confirm("Changer le type de dossier regénère la checklist automatique. Continuer ?");
  if (!confirmed) {
    render();
    return;
  }

  updateSelectedCase((draft) => {
    draft.type = newType;
    draft.answers = {};
    draft.checklist = buildChecklist(newType);
    draft.tasks = [...draft.tasks, ...buildInitialTasks(newType)];
    draft.analysis = null;
    draft.timeline.unshift({
      id: uid("event"),
      date: today(),
      kind: "Requalification",
      description: `Type de dossier changé : ${templateFor(newType).label}`,
      visibility: "interne CFDT",
    });
  });
  render();
}

function analyzeCase(item) {
  const template = templateFor(item.type);
  const checks = [];
  const missingInfo = [];
  const missingDocs = [];
  const blockers = [];

  addCheck(checks, Boolean(item.person), 1, missingInfo, "Nom, prénom ou alias");
  addCheck(checks, Boolean(item.summary), 2, missingInfo, "Résumé factuel de la situation");
  addCheck(checks, Boolean(item.expectation), 1, missingInfo, "Attente du salarié");
  addCheck(checks, Boolean(item.contact), 1, missingInfo, "Contact préféré");
  addCheck(checks, Boolean(item.referent), 1, missingInfo, "Référent CFDT");
  addCheck(checks, item.consent, 2, missingInfo, "Consentement à confirmer");

  template.questions.forEach(([key, label]) => {
    addCheck(checks, Boolean(item.answers?.[key]), 1, missingInfo, label);
  });

  template.docs.forEach(([type, label]) => {
    const doc = item.documents.find((entry) => entry.type === type);
    const ok = doc && ["received", "na"].includes(doc.status);
    checks.push({ ok: Boolean(ok), weight: 1.25 });
    if (!ok) missingDocs.push(label);
  });

  const hasTimeline = item.timeline.length > 1;
  checks.push({ ok: hasTimeline, weight: 1 });
  if (!hasTimeline) missingInfo.push("Chronologie avec au moins un fait ou échange daté");

  const highItems = item.checklist.filter((entry) => entry.priority === "haute");
  const highDone = highItems.filter((entry) => ["done", "na"].includes(entry.status));
  checks.push({
    ok: highItems.length ? highDone.length / highItems.length >= 0.6 : true,
    weight: 1.5,
  });

  if (!item.consent) blockers.push("Consentement à confirmer avant de conserver des informations sensibles.");
  if (["urgent", "critical"].includes(item.urgency) && !item.referent) {
    blockers.push("Dossier urgent sans référent CFDT identifié.");
  }
  if (item.sensitivity === "very_sensitive" && item.timeline.length < 2) {
    blockers.push("Dossier très sensible : chronologie factuelle insuffisante.");
  }

  const total = checks.reduce((sum, check) => sum + check.weight, 0);
  const done = checks.reduce((sum, check) => sum + (check.ok ? check.weight : 0), 0);
  const completeness = total ? Math.round((done / total) * 100) : 0;
  const confidence = confidenceLabel(completeness);
  const nextAction = nextBestAction({ missingInfo, missingDocs, blockers, item });

  return {
    completeness,
    confidence,
    missingInfo: unique(missingInfo),
    missingDocs: unique(missingDocs),
    blockers: unique(blockers),
    nextAction,
    lastRun: item.analysis?.lastRun || null,
  };
}

function addCheck(checks, ok, weight, missingTarget, missingLabel) {
  checks.push({ ok: Boolean(ok), weight });
  if (!ok && missingTarget && missingLabel) missingTarget.push(missingLabel);
}

function nextBestAction({ missingInfo, missingDocs, blockers, item }) {
  if (blockers.length) return `Avant de poursuivre : ${blockers[0]}`;
  if (missingDocs.length) return `Demander en priorité : ${missingDocs[0]}.`;
  if (missingInfo.length) return `Clarifier en priorité : ${missingInfo[0]}.`;
  const pendingTask = nextOpenTask(item);
  if (pendingTask) return `Prochaine action : ${pendingTask.label}.`;
  return "Dossier suffisamment structuré pour préparer la synthèse et la prochaine action humaine.";
}

function confidenceLabel(completeness) {
  if (completeness >= 85) return "Élevé";
  if (completeness >= 65) return "Bon";
  if (completeness >= 35) return "Moyen";
  return "Faible";
}

function workflowGuidance(item, analysis) {
  const pendingTask = nextOpenTask(item);
  const hasInterview = Boolean(item.preparations?.interviewAt);
  const hasStrategy = Boolean(item.preparations?.strategyAt);
  const canClose = canCloseCase(item, analysis);

  if (item.status === "closed") {
    return {
      phase: "close",
      title: "Dossier clôturé",
      text: "La chronologie, les documents référencés et la synthèse restent disponibles pour relecture.",
      hasInterview,
      hasStrategy,
      canClose: false,
      pendingTask,
    };
  }

  if (analysis.blockers.length) {
    return {
      phase: "complete",
      title: "Sécuriser le dossier avant d'avancer",
      text: analysis.blockers[0],
      action: { label: "Analyser le dossier", attrs: "data-run-analysis", variant: "primary" },
      hasInterview,
      hasStrategy,
      canClose,
      pendingTask,
    };
  }

  if (analysis.missingDocs.length) {
    return {
      phase: "complete",
      title: "Demander les documents prioritaires",
      text: `Commencer par : ${analysis.missingDocs[0]}.`,
      action: { label: "Créer les tâches prioritaires", attrs: "data-create-priority-tasks", variant: "ghost" },
      hasInterview,
      hasStrategy,
      canClose,
      pendingTask,
    };
  }

  if (analysis.missingInfo.length) {
    return {
      phase: "complete",
      title: "Clarifier la préqualification",
      text: `Prochaine information à obtenir : ${analysis.missingInfo[0]}.`,
      action: { label: "Préparer le prochain entretien", attrs: 'data-prepare="interview"', variant: "primary" },
      hasInterview,
      hasStrategy,
      canClose,
      pendingTask,
    };
  }

  if (!hasInterview) {
    return {
      phase: "prepare",
      title: "Préparer le prochain entretien",
      text: "Le dossier est assez structuré pour générer les questions, les documents à réclamer et les délais à surveiller.",
      action: { label: "Préparer le prochain entretien", attrs: 'data-prepare="interview"', variant: "primary" },
      hasInterview,
      hasStrategy,
      canClose,
      pendingTask,
    };
  }

  if (!hasStrategy) {
    return {
      phase: "prepare",
      title: "Préparer la stratégie",
      text: "L'entretien est préparé. Il faut maintenant organiser les arguments, les risques et les références applicables.",
      action: { label: "Préparer la stratégie", attrs: 'data-prepare="strategy"', variant: "primary" },
      hasInterview,
      hasStrategy,
      canClose,
      pendingTask,
    };
  }

  if (pendingTask) {
    return {
      phase: "close",
      title: "Faire avancer la prochaine tâche",
      text: pendingTask.dueDate ? `${pendingTask.label} avant le ${pendingTask.dueDate}.` : pendingTask.label,
      hasInterview,
      hasStrategy,
      canClose,
      pendingTask,
    };
  }

  if (canClose) {
    return {
      phase: "close",
      title: "Le dossier peut être clôturé",
      text: "Tous les points structurants sont traités. Une validation humaine reste nécessaire avant clôture.",
      action: { label: "Clôturer le dossier", attrs: "data-close-case", variant: "primary" },
      hasInterview,
      hasStrategy,
      canClose,
      pendingTask,
    };
  }

  return {
    phase: "complete",
    title: "Relire le dossier",
    text: analysis.nextAction,
    action: { label: "Analyser le dossier", attrs: "data-run-analysis", variant: "primary" },
    hasInterview,
    hasStrategy,
    canClose,
    pendingTask,
  };
}

function canCloseCase(item, analysis) {
  if (item.status === "closed") return false;
  if (analysis.blockers.length || analysis.missingDocs.length || analysis.missingInfo.length) return false;
  if (!item.preparations?.strategyAt) return false;
  return !nextOpenTask(item);
}

function nextOpenTask(item) {
  return (item.tasks || []).find((task) => !["done", "na"].includes(task.status));
}

function renderWorkflowPanel(item, analysis, guidance) {
  return `
    <section class="workflow-panel detail-section" aria-label="Workflow guidé">
      <div class="next-action-card">
        <div>
          <p class="eyebrow">Prochaine action recommandée</p>
          <h2>${escapeHtml(guidance.title)}</h2>
          <p>${escapeHtml(guidance.text)}</p>
        </div>
        ${guidance.action ? `<div class="compact-actions">${actionButton(guidance.action)}</div>` : ""}
      </div>
      <div class="workflow-steps" aria-label="Étapes du dossier">
        ${WORKFLOW_PHASES.map(([key, label, detail]) => renderWorkflowStep(key, label, detail, item, analysis, guidance)).join("")}
      </div>
    </section>
  `;
}

function renderWorkflowStep(key, label, detail, item, analysis, guidance) {
  const completed = workflowStepCompleted(key, item, analysis, guidance);
  const active = key === guidance.phase && item.status !== "closed";
  const classes = ["workflow-step"];
  if (completed) classes.push("workflow-step--done");
  if (active) classes.push("workflow-step--active");

  return `
    <article class="${classes.join(" ")}">
      <span class="workflow-step__marker" aria-hidden="true"></span>
      <div>
        <h3>${escapeHtml(label)}</h3>
        <p>${escapeHtml(detail)}</p>
      </div>
    </article>
  `;
}

function workflowStepCompleted(key, item, analysis, guidance) {
  if (key === "open") return Boolean(item.createdAt);
  if (key === "complete") return !analysis.blockers.length && !analysis.missingDocs.length && !analysis.missingInfo.length;
  if (key === "prepare") return guidance.hasInterview && guidance.hasStrategy;
  if (key === "close") return item.status === "closed";
  return false;
}

function actionButton(action) {
  return `
    <button class="button button--${escapeAttr(action.variant || "primary")}" type="button" ${action.attrs || ""}>
      ${escapeHtml(action.label)}
    </button>
  `;
}

function renderPreparationPanel(item, analysis, template) {
  const view = item.preparationView || "";
  return `
    <section class="detail-section preparation-section" id="preparationPanel">
      <div class="section-title-row">
        <div>
          <h2>Préparer l'action</h2>
          <p>Deux préparations guidées, à valider et adapter par l'élu CFDT.</p>
        </div>
        <div class="compact-actions">
          <button class="button ${view === "interview" ? "button--primary" : "button--ghost"}" type="button" data-prepare="interview">
            Préparer le prochain entretien
          </button>
          <button class="button ${view === "strategy" ? "button--primary" : "button--ghost"}" type="button" data-prepare="strategy">
            Préparer la stratégie
          </button>
        </div>
      </div>
      ${renderPreparationOutput(item, analysis, template, view)}
    </section>
  `;
}

function renderPreparationOutput(item, analysis, template, view) {
  if (view === "interview") {
    return renderPrepResult(buildInterviewPreparation(item, analysis, template));
  }
  if (view === "strategy") {
    return renderPrepResult(buildStrategyPreparation(item, analysis, template));
  }
  return `
    <div class="prep-placeholder">
      <h3>Aucune préparation affichée</h3>
      <p>Utilise le bouton recommandé ci-dessus : l'assistant affichera uniquement les éléments utiles pour la prochaine action.</p>
    </div>
  `;
}

function buildInterviewPreparation(item, analysis, template) {
  const unansweredQuestions = template.questions
    .filter(([key]) => !item.answers?.[key])
    .map(([, label]) => `Préciser : ${label}`);
  const questions = unique([
    ...unansweredQuestions.slice(0, 5),
    item.expectation ? "L'attente du salarié a-t-elle évolué depuis le premier échange ?" : "Qu'attend concrètement le salarié de la CFDT ?",
    "Quels faits peuvent être datés précisément dans la chronologie ?",
    "Y a-t-il des témoins, traces écrites ou interlocuteurs RH à identifier ?",
  ]);

  return {
    eyebrow: "Préparation entretien",
    title: "Prochain entretien",
    intro: "Objectif : repartir de l'échange avec les informations nécessaires, les bons documents et les délais visibles.",
    sections: [
      ["Informations à demander", analysis.missingInfo.slice(0, 7), "Aucune information prioritaire à demander."],
      ["Documents manquants", analysis.missingDocs.slice(0, 7), "Aucun document prioritaire manquant."],
      ["Questions à poser", questions.slice(0, 7), "Les questions prioritaires sont déjà couvertes."],
      ["Délais à surveiller", deadlineWatchlist(item).slice(0, 7), "Aucun délai précis n'est identifié : demander s'il existe une date limite."],
    ],
  };
}

function buildStrategyPreparation(item, analysis, template) {
  const references = STRATEGY_REFERENCES[item.type] || STRATEGY_REFERENCES.sanction;
  const receivedDocs = (item.documents || []).filter((doc) => doc.status === "received");
  const answeredCount = template.questions.filter(([key]) => item.answers?.[key]).length;
  const highDone = (item.checklist || []).filter((entry) => entry.priority === "haute" && ["done", "na"].includes(entry.status));

  const argumentsList = unique([
    "S'appuyer sur une chronologie courte, datée et factuelle.",
    item.expectation ? `Relier la démarche à l'attente exprimée : ${shortText(item.expectation, 110)}` : "Clarifier l'objectif recherché avant toute prise de position.",
    receivedDocs.length ? `Utiliser les documents reçus comme base : ${receivedDocs.map((doc) => doc.name).slice(0, 2).join(", ")}.` : "Ne pas affirmer un point qui dépend encore d'un document absent.",
    "Séparer les faits établis, les déclarations du salarié et les hypothèses à vérifier.",
  ]);

  const strengths = unique([
    item.summary ? "Résumé factuel déjà renseigné." : "",
    item.consent ? "Consentement confirmé." : "",
    item.timeline?.length > 1 ? "Chronologie déjà alimentée." : "",
    receivedDocs.length ? `${receivedDocs.length} document(s) reçu(s).` : "",
    answeredCount ? `${answeredCount} réponse(s) de préqualification renseignée(s).` : "",
    highDone.length ? "Plusieurs points prioritaires de checklist sont traités." : "",
  ]);

  const weaknesses = unique([
    ...analysis.blockers,
    ...analysis.missingInfo.slice(0, 4).map((item) => `Information à consolider : ${item}.`),
    ...analysis.missingDocs.slice(0, 4).map((item) => `Document à obtenir : ${item}.`),
    !item.timeline || item.timeline.length < 2 ? "Chronologie encore trop courte pour défendre une lecture solide." : "",
  ]);

  return {
    eyebrow: "Préparation stratégie",
    title: "Stratégie d'accompagnement",
    intro: "Objectif : structurer les arguments sans décider à la place de l'élu CFDT.",
    sections: [
      ["Arguments", argumentsList, "Aucun argument fiable sans informations complémentaires."],
      ["Points forts", strengths, "Aucun point fort formalisé pour l'instant."],
      ["Points faibles", weaknesses, "Aucun point faible majeur détecté à ce stade."],
      ["Textes applicables", references.texts, "Références à confirmer selon le dossier."],
      ["Accords concernés", references.agreements, "Aucun accord ciblé identifié automatiquement."],
    ],
  };
}

function deadlineWatchlist(item) {
  const taskDeadlines = (item.tasks || [])
    .filter((task) => task.dueDate && !["done", "na"].includes(task.status))
    .map((task) => `${task.label} : échéance ${task.dueDate}`);

  const typeHints = {
    sanction: ["Date de réception du courrier de sanction", "Délai utile pour contester ou répondre par écrit"],
    convocation: ["Date et heure de l'entretien", "Temps disponible pour préparer l'assistance"],
    pay: ["Mois de paie concerné", "Date de prochaine paie ou de régularisation annoncée"],
    schedule: ["Date d'application du changement d'horaires", "Délai d'information donné aux salariés"],
    leave: ["Date de demande initiale", "Date du congé demandé ou refusé"],
    health: ["Date du risque ou de l'événement", "Délai de signalement si danger immédiat"],
    harassment: ["Période et fréquence des faits déclarés", "Date d'un éventuel signalement"],
    discrimination: ["Période concernée", "Date de la décision ou du refus contesté"],
    rupture: ["Date de notification", "Délai de signature, de rétractation ou de contestation à vérifier"],
    mutual: ["Période de soins ou de cotisation", "Date limite de réponse de l'organisme"],
  };

  return unique([...taskDeadlines, ...(typeHints[item.type] || []), "Toute date limite indiquée par RH, la paie ou un organisme extérieur"]);
}

function renderPrepResult(prep) {
  return `
    <div class="prep-result">
      <div class="prep-result__heading">
        <p class="eyebrow">${escapeHtml(prep.eyebrow)}</p>
        <h3>${escapeHtml(prep.title)}</h3>
        <p>${escapeHtml(prep.intro)}</p>
      </div>
      <div class="prep-grid">
        ${prep.sections
          .map(
            ([title, items, emptyText]) => `
              <article class="prep-card">
                <h4>${escapeHtml(title)}</h4>
                ${listOrEmpty(items, emptyText)}
              </article>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function shortText(value, maxLength) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function renderChecklist(item) {
  if (!item.checklist.length) return `<p>Aucun item de checklist.</p>`;
  return item.checklist
    .map(
      (entry) => `
      <article class="list-item">
        <div>
          <h3>${escapeHtml(entry.label)}</h3>
          <p>${escapeHtml(entry.category)} · priorité ${escapeHtml(entry.priority)}</p>
        </div>
        <select data-checklist-status="${entry.id}" aria-label="Statut checklist">
          ${optionsFromMap(ITEM_STATUS).map(([value, label]) => optionHtml([value, label], entry.status)).join("")}
        </select>
      </article>
    `,
    )
    .join("");
}

function renderDocuments(item) {
  if (!item.documents.length) return `<p>Aucun document référencé.</p>`;
  return item.documents
    .map(
      (entry) => `
      <article class="list-item">
        <div>
          <h3>${escapeHtml(entry.name)}</h3>
          <p>${escapeHtml(documentLabel(item.type, entry.type))} · ${escapeHtml(entry.confidentiality)}</p>
        </div>
        <select data-doc-status="${entry.id}" aria-label="Statut document">
          ${optionsFromMap(DOC_STATUS).map(([value, label]) => optionHtml([value, label], entry.status)).join("")}
        </select>
      </article>
    `,
    )
    .join("");
}

function renderTasks(item) {
  if (!item.tasks.length) return `<p>Aucune tâche ouverte.</p>`;
  return item.tasks
    .map(
      (entry) => `
      <article class="list-item">
        <div>
          <h3>${escapeHtml(entry.label)}</h3>
          <p>${escapeHtml(entry.owner || "Responsable à préciser")} · ${entry.dueDate ? escapeHtml(entry.dueDate) : "sans échéance"} · ${escapeHtml(entry.source || "manuel")}</p>
        </div>
        <select data-task-status="${entry.id}" aria-label="Statut tâche">
          ${optionsFromMap(ITEM_STATUS).map(([value, label]) => optionHtml([value, label], entry.status)).join("")}
        </select>
      </article>
    `,
    )
    .join("");
}

function renderTimeline(item) {
  if (!item.timeline.length) return `<p>Aucun événement.</p>`;
  return item.timeline
    .slice()
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map(
      (entry) => `
      <article class="list-item timeline-item">
        <div>
          <h3>${escapeHtml(entry.date)} · ${escapeHtml(entry.kind)}</h3>
          <p>${escapeHtml(entry.description)}</p>
        </div>
        ${badge(entry.visibility, "blue")}
      </article>
    `,
    )
    .join("");
}

function selectedCase() {
  return cases.find((item) => item.id === selectedCaseId) || null;
}

function updateSelectedCase(mutator) {
  const item = selectedCase();
  if (!item) return;
  mutator(item);
  item.updatedAt = new Date().toISOString();
  saveCases();
}

function filteredCases() {
  return cases
    .filter((item) => {
      const haystack = `${item.person} ${item.summary} ${item.service} ${templateFor(item.type).label}`.toLowerCase();
      const searchOk = !filters.search || haystack.includes(filters.search);
      const typeOk = filters.type === "all" || item.type === filters.type;
      const statusOk = filters.status === "all" || item.status === filters.status;
      return searchOk && typeOk && statusOk;
    })
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

function templateFor(type) {
  return CASE_TEMPLATES[type] || CASE_TEMPLATES.sanction;
}

function typeOptions() {
  return Object.entries(CASE_TEMPLATES).map(([value, template]) => [value, template.label]);
}

function optionsFromMap(map) {
  return Object.entries(map);
}

function fieldInput(field, label, value, className = "", dataName = "data-field") {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <input class="${className}" ${dataName}="${field}" type="text" value="${escapeAttr(value || "")}">
    </label>
  `;
}

function fieldTextarea(field, label, value, rows, extraClass = "") {
  return `
    <label class="${extraClass}">
      <span>${escapeHtml(label)}</span>
      <textarea data-field="${field}" rows="${rows}">${escapeHtml(value || "")}</textarea>
    </label>
  `;
}

function fieldSelect(field, label, value, options) {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <select data-field="${field}">
        ${options.map((option) => optionHtml(option, value)).join("")}
      </select>
    </label>
  `;
}

function optionHtml([value, label], selectedValue = "") {
  const selected = String(value) === String(selectedValue) ? " selected" : "";
  return `<option value="${escapeAttr(value)}"${selected}>${escapeHtml(label)}</option>`;
}

function docTypeOptions(template) {
  const options = [
    ...template.docs,
    ["mail", "Mail ou échange"],
    ["note", "Note interne"],
    ["other", "Autre document"],
  ];
  return options.map((option) => optionHtml(option)).join("");
}

function documentLabel(caseType, docType) {
  const options = [
    ...templateFor(caseType).docs,
    ["mail", "Mail ou échange"],
    ["note", "Note interne"],
    ["other", "Autre document"],
  ];
  return options.find(([value]) => value === docType)?.[1] || docType;
}

function badge(label, variant = "") {
  const variantClass = variant ? ` badge--${variant}` : "";
  return `<span class="badge${variantClass}">${escapeHtml(label)}</span>`;
}

function listOrEmpty(items, emptyText) {
  if (!items.length) return `<p>${escapeHtml(emptyText)}</p>`;
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function loadCases() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedCases();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedCases();
  } catch {
    return seedCases();
  }
}

function saveCases() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

function seedCases() {
  const base = createSeedCase();
  return [base];
}

function createSeedCase() {
  const timestamp = new Date().toISOString();
  return {
    id: uid("case"),
    createdAt: timestamp,
    updatedAt: timestamp,
    person: "Salarié A.",
    contact: "À confirmer",
    service: "Production",
    origin: "terrain",
    type: "sanction",
    urgency: "watch",
    status: "qualifying",
    referent: "Thierry",
    sensitivity: "sensitive",
    consent: false,
    summary: "Le salarié indique avoir reçu un avertissement et souhaite comprendre les suites possibles.",
    expectation: "Être accompagné pour préparer une réponse factuelle.",
    answers: {
      sanction_nature: "Avertissement",
      contest: "Oui, partiellement",
    },
    checklist: buildChecklist("sanction"),
    documents: [
      {
        id: uid("doc"),
        type: "courrier_sanction",
        name: "Courrier d'avertissement",
        status: "requested",
        confidentiality: "sensible",
        date: today(),
        source: "démo",
      },
    ],
    tasks: buildInitialTasks("sanction"),
    preparations: {},
    preparationView: "",
    timeline: [
      {
        id: uid("event"),
        date: today(),
        kind: "Premier échange",
        description: "Le salarié signale la réception d'un avertissement et demande un accompagnement.",
        visibility: "interne CFDT",
      },
    ],
    analysis: null,
  };
}

function exportData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: "mvp-local-1",
    cases,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cfdt-nexus-dossiers-${today()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Export JSON préparé.");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("toast--visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove("toast--visible");
  }, 2600);
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
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

(function (global) {
  const VERSION = "2.2";

  const REPORT_SECTION_LABELS = [
    "Titre du dossier",
    "Question posée",
    "Résumé du problème",
    "Domaines détectés",
    "Experts mobilisés",
    "Réponse courte",
    "Analyse Juriste si concernée",
    "Analyse Paie si concernée",
    "Points établis par les sources",
    "Points à vérifier",
    "Pièces à demander",
    "Questions à poser à la direction",
    "Position de travail proposée",
    "Conclusion provisoire",
    "Niveau de confiance",
    "Limites",
    "Sources utilisées",
  ];

  const PRIORITY_SCENARIOS = [
    {
      id: "classification",
      label: "Classification",
      question: "Un salarié peut-il contester sa classification si les fonctions réellement exercées dépassent sa fiche de poste ?",
    },
    {
      id: "pay-night-sunday",
      label: "Paie",
      question: "Je pense qu’il manque des heures de nuit et une majoration dimanche sur mon bulletin. Que faut-il contrôler ?",
    },
    {
      id: "on-call-rest-pay",
      label: "Astreinte + repos + paie",
      question: "Un salarié d’astreinte intervient la nuit, son repos est interrompu et il reprend ensuite son poste. Quels sont ses droits et comment contrôler sa paie ?",
    },
    {
      id: "incomplete-bonus",
      label: "Question incomplète",
      question: "Ma prime est fausse.",
    },
  ];

  const SOURCE_BASE = [
    "Question saisie dans le cockpit local.",
    "Méthode CFDT Nexus : distinguer faits établis, hypothèses, vérifications, pièces manquantes et limites.",
    "Références à contrôler avant conclusion : Code du travail, convention collective applicable, accords d'entreprise et documents internes pertinents.",
  ];

  const TOPIC_RULES = [
    {
      id: "classification",
      title: "Classification et fonctions réellement exercées",
      keywords: ["classification", "coefficient", "niveau", "fiche de poste", "fonctions", "poste", "emploi", "missions"],
      domains: ["Classification", "Fonctions réellement exercées", "Convention collective / accords applicables"],
      experts: ["Conseiller salarié", "Juriste", "Paie"],
      summary:
        "Le salarié évoque un écart possible entre sa fiche de poste, sa classification et les fonctions réellement exercées.",
      shortAnswer:
        "Oui, une contestation peut être travaillée si les fonctions réellement exercées dépassent la classification retenue, mais il faut comparer les missions réelles avec la grille applicable et réunir des preuves concrètes.",
      legalAnalysis: [
        "Le raisonnement doit partir du travail réellement effectué, pas seulement de l'intitulé du poste.",
        "La comparaison doit être faite avec les critères de classification applicables : autonomie, technicité, responsabilités, encadrement éventuel, qualification et périmètre réel.",
        "Avant toute affirmation ferme, il faut vérifier la convention collective, les accords d'entreprise et les documents contractuels applicables.",
      ],
      payrollAnalysis: [
        "La paie devient concernée si un repositionnement de classification peut modifier le salaire minimum, une prime, un coefficient ou un rappel éventuel.",
        "Aucun rappel de salaire ne doit être chiffré sans période, classification revendiquée, minima applicables et bulletins concernés.",
      ],
      established: [
        "La question signale un possible décalage entre les fonctions exercées et la fiche de poste.",
        "Aucune grille de classification ni fiche de poste n'a été fournie dans le cockpit.",
      ],
      checks: [
        "Fonctions réellement exercées au quotidien et depuis quelle date.",
        "Niveau d'autonomie, responsabilités, technicité et éventuel encadrement.",
        "Classification actuelle, classification revendiquée et critères de la grille applicable.",
        "Écart éventuel entre salaire versé et minima applicables après vérification.",
      ],
      documents: [
        "Fiche de poste actuelle et anciennes versions si elles existent.",
        "Contrat de travail, avenants et courrier de nomination éventuel.",
        "Organigramme, délégations, objectifs, comptes rendus, mails ou preuves des missions réelles.",
        "Bulletins de paie de la période concernée et grille conventionnelle applicable.",
      ],
      directionQuestions: [
        "Quels critères justifient la classification actuellement retenue ?",
        "La direction reconnaît-elle les missions réellement exercées et depuis quelle date ?",
        "Quelle comparaison a été faite avec les autres salariés occupant des fonctions équivalentes ?",
        "Quelle procédure de réexamen de classification peut être ouverte ?",
      ],
      position:
        "Proposer un réexamen argumenté, fondé sur les fonctions réelles et les critères applicables, puis réserver tout chiffrage paie à l'obtention des bulletins et de la grille exacte.",
      conclusion:
        "Dossier potentiellement défendable, mais la conclusion dépend des preuves de missions réelles et de la grille de classification applicable.",
      confidence: "Moyen : la question est claire, mais les pièces de comparaison manquent.",
      limits: [
        "Nexus ne connaît pas la convention collective ou l'accord précis applicable au salarié.",
        "Aucun document de poste, bulletin ou preuve de mission n'a été analysé.",
        "La stratégie de contestation doit être relue par un représentant CFDT ou un conseil compétent.",
      ],
    },
    {
      id: "pay-night-sunday",
      title: "Contrôle paie : heures de nuit et dimanche",
      keywords: ["heures de nuit", "nuit", "dimanche", "majoration dimanche", "majoration", "bulletin", "paie", "salaire"],
      domains: ["Paie", "Temps de travail", "Heures de nuit", "Travail du dimanche"],
      experts: ["Conseiller salarié", "Paie", "Juriste"],
      summary:
        "Le salarié soupçonne une anomalie de bulletin sur des heures de nuit et une majoration du dimanche.",
      shortAnswer:
        "Il faut contrôler d'abord les heures réellement travaillées, puis les règles applicables aux majorations, puis les rubriques du bulletin. Aucun calcul fiable n'est possible sans planning, pointage, taux et règles applicables.",
      legalAnalysis: [
        "Le point juridique à vérifier est l'existence d'une règle applicable aux heures de nuit et au travail du dimanche : Code du travail, convention collective, accord d'entreprise ou usage.",
        "Il faut distinguer le droit à majoration, le repos éventuel et les conditions exactes d'ouverture du droit.",
      ],
      payrollAnalysis: [
        "Reconstituer le mois concerné avec planning, pointage, badgeuse ou relevé d'heures validé.",
        "Comparer les heures de nuit et de dimanche attendues avec les lignes du bulletin.",
        "Contrôler les taux, bases, libellés de rubriques et régularisations déjà passées.",
        "Ne pas inventer de montant : le calcul dépend des règles applicables et du salaire de référence.",
      ],
      established: [
        "La question mentionne deux anomalies possibles : heures de nuit et majoration du dimanche.",
        "Le bulletin et les horaires détaillés ne sont pas fournis dans le cockpit.",
      ],
      checks: [
        "Mois concerné et période exacte de travail.",
        "Nombre d'heures de nuit réellement effectuées et validées.",
        "Dimanches travaillés, heures concernées et règle de majoration applicable.",
        "Présence ou absence de régularisation sur le bulletin suivant.",
      ],
      documents: [
        "Bulletin de paie du mois concerné et du mois suivant.",
        "Planning prévisionnel, planning réalisé, pointages ou relevés d'heures.",
        "Accord temps de travail, accord paie ou note interne sur nuit/dimanche.",
        "Contrat ou avenant si les horaires particuliers y sont prévus.",
      ],
      directionQuestions: [
        "Quel décompte d'heures a servi au bulletin du mois concerné ?",
        "Quelles règles de majoration nuit et dimanche ont été appliquées ?",
        "Existe-t-il une régularisation prévue et sur quel bulletin ?",
        "Pouvez-vous fournir le détail des rubriques utilisées pour ces heures ?",
      ],
      position:
        "Demander un contrôle contradictoire simple : planning et pointage d'un côté, bulletin et règles de paie de l'autre, puis réclamer une régularisation uniquement sur les écarts établis.",
      conclusion:
        "Anomalie plausible mais non prouvée à ce stade ; le contrôle doit partir des heures validées et des règles applicables.",
      confidence: "Moyen : le domaine est identifié, mais les chiffres et règles applicables manquent.",
      limits: [
        "Nexus ne dispose pas du bulletin ni du relevé d'heures.",
        "Les taux de majoration peuvent dépendre d'un accord local ou de la convention collective.",
        "Aucun montant ne doit être annoncé avant vérification des bases.",
      ],
    },
    {
      id: "on-call-rest-pay",
      title: "Astreinte, intervention de nuit, repos et paie",
      keywords: ["astreinte", "intervient", "intervention", "repos", "reprend", "reprise", "nuit", "paie"],
      domains: ["Astreinte", "Repos", "Temps de travail", "Paie"],
      experts: ["Conseiller salarié", "Juriste", "Paie"],
      summary:
        "Le salarié décrit une intervention de nuit pendant astreinte, avec repos interrompu et reprise du poste ensuite.",
      shortAnswer:
        "Il faut séparer l'astreinte, le temps d'intervention, le repos interrompu et la paie. Le temps d'intervention doit être contrôlé comme du temps de travail, et la reprise du poste doit être vérifiée au regard des repos obligatoires et des règles applicables.",
      legalAnalysis: [
        "La période d'astreinte et le temps d'intervention ne se traitent pas de la même façon.",
        "Le temps d'intervention doit être identifié précisément : heure d'appel, déplacement éventuel, début et fin d'intervention, retour au repos.",
        "Si le repos est interrompu, il faut vérifier si les repos quotidien ou hebdomadaire ont été respectés ou si une mesure de repos/récupération doit être demandée.",
        "La conclusion dépend des règles d'astreinte, de repos et de durée du travail applicables dans l'entreprise.",
      ],
      payrollAnalysis: [
        "Contrôler l'indemnité ou compensation d'astreinte prévue.",
        "Contrôler la rémunération du temps d'intervention et les majorations éventuelles liées à la nuit, au dimanche ou au repos interrompu.",
        "Comparer planning, relevé d'appel, badgeage, ordre d'intervention et bulletin.",
        "Ne pas additionner des droits au hasard : chaque rubrique doit correspondre à une règle et à une durée établie.",
      ],
      established: [
        "La question indique une astreinte avec intervention de nuit.",
        "La question indique que le repos a été interrompu et que le salarié a repris son poste ensuite.",
        "Aucun horaire précis ni accord d'astreinte n'a été fourni dans le cockpit.",
      ],
      checks: [
        "Heure d'appel, durée d'intervention, trajet éventuel et heure de retour au repos.",
        "Heure de reprise du poste et repos réellement pris avant reprise.",
        "Règles d'astreinte, de repos et de majoration applicables.",
        "Rubriques du bulletin : astreinte, intervention, nuit, dimanche, récupération ou régularisation.",
      ],
      documents: [
        "Planning d'astreinte et planning de reprise.",
        "Relevé d'appel, ordre d'intervention, main courante ou ticket d'intervention.",
        "Pointages, relevés d'heures et bulletin de paie concerné.",
        "Accord ou note d'astreinte, accord temps de travail et règles de repos applicables.",
      ],
      directionQuestions: [
        "Quel est le régime applicable à l'astreinte dans l'entreprise ?",
        "Comment le temps d'intervention de nuit a-t-il été comptabilisé ?",
        "Quel repos a été accordé après l'intervention et avant la reprise ?",
        "Quelles rubriques de paie couvrent l'astreinte, l'intervention, la nuit et les éventuelles majorations ?",
      ],
      position:
        "Ouvrir un contrôle en deux temps : sécuriser d'abord repos et durée du travail, puis vérifier le bulletin ligne par ligne avec les horaires réels et l'accord applicable.",
      conclusion:
        "Dossier sensible car il touche à la fois au repos, à la durée du travail et à la paie ; il faut obtenir les horaires précis avant de conclure.",
      confidence: "Moyen : les enjeux sont identifiés, mais les horaires et règles internes manquent.",
      limits: [
        "Nexus ne connaît pas l'accord d'astreinte applicable.",
        "Sans horaires précis, impossible de vérifier le repos ou de chiffrer la paie.",
        "Une analyse personnalisée doit être validée par un représentant CFDT, surtout si la fatigue ou la sécurité sont en jeu.",
      ],
    },
    {
      id: "incomplete-bonus",
      title: "Prime contestée : question incomplète",
      keywords: ["prime", "fausse", "erreur", "manque", "pas bonne"],
      domains: ["Paie", "Prime", "Informations manquantes"],
      experts: ["Conseiller salarié", "Paie"],
      summary:
        "La question signale une prime supposée erronée, mais ne précise ni la prime, ni la période, ni la règle applicable.",
      shortAnswer:
        "On ne peut pas conclure avec cette seule phrase. Il faut identifier la prime concernée, la période, le montant attendu, le montant versé et la règle qui ouvre droit à cette prime.",
      legalAnalysis: [
        "Le Juriste n'est pas mobilisé au fond à ce stade : il manque la règle applicable et le contexte.",
        "Il pourra être utile si la prime dépend d'un accord, d'un usage, d'un engagement unilatéral ou d'une égalité de traitement.",
      ],
      payrollAnalysis: [
        "La priorité est de retrouver la règle de calcul de la prime et les données utilisées.",
        "Comparer le bulletin avec le justificatif de prime, l'accord applicable ou la note de calcul.",
        "Aucun montant ne doit être avancé sans connaître l'assiette, la période, le taux et les conditions d'éligibilité.",
      ],
      established: [
        "La question indique seulement que le salarié estime une prime fausse.",
        "Aucune pièce ni période n'est indiquée.",
      ],
      checks: [
        "Nom exact de la prime.",
        "Mois ou période concernée.",
        "Montant attendu, montant versé et origine de l'écart supposé.",
        "Règle applicable : contrat, accord, usage, note paie ou décision individuelle.",
      ],
      documents: [
        "Bulletin de paie concerné et bulletin précédent si utile.",
        "Accord, note interne, contrat ou courrier qui prévoit la prime.",
        "Éléments ayant servi au calcul : objectifs, présence, horaires, astreintes, production ou ancienneté selon le cas.",
      ],
      directionQuestions: [
        "Quelle règle de calcul a été appliquée pour cette prime ?",
        "Quelles données ont été retenues pour le calcul ?",
        "Y a-t-il une régularisation prévue si une erreur est confirmée ?",
      ],
      position:
        "Ne pas contester globalement ; demander d'abord le détail de calcul et cadrer la demande sur une prime, une période et un écart précis.",
      conclusion:
        "Conclusion impossible à ce stade ; la demande doit être complétée avant analyse.",
      confidence: "Faible : la question est trop courte et ne contient pas les éléments de calcul.",
      limits: [
        "Question insuffisante pour identifier la règle applicable.",
        "Aucun bulletin, accord ou détail de calcul n'a été analysé.",
        "Nexus ne peut pas chiffrer une erreur de prime sans données.",
      ],
    },
  ];

  function analyzeSalaryQuestion(rawQuestion) {
    const question = cleanQuestion(rawQuestion);
    const matches = detectTopics(question);
    const primary = matches[0] || fallbackTopic(question);
    const merged = mergeTopics(primary, matches.slice(1));

    return {
      version: VERSION,
      title: merged.title,
      question,
      summary: merged.summary,
      domains: unique(merged.domains),
      experts: unique(merged.experts),
      shortAnswer: merged.shortAnswer,
      legalAnalysis: normalizeSection(merged.legalAnalysis, "Non mobilisée à ce stade, sauf si un texte, une procédure ou une contestation formelle doit être vérifié."),
      payrollAnalysis: normalizeSection(merged.payrollAnalysis, "Non mobilisée à ce stade, sauf si un bulletin, une prime, un salaire ou une régularisation est concerné."),
      established: unique(merged.established),
      checks: unique(merged.checks),
      documents: unique(merged.documents),
      directionQuestions: unique(merged.directionQuestions),
      position: merged.position,
      conclusion: merged.conclusion,
      confidence: merged.confidence,
      limits: unique(merged.limits),
      sources: unique([...SOURCE_BASE, ...sourceHintsFor(merged)]),
      normalAnswerSections: buildNormalAnswerSections(merged),
    };
  }

  function detectTopics(question) {
    const normalized = normalize(question);
    return TOPIC_RULES.map((topic) => ({
      ...topic,
      score: topic.keywords.reduce((total, keyword) => total + (normalized.includes(normalize(keyword)) ? 1 : 0), 0),
    }))
      .filter((topic) => topic.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  function fallbackTopic(question) {
    return {
      id: "general",
      title: "Analyse salarié à cadrer",
      domains: ["Situation salarié", "Informations manquantes"],
      experts: ["Conseiller salarié"],
      summary: "La question doit être cadrée avant de produire une analyse fiable.",
      shortAnswer:
        "Nexus peut aider à structurer la demande, mais il manque des éléments pour conclure. Il faut préciser les faits, les dates, les documents disponibles et le résultat attendu.",
      legalAnalysis: ["Non mobilisée au fond tant que le thème juridique et les pièces ne sont pas identifiés."],
      payrollAnalysis: ["Non mobilisée au fond tant qu'aucun élément de paie n'est identifié."],
      established: [`Question saisie : ${question}`],
      checks: ["Faits précis, dates, personnes ou services concernés.", "Documents disponibles.", "Demande exacte du salarié."],
      documents: ["Tout document reçu de l'employeur.", "Contrat, bulletin, planning ou courrier selon le sujet."],
      directionQuestions: ["Quels faits ou documents justifient la position de l'employeur ?"],
      position: "Cadrer la situation avant toute conclusion et demander les pièces de base.",
      conclusion: "Analyse provisoire impossible sans informations complémentaires.",
      confidence: "Faible : le thème n'est pas assez identifié.",
      limits: ["La question ne permet pas d'identifier une règle applicable.", "Aucune pièce n'a été analysée."],
    };
  }

  function mergeTopics(primary, secondaryTopics) {
    const usefulSecondary = secondaryTopics.filter((topic) => topic.id !== primary.id && topic.score >= 3);
    if (!usefulSecondary.length) return primary;

    return usefulSecondary.reduce((merged, topic) => ({
      ...merged,
      domains: unique([...merged.domains, ...topic.domains]),
      experts: unique([...merged.experts, ...topic.experts]),
      legalAnalysis: unique([...toArray(merged.legalAnalysis), ...toArray(topic.legalAnalysis)]),
      payrollAnalysis: unique([...toArray(merged.payrollAnalysis), ...toArray(topic.payrollAnalysis)]),
      established: unique([...merged.established, ...topic.established]),
      checks: unique([...merged.checks, ...topic.checks]).slice(0, 8),
      documents: unique([...merged.documents, ...topic.documents]).slice(0, 8),
      directionQuestions: unique([...merged.directionQuestions, ...topic.directionQuestions]).slice(0, 6),
      limits: unique([...merged.limits, ...topic.limits]),
    }), primary);
  }

  function buildNormalAnswerSections(analysis) {
    return [
      { title: "Réponse courte", items: [analysis.shortAnswer] },
      { title: "Ce que Nexus peut affirmer", items: analysis.established.slice(0, 3) },
      { title: "Ce qui doit être vérifié", items: analysis.checks.slice(0, 5) },
      { title: "Pièces utiles", items: analysis.documents.slice(0, 5) },
      { title: "Suite proposée", items: [analysis.position] },
    ];
  }

  function reportSections(analysis) {
    return [
      { title: "Titre du dossier", items: [analysis.title] },
      { title: "Question posée", items: [analysis.question] },
      { title: "Résumé du problème", items: [analysis.summary] },
      { title: "Domaines détectés", items: analysis.domains },
      { title: "Experts mobilisés", items: analysis.experts },
      { title: "Réponse courte", items: [analysis.shortAnswer] },
      { title: "Analyse Juriste si concernée", items: analysis.legalAnalysis },
      { title: "Analyse Paie si concernée", items: analysis.payrollAnalysis },
      { title: "Points établis par les sources", items: analysis.established },
      { title: "Points à vérifier", items: analysis.checks },
      { title: "Pièces à demander", items: analysis.documents },
      { title: "Questions à poser à la direction", items: analysis.directionQuestions },
      { title: "Position de travail proposée", items: [analysis.position] },
      { title: "Conclusion provisoire", items: [analysis.conclusion] },
      { title: "Niveau de confiance", items: [analysis.confidence] },
      { title: "Limites", items: analysis.limits },
      { title: "Sources utilisées", items: analysis.sources },
    ];
  }

  function renderMarkdownReport(rawQuestion) {
    const analysis = analyzeSalaryQuestion(rawQuestion);
    return [
      `# ${analysis.title}`,
      "",
      `Version Nexus : ${VERSION}`,
      "",
      ...reportSections(analysis).flatMap((section) => renderMarkdownSection(section)),
    ].join("\n");
  }

  function renderNormalAnswer(rawQuestion) {
    const analysis = analyzeSalaryQuestion(rawQuestion);
    return [
      `# Réponse Nexus - ${analysis.title}`,
      "",
      ...analysis.normalAnswerSections.flatMap((section) => renderMarkdownSection(section)),
    ].join("\n");
  }

  function renderMarkdownSection(section) {
    const items = toArray(section.items).filter(Boolean);
    const body = items.length ? items.map((item) => `- ${item}`).join("\n") : "- Aucun élément disponible à ce stade.";
    return [`## ${section.title}`, body, ""];
  }

  function sourceHintsFor(analysis) {
    const hints = [];
    if (analysis.domains.includes("Paie")) {
      hints.push("Sources paie à demander : bulletins, pointages, plannings, règles de prime ou de majoration.");
    }
    if (analysis.domains.includes("Classification")) {
      hints.push("Sources classification à demander : fiche de poste, grille applicable, preuves de fonctions réelles.");
    }
    if (analysis.domains.includes("Astreinte")) {
      hints.push("Sources astreinte à demander : accord ou note d'astreinte, relevés d'appel, horaires d'intervention et de reprise.");
    }
    return hints;
  }

  function cleanQuestion(value) {
    const question = String(value || "").replace(/\s+/g, " ").trim();
    return question || "Question non renseignée.";
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeSection(items, fallback) {
    const normalized = toArray(items).filter(Boolean);
    return normalized.length ? normalized : [fallback];
  }

  function toArray(value) {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null) return [];
    return [value];
  }

  function unique(values) {
    const seen = new Set();
    const output = [];
    toArray(values).forEach((value) => {
      const item = String(value || "").trim();
      if (!item) return;
      const key = normalize(item);
      if (seen.has(key)) return;
      seen.add(key);
      output.push(item);
    });
    return output;
  }

  const api = {
    version: VERSION,
    priorityScenarios: PRIORITY_SCENARIOS,
    reportSectionLabels: REPORT_SECTION_LABELS,
    analyzeSalaryQuestion,
    reportSections,
    renderMarkdownReport,
    renderNormalAnswer,
  };

  global.CFDT_NEXUS_SALARY_ANALYSIS_V22 = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

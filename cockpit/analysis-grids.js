window.CFDT_NEXUS_ANALYSIS_GRIDS = {
  version: "2.1",
  defaultGridId: "enterprise-agreement-project",
  grids: [
    {
      id: "enterprise-agreement-project",
      profileId: "agreement",
      title: "Analyse d'un projet d'accord d'entreprise",
      description:
        "Grille métier pour comparer, détecter les impacts, formuler des hypothèses prudentes et préparer la négociation.",
      referenceRequirement: {
        field: "hasReferenceAgreement",
        alert: "Une comparaison complète nécessite l'accord actuellement applicable.",
      },
      steps: [
        {
          number: 1,
          title: "Comparer avec l'accord actuellement applicable",
          objective: "Identifier précisément les modifications.",
          blocks: [
            {
              title: "Nouveaux articles",
              items: [
                "Repérer les articles sans équivalent dans l'accord actuel.",
                "Identifier les nouvelles procédures, obligations ou conditions d'accès.",
                "Classer les nouveautés par thème : temps, rémunération, organisation, suivi.",
              ],
            },
            {
              title: "Articles supprimés",
              items: [
                "Lister les articles absents du projet mais présents dans l'accord actuel.",
                "Vérifier si la suppression retire une garantie ou un usage favorable.",
                "Demander si une disposition supprimée est reprise ailleurs.",
              ],
            },
            {
              title: "Articles modifiés",
              items: [
                "Comparer les formulations ligne par ligne lorsque c'est possible.",
                "Séparer les changements rédactionnels des changements de droits.",
                "Repérer les seuils, délais, montants ou périmètres modifiés.",
              ],
            },
          ],
        },
        {
          number: 2,
          title: "Détecter les pertes et gains de droits",
          objective: "Repérer les reculs possibles, les contraintes nouvelles et les gains éventuels.",
          blocks: [
            {
              title: "Pertes ou reculs à rechercher",
              items: [
                "Suppression d'un avantage.",
                "Réduction d'une prime.",
                "Augmentation du temps de travail.",
                "Diminution d'un repos.",
                "Baisse d'une majoration.",
                "Création de nouvelles obligations ou contraintes.",
              ],
            },
            {
              title: "Gains éventuels",
              items: [
                "Droit nouveau ou meilleure garantie écrite.",
                "Prime, repos, délai ou accompagnement plus favorable.",
                "Meilleur suivi CSE ou clause de revoyure plus protectrice.",
              ],
            },
          ],
        },
        {
          number: 3,
          title: "Détecter les formulations ambiguës",
          objective: "Identifier les clauses qui nécessitent une précision avant signature ou avis.",
          blocks: [
            {
              title: "Ambiguïtés à signaler",
              items: [
                "Expressions vagues.",
                "Critères non définis.",
                "Marge d'interprétation laissée à l'employeur.",
                "Renvoi à des décisions ultérieures.",
                "Formulations nécessitant des précisions.",
              ],
            },
            {
              title: "Questions de clarification à poser",
              items: [
                "Quel critère objectif déclenche l'application de la clause ?",
                "Qui décide, selon quelle procédure et avec quelle traçabilité ?",
                "Quel recours est possible en cas de désaccord ?",
              ],
            },
          ],
        },
        {
          number: 4,
          title: "Analyse stratégique",
          objective: "Formuler des hypothèses de travail sans affirmer d'intention.",
          disclaimer: "Ces éléments sont des hypothèses de travail à confirmer.",
          blocks: [
            {
              title: "Hypothèses à examiner",
              items: [
                "Pourquoi ce projet d'accord maintenant ?",
                "Quels objectifs possibles peuvent expliquer le calendrier ?",
                "Quels autres accords pourraient être impactés ?",
                "Quels sujets semblent préparés pour une future négociation ?",
              ],
            },
            {
              title: "Points de prudence",
              items: [
                "Ne jamais attribuer une intention sans élément vérifié.",
                "Distinguer les faits observables, les hypothèses et les demandes CFDT.",
                "Vérifier les impacts avec la bibliothèque documentaire privée.",
              ],
            },
          ],
        },
        {
          number: 5,
          title: "Préparer la négociation",
          objective: "Transformer l'analyse en demandes utiles et défendables.",
          blocks: [
            {
              title: "Questions à poser",
              items: [
                "Quels objectifs la direction poursuit-elle avec ce projet ?",
                "Quels salariés seront concernés ou exclus ?",
                "Quels indicateurs seront transmis au CSE après mise en œuvre ?",
              ],
            },
            {
              title: "Points à défendre",
              items: [
                "Maintien des droits existants les plus favorables.",
                "Garanties écrites, critères objectifs et suivi transparent.",
                "Clause de revoyure avec bilan partagé.",
              ],
            },
            {
              title: "Points à demander",
              items: [
                "Comparatif écrit avec l'accord actuellement applicable.",
                "Simulation d'impact par population concernée.",
                "Engagement de non-régression ou compensation explicite.",
              ],
            },
            {
              title: "Contreparties envisageables",
              items: [
                "Prime, repos, délai de prévenance ou volontariat.",
                "Phase d'expérimentation avec bilan CSE.",
                "Droit individuel de refus ou garanties renforcées pour publics sensibles.",
              ],
            },
          ],
        },
      ],
    },
  ],
  futureGridCatalog: [
    "Convocation disciplinaire",
    "Lettre de licenciement",
    "Bulletin de paie",
    "PV de CSE",
    "Rapport CSSCT",
    "Jurisprudence",
    "Note de service",
  ],
};

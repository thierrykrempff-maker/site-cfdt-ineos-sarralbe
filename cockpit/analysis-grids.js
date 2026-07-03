window.CFDT_NEXUS_ANALYSIS_GRIDS = {
  version: "2.2",
  defaultGridId: "enterprise-agreement-cse-cssct-v1",
  grids: [
    {
      id: "enterprise-agreement-cse-cssct-v1",
      profileId: "agreement",
      title: "Analyse d'un projet d'accord + action CSE/CSSCT",
      description:
        "Methode CFDT Nexus pour analyser un projet d'accord ou un document de direction, preparer les questions CSE/CSSCT et transformer l'analyse en action syndicale.",
      methodologyReference: "../methodology/analyse-projet-accord-cse-cssct.md",
      referenceRequirement: {
        field: "hasReferenceAgreement",
        alert: "Une comparaison complete necessite l'accord actuellement applicable.",
      },
      principles: [
        "L'IA assiste, l'elu decide.",
        "Ne jamais inventer une regle juridique ou une jurisprudence.",
        "Distinguer faits, hypotheses et recommandations.",
        "Presenter toute hypothese strategique comme une hypothese a verifier.",
        "Ne jamais supposer l'avis des salaries concernes.",
        "Transformer l'analyse en action concrete.",
      ],
      steps: [
        {
          number: 1,
          shortTitle: "Analyse du changement",
          title: "Comprendre pourquoi le changement est propose",
          objective: "Identifier le probleme declare, le contexte reel du projet et la raison du calendrier.",
          mainQuestions: ["Pourquoi ce changement ?", "Quel probleme concret ce projet cherche-t-il a resoudre ?"],
          followUpQuestions: [
            "Depuis quand ce probleme est-il identifie ?",
            "Sur quels indicateurs repose ce constat ?",
            "Quelles donnees objectives pouvez-vous communiquer au CSE ?",
            "Quelles autres solutions ont ete etudiees ?",
            "Pourquoi ont-elles ete ecartees ?",
            "Pourquoi ce projet est-il presente maintenant ?",
          ],
          checks: [
            "Probleme declare par la direction.",
            "Contexte economique, organisationnel ou social du projet.",
            "Objectifs annonces et elements factuels avances.",
            "Indicateurs utilises par la direction.",
            "Solutions alternatives eventuellement etudiees.",
          ],
          documents: [
            "Note de presentation du projet.",
            "Donnees CSE justifiant le besoin.",
            "Planning de mise en oeuvre envisage.",
            "Comparatif des solutions etudiees.",
          ],
          alerts: [
            "Une justification vague ne suffit pas pour apprecier l'utilite sociale du projet.",
            "Le calendrier peut etre un indice, mais toute intention doit rester une hypothese a verifier.",
          ],
          expectedOutput: "Liste des motifs affiches, des zones floues et des questions de relance prioritaires.",
        },
        {
          number: 2,
          shortTitle: "Conformite juridique",
          title: "Verifier la conformite juridique",
          objective: "Identifier les regles a verifier sans conclure trop vite conforme ou non conforme.",
          mainQuestions: [
            "Quelles regles s'appliquent au sujet traite ?",
            "Quels points doivent etre verifies avant tout avis ou signature ?",
          ],
          followUpQuestions: [
            "Quels accords d'entreprise existants sont impactes ?",
            "La Convention collective nationale des industries chimiques contient-elle une regle plus favorable ?",
            "Quelles obligations d'information-consultation CSE sont declenchees ?",
            "Des regles sante, securite ou conditions de travail imposent-elles une consultation CSSCT ?",
            "Quels delais ou procedures doivent etre surveilles ?",
          ],
          checks: [
            "Accords d'entreprise applicables.",
            "Convention collective applicable.",
            "Code du travail.",
            "Obligations d'information et de consultation du CSE.",
            "Regles sante, securite et conditions de travail.",
            "Reglement interieur si pertinent.",
            "Jurisprudence recente et pertinente, a verifier sans invention.",
          ],
          documents: [
            "Accord actuellement applicable.",
            "Projet d'accord complet.",
            "Tableau comparatif fourni par la direction.",
            "Textes de reference cites par la direction.",
            "Calendrier de consultation ou de negociation.",
          ],
          alerts: [
            "Ne jamais inventer une regle juridique.",
            "Ne jamais inventer une jurisprudence.",
            "Distinguer conforme en apparence, point a verifier et risque juridique identifie.",
          ],
          expectedOutput:
            "Qualification prudente : conforme en apparence, point a verifier, risque identifie, information manquante, interpretation possible, procedure obligatoire ou delai a surveiller.",
        },
        {
          number: 3,
          shortTitle: "Equilibre entreprise / salaries",
          title: "Analyser a qui profite le changement",
          objective: "Comparer les benefices possibles pour l'entreprise, les gains eventuels pour les salaries et les contraintes transferees.",
          mainQuestions: [
            "A qui profite reellement ce changement ?",
            "La mesure est-elle socialement equilibree, meme si elle semble juridiquement possible ?",
          ],
          followUpQuestions: [
            "Quels gains concrets sont attendus pour l'entreprise ?",
            "Quels gains concrets sont garantis pour les salaries ?",
            "Qui supporte la charge supplementaire ou la flexibilite ?",
            "Quels salaries supportent le plus de contraintes ?",
            "Quelles compensations sont prevues ?",
          ],
          checks: [
            "Flexibilite, productivite, couts, simplification ou disponibilite accrue pour l'entreprise.",
            "Remuneration, repos, previsibilite, securite ou garanties supplementaires pour les salaries.",
            "Transfert de responsabilites ou de contraintes.",
            "Impact differencie selon les metiers, equipes, horaires ou populations exposees.",
          ],
          documents: [
            "Evaluation des impacts par population concernee.",
            "Simulation des gains ou economies attendus.",
            "Liste des compensations proposees.",
            "Elements de comparaison avec la situation actuelle.",
          ],
          alerts: [
            "Une mesure legale n'est pas automatiquement socialement equilibree.",
            "Les gains annonces pour les salaries doivent etre ecrits, mesurables et verifiables.",
          ],
          expectedOutput: "Balance entreprise/salaries avec benefices, contraintes, compensations et points a defendre.",
        },
        {
          number: 4,
          shortTitle: "Impacts concrets",
          title: "Analyser les consequences concretes pour les salaries",
          objective: "Transformer chaque risque identifie en question exploitable CSE ou CSSCT.",
          mainQuestions: [
            "Quelles consequences concretes ce projet peut-il avoir pour les salaries ?",
            "Quels risques doivent etre suivis apres mise en oeuvre ?",
          ],
          followUpQuestions: [
            "Quelle evaluation de l'impact sur la charge de travail a ete realisee ?",
            "Sur quelles donnees cette evaluation repose-t-elle ?",
            "Quels metiers, postes et equipes ont ete etudies ?",
            "Quels risques supplementaires ont ete identifies ?",
            "Quelles mesures de prevention sont prevues ?",
            "Quels indicateurs permettront au CSE de mesurer les effets reels apres 3 mois et 6 mois ?",
          ],
          checks: [
            "Charge de travail, horaires, temps de travail, repos et pauses.",
            "Effectifs, organisation des equipes et fatigue.",
            "Sante, securite, risques professionnels et RPS.",
            "Remuneration, primes, majorations, astreintes et conges.",
            "Organisation familiale, egalite de traitement et categories exposees.",
            "Consequences a court terme, moyen terme et indirectes.",
          ],
          documents: [
            "Evaluation des risques.",
            "Donnees d'absenteisme, accidentologie ou charge si communicables au CSE.",
            "Elements DUERP pertinents, sans exposer de donnees confidentielles dans le depot.",
            "Plan d'action prevention.",
            "Indicateurs de suivi proposes.",
          ],
          alerts: [
            "Les impacts CSSCT ne doivent pas etre traites comme un simple sujet organisationnel.",
            "Les consequences indirectes doivent etre discutees avant mise en oeuvre.",
          ],
          expectedOutput: "Liste des risques concrets et questions associees pour CSE/CSSCT.",
        },
        {
          number: 5,
          shortTitle: "Jurisprudence et argumentation",
          title: "Rechercher la jurisprudence utile et construire l'argumentation",
          objective: "Preparer une recherche jurisprudentielle ciblee sans inventer de decision.",
          mainQuestions: [
            "Existe-t-il une jurisprudence pertinente a rechercher ?",
            "Comment construire un argument sans extrapoler abusivement ?",
          ],
          followUpQuestions: [
            "Quels mots-cles juridiques de recherche sont les plus pertinents ?",
            "Quels faits du projet doivent etre compares aux decisions trouvees ?",
            "Quelles differences limitent l'utilisation d'une decision ?",
            "Quel argument concret cette decision pourrait-elle soutenir ?",
          ],
          checks: [
            "Juridiction, date et numero de decision.",
            "Faits de l'affaire.",
            "Question juridique et solution retenue.",
            "Proximite avec le cas analyse.",
            "Differences avec le cas analyse.",
            "Utilite pour l'argumentation et limites d'utilisation.",
          ],
          documents: [
            "References jurisprudentielles verifiees.",
            "Extraits ou fiches publiques expurgees.",
            "Texte juridique ou conventionnel lie au sujet.",
          ],
          alerts: [
            "Ne jamais utiliser une jurisprudence uniquement parce que son titre contient des mots similaires.",
            "Ne jamais inventer une decision, un numero ou une solution.",
          ],
          expectedOutput:
            "Rubriques : jurisprudences potentiellement pertinentes, utilite, differences, argument possible, limites et points a verifier.",
        },
        {
          number: 6,
          shortTitle: "Resume salaries",
          title: "Preparer un resume pour les salaries concernes",
          objective: "Transformer l'analyse technique en information claire, factuelle et accessible.",
          mainQuestions: [
            "Que doivent comprendre les salaries avant de donner un avis ?",
            "Quels points restent flous et doivent etre expliques sans dramatiser ?",
          ],
          followUpQuestions: [
            "Quelle est la situation actuelle ?",
            "Que propose la direction ?",
            "Qu'est-ce qui changerait concretement ?",
            "Quels salaries sont concernes ?",
            "Quels avantages et risques peuvent etre expliques simplement ?",
            "Quelles questions la CFDT pose-t-elle ?",
          ],
          checks: [
            "Situation actuelle.",
            "Projet de la direction.",
            "Changements concrets.",
            "Salaries concernes.",
            "Avantages eventuels, risques et consequences possibles.",
            "Points encore flous et questions CFDT.",
          ],
          documents: [
            "Synthese interne CFDT.",
            "Projet de message salaries.",
            "Elements factuels publiables et expurges.",
          ],
          alerts: [
            "Le ton doit rester clair, factuel, accessible et non alarmiste.",
            "Ne pas publier de donnees confidentielles ou nominatives.",
          ],
          expectedOutput: "Resume salarie pret a relire avant diffusion.",
        },
        {
          number: 7,
          shortTitle: "Consultation salaries",
          title: "Recueillir l'avis des salaries",
          objective: "Preparer une consultation sans supposer l'avis des salaries concernes.",
          mainQuestions: [
            "Quels salaries faut-il consulter en priorite ?",
            "Quelles questions permettront de connaitre leur avis reel ?",
          ],
          followUpQuestions: [
            "Quels points doivent etre discutes en reunion ?",
            "Quelles questions ouvertes poser ?",
            "Quel sondage court pourrait etre propose ?",
            "Quelles categories de salaries peuvent etre particulierement exposees ?",
          ],
          checks: [
            "Questionnaire court.",
            "Sondage ou tour de table.",
            "Questions ouvertes.",
            "Points a discuter en reunion.",
            "Categories a consulter en priorite.",
          ],
          documents: [
            "Trame de consultation.",
            "Liste des populations concernees.",
            "Compte rendu expurge des retours salaries.",
          ],
          alerts: [
            "Distinguer analyse technique, position CFDT et avis reel des salaries.",
            "Ne jamais supposer l'avis des salaries.",
          ],
          expectedOutput: "Plan de consultation et questions a poser aux salaries.",
        },
        {
          number: 8,
          shortTitle: "Alternative CFDT",
          title: "Construire une alternative plus favorable",
          objective: "Proposer une solution qui repond au probleme initial tout en protegeant mieux les salaries.",
          mainQuestions: [
            "Quelle alternative CFDT peut repondre au probleme sans degrader les droits ou conditions de travail ?",
            "Quelles contreparties et garanties demander ?",
          ],
          followUpQuestions: [
            "Quel probleme initial la direction cherche-t-elle a resoudre ?",
            "Quelles contraintes reelles de l'entreprise doivent etre prises en compte ?",
            "Quelles consequences negatives faut-il corriger ?",
            "Quelles priorites les salaries expriment-ils ?",
            "Quelle solution alternative est juridiquement faisable ?",
            "Quels arguments et reponses aux objections preparer ?",
          ],
          checks: [
            "Probleme initial.",
            "Contraintes reelles de l'entreprise.",
            "Consequences negatives de la solution proposee.",
            "Priorites exprimees par les salaries.",
            "Solution alternative.",
            "Faisabilite juridique.",
            "Avantages salaries et avantages possibles entreprise.",
            "Arguments de negociation et objections previsibles.",
          ],
          documents: [
            "Proposition alternative CFDT.",
            "Tableau comparatif projet direction / alternative CFDT.",
            "Liste des contreparties envisageables.",
            "Questions finales de negociation.",
          ],
          alerts: [
            "Ne pas seulement dire non : formuler une solution defendable.",
            "Toute alternative doit rester reliee au probleme initial et aux retours salaries.",
          ],
          expectedOutput: "Alternative CFDT argumentee, contreparties, garanties et prochaines actions.",
        },
      ],
      questionOutputs: {
        cse: [
          {
            question:
              "Quel probleme concret ce projet cherche-t-il a resoudre et depuis quand ce probleme est-il identifie ?",
            sourceHint: "A relier au preambule ou a la note de presentation du projet.",
          },
          {
            question:
              "Quelles donnees economiques, organisationnelles ou sociales justifient le calendrier propose ?",
            sourceHint: "A relier aux indicateurs ou annexes fournis par la direction.",
          },
          {
            question:
              "Quels effectifs, services, equipes et categories de salaries sont concernes directement ou indirectement ?",
            sourceHint: "A relier au champ d'application du projet.",
          },
          {
            question:
              "Quelles alternatives ont ete etudiees avant ce projet et pour quelles raisons ont-elles ete ecartees ?",
            sourceHint: "A relier aux documents preparatoires ou au dossier CSE.",
          },
          {
            question:
              "Quels indicateurs de suivi seront transmis au CSE apres 3 mois et 6 mois pour mesurer les effets reels ?",
            sourceHint: "A relier aux clauses de suivi, de bilan ou de revoyure.",
          },
          {
            question:
              "Quels engagements ecrits la direction accepte-t-elle de prendre pour eviter une regression sociale ?",
            sourceHint: "A relier aux garanties, compensations ou clauses finales.",
          },
        ],
        cssct: [
          {
            question:
              "Quelle evaluation des risques a ete realisee sur la charge de travail, la fatigue, les horaires et les repos ?",
            sourceHint: "A relier aux articles modifiant l'organisation du travail.",
          },
          {
            question:
              "Quels postes, metiers, equipes ou populations particulierement exposees ont ete etudies avant presentation du projet ?",
            sourceHint: "A relier au perimetre operationnel du projet.",
          },
          {
            question:
              "Quelles consequences potentielles sur la sante, la securite et les RPS ont ete identifiees ?",
            sourceHint: "A relier aux analyses de risques et elements DUERP pertinents.",
          },
          {
            question:
              "Quelles mesures de prevention, d'accompagnement et de retour d'experience sont prevues ?",
            sourceHint: "A relier au plan d'action prevention.",
          },
          {
            question:
              "Le DUERP devra-t-il etre actualise et selon quel calendrier la CSSCT sera-t-elle associee au suivi ?",
            sourceHint: "A relier aux obligations sante securite et au calendrier de mise en oeuvre.",
          },
          {
            question:
              "Quels indicateurs permettront de suivre fatigue, absenteisme, accidents, alertes et charge reelle apres mise en place ?",
            sourceHint: "A relier aux engagements de suivi CSSCT.",
          },
        ],
      },
      finalSynthesis: [
        {
          title: "Principaux changements",
          items: [
            "Comparer le projet avec l'existant article par article lorsque l'accord applicable est disponible.",
            "Distinguer changement redactionnel, changement d'organisation et changement de droits.",
          ],
        },
        {
          title: "Principaux risques",
          items: [
            "Recul discret de garanties existantes.",
            "Transfert de flexibilite ou de charge vers les salaries.",
            "Impact sante, securite ou fatigue insuffisamment documente.",
          ],
        },
        {
          title: "Points juridiquement sensibles",
          items: [
            "Accords d'entreprise deja applicables.",
            "Convention collective nationale des industries chimiques.",
            "Obligations d'information-consultation CSE et implications CSSCT.",
          ],
        },
        {
          title: "Informations manquantes",
          items: [
            "Motif concret et indicateurs fournis par la direction.",
            "Comparatif avec l'accord actuellement applicable.",
            "Evaluation des impacts par population concernee.",
          ],
        },
        {
          title: "Questions prioritaires",
          items: [
            "Pourquoi ce changement maintenant ?",
            "Qui supporte les contraintes nouvelles ?",
            "Quelles compensations et garanties ecrites sont proposees ?",
          ],
        },
        {
          title: "Documents a demander",
          items: [
            "Projet complet et version comparee.",
            "Accord actuellement applicable.",
            "Dossier CSE, indicateurs, evaluation des risques et plan de prevention.",
          ],
        },
        {
          title: "Arguments disponibles",
          items: [
            "Une mesure juridiquement possible peut rester socialement desequilibree.",
            "Les impacts reels doivent etre documentes avant avis ou signature.",
            "L'avis des salaries concernes doit etre recueilli.",
          ],
        },
        {
          title: "Avis des salaries a recueillir",
          items: [
            "Acceptabilite du changement.",
            "Contraintes concretes vecues par metier ou equipe.",
            "Priorites de protection et compensations attendues.",
          ],
        },
        {
          title: "Alternatives a travailler",
          items: [
            "Phase test encadree.",
            "Delai de prevenance plus protecteur.",
            "Compensations ecrites et suivi CSE/CSSCT.",
          ],
        },
        {
          title: "Prochaines actions recommandees",
          items: [
            "Demander les documents manquants.",
            "Preparer les questions CSE et CSSCT.",
            "Organiser la consultation des salaries concernes.",
            "Construire une alternative CFDT argumentee.",
          ],
        },
      ],
      demoScenario: {
        title: "Projet fictif de modification de l'organisation du travail en equipes postees",
        notice: "Scenario de demonstration sans document INEOS reel, sans BDESE et sans donnee personnelle.",
        points: [
          "La direction propose de modifier les horaires d'equipes pour mieux absorber les variations de production.",
          "Le delai de prevenance passerait fictivement de 7 jours a 3 jours.",
          "Certaines equipes auraient davantage de flexibilite imposee.",
          "Le DIC doit demander les indicateurs justifiant le besoin, comparer avec l'existant, verifier les impacts sur repos et fatigue, produire des questions CSE/CSSCT, preparer une consultation et proposer une alternative.",
          "Alternative fictive : phase test de 3 mois, maintien d'un delai de prevenance protecteur, volontariat prioritaire, compensation ecrite et bilan CSE/CSSCT.",
        ],
      },
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

# CFDT Nexus - Document Intelligence Center V2.2

Version Accord + CSE/CSSCT V1.

## Objectif

Créer le module central d'analyse documentaire du Cockpit CFDT Nexus.

Nom affiché dans l'interface : Analyse documentaire.

Le DIC doit reproduire une méthode de raisonnement syndical, pas seulement produire un résumé.

Le module central de CFDT Nexus est le Document Intelligence Center.

## Priorité V1

1. Analyse documentaire intelligente.
2. Génération de questions CSE / CSSCT.
3. Préparation des actions syndicales à partir des documents.

## Fonctionnalités V1

- import visuel de document : PDF, Word, image, texte ;
- rappel OCR futur ;
- choix du niveau de diffusion : Public, Interne CFDT, Confidentiel ;
- cartes de profils d'analyse ;
- résultat d'analyse simulé ;
- grille spécifique Projet d'accord ;
- bouton "Préparer mes questions" ;
- bouton "Qu'est-ce que je n'ai pas vu ?" ;
- architecture JS prête pour les futurs agents IA ;
- moteur extensible de grilles d'analyse métier ;
- parcours visuel de 8 étapes pour les projets d'accord ;
- sorties distinctes Questions CSE et Questions CSSCT ;
- synthèse finale pour l'élu ;
- scénario fictif de démonstration sans document confidentiel ;
- page Paramètres pour suivre la bibliothèque documentaire privée et lancer une réindexation simulée.

Le module est relié au menu des modules privés Dossiers et Bibliothèque.

## Moteur de grilles

Les grilles d'analyse sont déclarées dans `analysis-grids.js`.

Le cœur du DIC (`app.js`) lit cette structure et affiche les étapes, objectifs, alertes, blocs de méthode et grilles futures.

Pour ajouter une nouvelle grille, ajouter une entrée dans `window.CFDT_NEXUS_ANALYSIS_GRIDS.grids`.

Grille disponible :

- Analyse d'un projet d'accord + action CSE/CSSCT.

Référentiel méthodologique :

- `../methodology/analyse-projet-accord-cse-cssct.md`

Structure attendue pour une grille :

- titre ;
- objectif ;
- questions principales ;
- questions de relance ;
- éléments à vérifier ;
- documents à demander ;
- alertes ;
- sortie attendue ;
- sorties CSE / CSSCT ;
- synthèse pour l'élu ;
- scénario fictif de démonstration si nécessaire.

Grilles prévues :

- Convocation disciplinaire ;
- Lettre de licenciement ;
- Bulletin de paie ;
- PV de CSE ;
- Rapport CSSCT ;
- Jurisprudence ;
- Note de service.

## Profils préparés

- Résumé intelligent ;
- Projet d'accord ;
- CSE ;
- Défenseur syndical ;
- CSSCT ;
- Paie ;
- Communication CFDT ;
- Qu'est-ce que je n'ai pas vu ?

## Connecteurs futurs

- Routeur Intelligent ;
- Agent Défenseur Syndical ;
- Agent Paie ;
- Agent CSSCT ;
- Agent Convention Chimie ;
- Bibliothèque documentaire ;
- n8n ;
- GPT CFDT Nexus.

## Confidentialité

La V1 ne lit pas réellement le contenu des fichiers.

Ne pas importer de document confidentiel sans vérifier son niveau de diffusion.

Les règles documentaires sont décrites dans `../knowledge/SECURITY_POLICY.md`.

# Référentiel méthodologique CFDT Nexus

Ce dossier constitue le référentiel méthodologique du projet CFDT Nexus.

Il ne contient pas de code. Il décrit les méthodes de raisonnement, les grilles d'analyse et les formats de restitution qui doivent guider les futurs développements du Document Intelligence Center.

## Rôle du dossier

Le dossier `methodology/` sert de base commune pour :

- structurer les analyses documentaires ;
- éviter les réponses improvisées ou purement résumées ;
- distinguer les faits, les hypothèses, les points à vérifier et les recommandations ;
- guider les futurs profils d'analyse du Document Intelligence Center ;
- préparer l'alimentation future des agents IA sans développer d'IA dans ce dossier.

Le moteur d'analyse documentaire devra s'appuyer sur ces méthodes avant de produire une synthèse, une checklist, des questions ou une stratégie.

## Règles méthodologiques communes

Chaque méthode doit préciser :

- l'objectif de l'analyse ;
- le périmètre du document concerné ;
- les informations d'entrée nécessaires ;
- les questions à se poser ;
- les points de vigilance ;
- les livrables attendus ;
- les limites de l'analyse ;
- les validations humaines obligatoires.

Les méthodes doivent toujours respecter les principes CFDT Nexus :

- l'humain décide toujours ;
- les faits sont séparés des hypothèses ;
- chaque réponse doit déboucher sur une action ;
- la confidentialité prime sur l'exhaustivité ;
- l'analyse sert l'accompagnement, pas la surveillance.

## Architecture prévue

| Document | Statut | Usage prévu |
| --- | --- | --- |
| `analyse-projet-accord.md` | Créé | Référence pour analyser un projet d'accord ou d'avenant |
| `analyse-projet-accord-cse-cssct.md` | Créé | Méthode Accord + préparation des questions CSE/CSSCT et actions syndicales |
| `analyse-convocation.md` | À créer | Analyse des convocations, entretiens et délais |
| `analyse-pv-cse.md` | À créer | Lecture structurée des PV CSE |
| `analyse-paie.md` | À créer | Analyse des éléments de paie et anomalies possibles |
| `analyse-cssct.md` | À créer | Analyse santé, sécurité et conditions de travail |
| `analyse-licenciement.md` | À créer | Analyse des procédures disciplinaires ou de licenciement |
| `analyse-jurisprudence.md` | À créer | Lecture utile d'une décision ou tendance jurisprudentielle |

## Format attendu pour une méthode

Chaque futur fichier méthodologique devra suivre une structure stable :

1. Objectif.
2. Quand utiliser cette méthode.
3. Informations nécessaires.
4. Étapes d'analyse.
5. Grille de lecture.
6. Questions à poser.
7. Documents ou références à vérifier.
8. Livrables attendus.
9. Limites et validation humaine.

Cette structure permet d'ajouter progressivement de nouvelles méthodes sans complexifier le Cockpit.

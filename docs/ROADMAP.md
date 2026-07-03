# Roadmap - CFDT Nexus

Version : 1.1

## Vision V1

Le module central de CFDT Nexus est le Document Intelligence Center.

La V1 n'est plus centree sur la seule gestion de dossiers. Elle est recentree sur la capacite d'un elu CFDT a lire un document, comprendre ses impacts, preparer ses questions et transformer l'analyse en action syndicale concrete.

## Nouvelle priorite V1

1. Analyse documentaire intelligente.
2. Generation de questions CSE / CSSCT.
3. Preparation des actions syndicales a partir des documents.

Critere de reussite V1 :

Un representant CFDT importe ou selectionne un document, choisit une grille d'analyse, obtient les points de vigilance, prepare ses questions CSE/CSSCT et repart avec une liste d'actions syndicales utiles.

## Phase V1.0 - Document Intelligence Center

Objectif : faire du DIC le coeur operationnel de CFDT Nexus.

Livrables :

- zone d'import visuelle PDF, Word, image et texte ;
- profils d'analyse metier ;
- analyse structuree simulee ;
- bouton "Preparer mes questions" ;
- bouton "Qu'est-ce que je n'ai pas vu ?" ;
- rappel de confidentialite ;
- structure prete pour le Routeur Intelligent, GPT CFDT Nexus et n8n.

## Phase V1.1 - Moteur de grilles d'analyse

Objectif : reproduire le raisonnement d'un representant du personnel experimente.

Livrables :

- moteur de grilles independantes ;
- premiere grille : analyse d'un projet d'accord d'entreprise ;
- comparaison avec l'accord actuellement applicable ;
- detection des pertes et gains de droits ;
- detection des formulations ambigues ;
- analyse strategique prudente sous forme d'hypotheses ;
- preparation de la negociation ;
- catalogue des futures grilles : convocation disciplinaire, lettre de licenciement, bulletin de paie, PV CSE, rapport CSSCT, jurisprudence, note de service.

## Phase V1.2 - Questions CSE / CSSCT

Objectif : transformer l'analyse documentaire en questions exploitables en instance.

Chantiers :

- generer des questions CSE selon le type de document ;
- generer des questions CSSCT lorsque le document touche a la sante, la securite ou les conditions de travail ;
- classer les questions par urgence, theme et niveau de preuve ;
- distinguer les questions a poser a la direction, aux salaries et aux experts ;
- preparer une version courte utilisable en reunion.

## Phase V1.3 - Preparation des actions syndicales

Objectif : passer du constat a l'action.

Chantiers :

- proposer les actions possibles : demande d'information, alerte, tract, article, question CSE, saisine CSSCT, suivi individuel ;
- associer chaque action a un niveau de prudence ;
- relier les actions aux documents sources ;
- creer des taches de suivi ;
- preparer l'export futur vers n8n.

## Modules de support

### Bibliotheque documentaire intelligente

Role : fournir les references publiques ou internes expurgees utiles au DIC.

Fonctions :

- categories documentaires ;
- recherche instantanee ;
- filtres par categorie et confidentialite ;
- fiche detaillee ;
- ajout de document pret pour backend ;
- export JSON ;
- preparation recherche semantique, OCR, PDF, Word et indexation.

### Dossiers d'accompagnement

Role : garder une trace des situations et des suites a donner apres analyse.

Fonctions :

- creation rapide ;
- fiche dossier ;
- checklist automatique ;
- bouton "Que me manque-t-il ?" ;
- chronologie ;
- taches ;
- stockage local de demonstration.

## Phase 2 - Donnees et securite

Objectif : rendre le module utilisable avec de vrais dossiers et de vrais documents.

Chantiers :

- authentification ;
- roles et droits ;
- base de donnees ;
- stockage securise des documents ;
- journal d'audit ;
- export PDF ;
- politique de conservation ;
- anonymisation.

## Phase 3 - Assistant IA

Objectif : assister sans decider.

Chantiers :

- assistance de lecture documentaire ;
- questions prioritaires ;
- synthese prudente ;
- detection des informations manquantes ;
- preparation d'actions avec validation humaine.

## Phase 4 - Automatisations n8n

Objectif : reduire les oublis et les taches repetitives.

Chantiers :

- relances ;
- notifications ;
- suivi des echeances ;
- generation de syntheses ;
- archivage ;
- anonymisation programmee.

## Phase 5 - Production

Objectif : deployer CFDT Nexus dans un environnement fiable.

Chantiers :

- hebergement securise ;
- sauvegardes ;
- supervision ;
- tests d'acces ;
- documentation utilisateur ;
- procedure de gestion des incidents.

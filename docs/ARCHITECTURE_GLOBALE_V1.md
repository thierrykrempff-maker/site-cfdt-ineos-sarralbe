# Architecture globale V1 - CFDT Nexus

Version : 1.0

## Intention

CFDT Nexus est un ensemble d'outils d'accompagnement syndical.

Il doit aider les représentants CFDT à écouter, comprendre, organiser les informations, préparer les actions et garder une trace utile des dossiers, sans remplacer la décision humaine.

La V1 est recentrée sur l'analyse documentaire intelligente.

Le module central de CFDT Nexus est le Document Intelligence Center : il transforme un document en lecture syndicale structurée, questions CSE/CSSCT, points de vigilance et actions à préparer.

Priorité V1 :

1. Analyse documentaire intelligente.
2. Génération de questions CSE / CSSCT.
3. Préparation des actions syndicales à partir des documents.

## Sécurité documentaire

La règle de référence est décrite dans [SECURITY_POLICY.md](../knowledge/SECURITY_POLICY.md).

CFDT Nexus sépare les espaces documentaires :

- `public/` : documents publics et publiables ;
- `private/` : références, maquettes et fiches expurgées sans contenu sensible ;
- `confidential/` : dossier vide de rappel, aucun document confidentiel ne doit y être stocké.

Les accords INEOS complets, règlements internes complets, données nominatives, éléments BDESE et pièces confidentielles ne doivent jamais être stockés dans le dépôt ni exposés sur le site public.

## Modules prévus

### 1. Document Intelligence Center

Module prioritaire.

Objectif : analyser les documents utiles à l'action syndicale, reproduire le raisonnement d'un représentant expérimenté, préparer les questions CSE/CSSCT et transformer l'analyse en actions concrètes.

Il prépare :

- les profils d'analyse documentaire ;
- les grilles d'analyse métier indépendantes ;
- la génération de questions CSE / CSSCT ;
- les points de vigilance ;
- les documents ou informations manquants ;
- les actions syndicales à préparer ;
- l'intégration future avec GPT CFDT Nexus, Routeur Intelligent, Bibliothèque documentaire et n8n.

### 2. Bibliothèque documentaire

Objectif : centraliser les fiches pratiques, accords, modèles, tracts, repères juridiques et documents utiles au DIC.

Sprint V1.1 : ce module devient le socle documentaire des futurs experts IA.

Il prépare :

- la recherche instantanée ;
- les filtres par catégorie et confidentialité ;
- la fiche détaillée document ;
- les vues liste et cartes ;
- l'ajout de document sans backend ;
- l'intégration future avec Assistant IA, Routeur intelligent, recherche sémantique, n8n, OCR, PDF et Word.

### 3. Dossiers d'accompagnement

Objectif : suivre les situations individuelles ou collectives après analyse documentaire, avec une fiche claire, une chronologie, des tâches, une checklist automatique et un bouton "Que me manque-t-il ?".

### 4. Rédacteur CFDT

Objectif : préparer des textes clairs, prudents et utiles pour les salariés : articles, tracts, mails, affiches et flash info.

### 5. Automatisations

Objectif : connecter CFDT Nexus à des workflows n8n pour les relances, notifications, archivages, exports et créations de tâches.

## MVP validé

Le MVP du Document Intelligence Center contient :

- import visuel de document ;
- profils d'analyse ;
- résultat d'analyse structuré et simulé ;
- bouton "Préparer mes questions" ;
- bouton "Qu'est-ce que je n'ai pas vu ?" ;
- moteur de grilles d'analyse métier ;
- première grille : analyse d'un projet d'accord d'entreprise ;
- alerte si l'accord actuellement applicable manque ;
- page Paramètres pour la bibliothèque documentaire privée ;
- architecture prête pour questions CSE/CSSCT, actions syndicales, Routeur Intelligent, GPT CFDT Nexus et n8n.

Le MVP du module Dossiers d'accompagnement contient :

- création rapide d'un dossier ;
- fiche dossier ;
- type de dossier ;
- checklist automatique ;
- bouton "Que me manque-t-il ?" ;
- niveau de complétude ;
- niveau de confiance de l'analyse ;
- documents attendus ;
- informations manquantes ;
- chronologie ;
- tâches ;
- stockage local de démonstration ;
- structure prête pour une future base de données.

Le MVP du module Bibliothèque documentaire contient :

- documents de démonstration ;
- catégories documentaires ;
- niveaux de confidentialité ;
- recherche instantanée ;
- filtres ;
- tri ;
- vue liste ;
- vue cartes ;
- fiche détaillée ;
- formulaire d'ajout local ;
- export JSON ;
- architecture prête pour indexation IA.

## Règles d'expérience utilisateur

- L'élu doit pouvoir créer un dossier en moins d'une minute.
- Les champs sensibles ne doivent pas être exigés dès le départ.
- L'interface doit montrer la prochaine action utile.
- L'IA doit rester un assistant, jamais un décideur.
- Chaque suggestion doit pouvoir être corrigée par l'humain.
- Le terme "Dossier d'accompagnement" est préféré à "Dossier salarié".

## Données principales

### Dossier

- identifiant ;
- date de création ;
- date de mise à jour ;
- statut ;
- priorité ;
- type ;
- référent ;
- origine ;
- consentement ;
- résumé ;
- attente du salarié ;
- niveau de sensibilité.

### Salarié ou personne accompagnée

- nom, prénom ou alias ;
- contact ;
- service ou poste ;
- préférence de contact.

### Checklist

- modèle utilisé ;
- version ;
- items générés ;
- items ajoutés manuellement ;
- statut ;
- priorité ;
- note ;
- échéance.

### Analyse "Que me manque-t-il ?"

- date de l'analyse ;
- informations manquantes ;
- documents manquants ;
- niveau de complétude ;
- niveau de confiance ;
- raisons du score ;
- prochaine action proposée.

### Documents

- nom ;
- type ;
- statut ;
- source ;
- date ;
- confidentialité ;
- lien futur vers la bibliothèque documentaire.

### Bibliothèque documentaire

- identifiant ;
- titre ;
- catégorie ;
- description ;
- entreprise concernée ;
- date ;
- version ;
- auteur ;
- mots-clés ;
- confidentialité ;
- fichier source ;
- notes internes ;
- source ;
- dates de création et mise à jour.

### Chronologie

- date ;
- type d'événement ;
- description ;
- visibilité ;
- documents liés.

### Tâches

- libellé ;
- responsable ;
- échéance ;
- priorité ;
- statut ;
- lien avec checklist, document ou événement.

## Intégrations futures

### Assistant IA

- préqualification ;
- questions prioritaires ;
- synthèse ;
- plan d'action ;
- détection des points manquants.

### Bibliothèque documentaire

- fiches pratiques par type de dossier ;
- modèles de courrier ;
- accords applicables ;
- documents internes validés.

### GPT

- résumé de dossier ;
- reformulation ;
- extraction depuis documents ;
- brouillons prudents ;
- analyse de complétude.

### n8n

- notifications ;
- relances ;
- création de tâches ;
- export PDF ;
- archivage ;
- anonymisation ;
- synchronisation avec formulaire ou boîte mail.

## Point d'attention

Le MVP actuel ne doit pas être considéré comme un système de production pour données sensibles.

Avant tout usage réel avec des dossiers nominatifs, il faudra ajouter :

- authentification ;
- droits d'accès ;
- chiffrement ;
- sauvegarde maîtrisée ;
- journal d'audit ;
- politique de conservation ;
- conformité RGPD.

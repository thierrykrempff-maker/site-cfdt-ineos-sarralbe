# Politique de sécurité documentaire - CFDT Nexus

Version : 1.0

## Principe général

CFDT Nexus distingue strictement les documents publics, les références internes sans contenu sensible et les documents confidentiels.

Les accords d'entreprise, règlements internes, documents INEOS, éléments issus de la BDESE et données nominatives ne doivent jamais être stockés dans un dépôt public ni exposés dans le site public.

## Règles obligatoires

1. Ne jamais publier un accord INEOS complet.
2. Ne jamais intégrer de données nominatives.
3. Ne jamais exposer la BDESE.
4. Les documents sensibles sont analysés uniquement ponctuellement.
5. Les fiches publiques doivent être expurgées des informations confidentielles.

## Séparation des espaces

### `public/`

Contient uniquement des documents publics, publiables et relus.

Un document placé ici doit pouvoir être exposé sur le site sans risque pour les salariés, la CFDT, l'entreprise ou les instances représentatives.

### `private/`

Contient uniquement des références, maquettes, fiches de travail ou métadonnées sans contenu sensible.

Les fiches privées peuvent mentionner qu'un accord, un règlement ou un document existe, mais ne doivent pas reproduire son contenu confidentiel.

### `confidential/`

Ce dossier doit rester vide, sauf son README.

Il sert de rappel : aucun document confidentiel ne doit être stocké dans ce dépôt.

Les documents sensibles doivent rester hors dépôt et être analysés uniquement de manière ponctuelle, avec validation humaine.

## Application à la Bibliothèque documentaire

La Bibliothèque documentaire intelligente peut stocker :

- le titre d'un document ;
- sa catégorie ;
- sa description expurgée ;
- sa date ;
- sa version ;
- son niveau de confidentialité ;
- des mots-clés non sensibles ;
- une note indiquant qu'un document existe.

Elle ne doit pas stocker :

- le contenu complet d'un accord INEOS ;
- un règlement interne complet ;
- une extraction BDESE ;
- des documents contenant des noms de salariés ;
- des courriers disciplinaires nominatifs ;
- des documents médicaux ;
- des comptes rendus confidentiels non expurgés.

## Règle IA

Les assistants IA de CFDT Nexus peuvent aider à analyser un document sensible uniquement si celui-ci est fourni ponctuellement dans un cadre maîtrisé.

Le contenu sensible ne doit pas être transformé en fichier permanent du dépôt.

# CFDT Nexus - Document Intelligence Center V1

Sprint V2.

## Objectif

Créer le module central d'analyse documentaire du Cockpit CFDT Nexus.

Nom affiché dans l'interface : Analyse documentaire.

## Fonctionnalités V1

- import visuel de document : PDF, Word, image, texte ;
- rappel OCR futur ;
- choix du niveau de diffusion : Public, Interne CFDT, Confidentiel ;
- cartes de profils d'analyse ;
- résultat d'analyse simulé ;
- grille spécifique Projet d'accord ;
- bouton "Préparer mes questions" ;
- bouton "Qu'est-ce que je n'ai pas vu ?" ;
- architecture JS prête pour les futurs agents IA.

Le module est relié au menu des modules privés Dossiers et Bibliothèque.

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

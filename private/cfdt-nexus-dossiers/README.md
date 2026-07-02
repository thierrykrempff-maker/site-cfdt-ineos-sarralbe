# CFDT Nexus - Dossiers d'accompagnement

MVP local du module "Dossiers d'accompagnement".

## Contenu

- `index.html` : application autonome.
- `styles.css` : interface du module.
- `app.js` : logique métier, stockage local, checklist automatique, analyse "Que me manque-t-il ?".

## Fonctionnalités MVP

- création rapide d'un dossier ;
- workflow guidé en 4 phases : ouvrir, compléter, préparer, clôturer ;
- recommandation permanente de la prochaine action utile ;
- fiche dossier ;
- type de dossier ;
- checklist automatique selon le type ;
- bouton "Que me manque-t-il ?" ;
- bouton "Préparer le prochain entretien" ;
- bouton "Préparer la stratégie" ;
- documents manquants ;
- informations manquantes ;
- niveau de complétude ;
- niveau de confiance ;
- tâches ;
- timeline ;
- export JSON.

## Limite importante

Ce MVP stocke les données dans le `localStorage` du navigateur.

Il sert à valider l'expérience métier.

Il ne doit pas être utilisé comme outil de production avec des données sensibles tant que l'authentification, les droits d'accès, le chiffrement, l'audit et la politique de conservation ne sont pas en place.

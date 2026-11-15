NUTRITRACKER V1 — INSTALLATION

Contenu
- Application web progressive (PWA) en français.
- Ajout manuel et recherche Open Food Facts.
- Calories, protéines, glucides, lipides.
- Repas, objectifs modifiables, historique, export JSON.
- Données conservées localement dans le navigateur de l'iPhone.

IMPORTANT : pour installer une PWA sur iPhone et activer le mode hors ligne, le site doit être servi en HTTPS. Ouvrir index.html comme simple fichier ne suffit pas pour l'installation PWA.

MÉTHODE SIMPLE AVEC WINDOWS + GITHUB PAGES
1. Sur le PC, crée un compte gratuit sur github.com si nécessaire.
2. Crée un nouveau dépôt public nommé nutritrack.
3. Décompresse ce ZIP et envoie TOUS les fichiers du dossier dans le dépôt (Add file > Upload files).
4. Dans le dépôt : Settings > Pages.
5. Dans "Build and deployment", choisis "Deploy from a branch", branche "main", dossier "/ (root)", puis Save.
6. Attends quelques minutes. GitHub affiche une adresse du type https://TON-PSEUDO.github.io/nutritrack/
7. Ouvre cette adresse dans Safari sur l'iPhone.
8. Bouton Partager > Sur l'écran d'accueil > Ajouter.

UTILISATION
- Le bouton + Ajouter permet de rechercher un produit dans Open Food Facts ou de saisir les valeurs pour 100 g.
- Sélectionne le repas, vérifie la quantité, puis "Ajouter au journal".
- ⚙ permet de modifier les objectifs.
- Historique permet d'exporter une sauvegarde JSON.

DONNÉES ET CONFIDENTIALITÉ
Les repas et objectifs sont enregistrés dans le stockage local du navigateur sur l'iPhone. Ils ne sont pas synchronisés avec le PC ni envoyés à un serveur par l'application. La recherche Open Food Facts nécessite une connexion Internet et transmet le terme recherché à leur service. Ne vide pas les données de Safari / du site si tu veux conserver ton journal. Exporte régulièrement une sauvegarde depuis Historique.

LIMITES DE CETTE V1
- La base Open Food Facts est collaborative : vérifie les valeurs nutritionnelles affichées sur l'emballage.
- L'application ne synchronise pas les données entre appareils.
- Le mode hors ligne couvre l'interface et les saisies manuelles ; la recherche de produits nécessite Internet.

IDENTITÉ VISUELLE
L'écran d'ouverture affiche NutriTracker avec la signature discrète « by Phantom », puis ouvre le tableau de bord après environ 1,5 seconde.


MISE À JOUR AUTOMATIQUE (à partir de cette version 1.2.0)
- Cette version intègre un mécanisme de mise à jour via le Service Worker.
- Lorsqu'une version ultérieure est publiée sur le même site HTTPS, iOS/Safari détecte le nouveau sw.js.
- L'application propose alors « Télécharger et installer » ou « Plus tard ».
- Pour publier une version ultérieure : modifier APP_VERSION dans sw.js ET CACHE (garder le même préfixe), mettre à jour le numéro affiché dans index.html, puis téléverser/remplacer les fichiers du dépôt GitHub.
- Les données du journal sont conservées dans localStorage sur le même domaine. Ne change pas le domaine et ne modifie pas la clé nt-days sans migration.
- La mise à jour dépend du comportement du Service Worker sur iOS et peut être retardée par iOS si l'application n'est pas relancée. À la réouverture, le navigateur revérifie le worker.

VERSION 1.3.0 — THÈME SOMBRE
- Ajout d'un bouton lune/soleil dans l'en-tête.
- Le thème choisi est mémorisé localement sur l'appareil.
- Le cache du Service Worker est passé en version 1.3.0 pour déclencher la mise à jour.

VERSION 1.3.1 — CORRECTIF DE MISE À JOUR
- Correction du placement de l’initialisation du thème.
- Installation du cache avec rechargement forcé des ressources.
- Navigation en réseau d’abord pour récupérer le dernier index.html, avec secours hors ligne.
- Incrément du cache Service Worker pour déclencher une nouvelle installation.

VERSION 1.3.1 — CORRECTIF DE MISE À JOUR
- Correction de l’initialisation du thème sombre (initialisation au démarrage).
- Nouvelle stratégie de cache : le nouvel écran HTML est récupéré sur le réseau en priorité.
- Les fichiers du nouveau cache sont téléchargés sans réutiliser le cache HTTP.
- Le numéro de cache Service Worker est incrémenté en 1.3.1.

VERSION 1.3.2 — NOUVELLE ICÔNE PHANTOM
- Icônes iPhone 192x192 et 512x512 remplacées par le nouvel emblème nutrition vert/noir.
- Numéro de version et cache Service Worker incrémentés en 1.3.2.

VERSION 1.3.3 — NOUVELLE ICÔNE PHANTOM
- Remplacement des icônes PWA 192x192 et 512x512 par le nouveau logo minimaliste pomme/cardio.
- Incrément de version du Service Worker pour mettre à jour le cache des icônes.

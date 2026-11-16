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

VERSION 1.3.4 — ICÔNE EXACTE FOURNIE
- Remplacement des icônes 192x192 et 512x512 par le visuel de référence fourni : fond carré anthracite, feuille bicolore et tracé ECG vert, sans contour de pomme.
- Cache Service Worker incrémenté en 1.3.4.
- Pour rafraîchir l'icône iOS, il peut être nécessaire de supprimer le raccourci de l'écran d'accueil puis de le recréer depuis Safari après publication. Les données stockées sur le site restent conservées si le domaine ne change pas.

VERSION 1.4.0 — RECHERCHE ALIMENTAIRE ET FERMETURE DU POP-UP
- Recherche locale améliorée pour aliments génériques courants (liste de démarrage, valeurs pour 100 g).
- Recherche séparée des produits emballés via Open Food Facts.
- Fermeture explicite du dialogue d'ajout via le bouton X.
- Service Worker incrémenté en 1.4.0.
Note : la liste locale intégrée est un jeu de départ pratique, pas l'intégralité de la base Ciqual. La table officielle ANSES-Ciqual 2025 est librement téléchargeable et contient 3 484 aliments ; son intégration exhaustive nécessitera d'ajouter le fichier de données converti à l'application.
\n\nV2.0.0 : intégration de la base officielle ANSES Ciqual 2025 (3 484 aliments).\nFichier ciqual-2025.json généré depuis la feuille « composition nutritionnelle » du classeur Ciqual 2025 fourni. Valeurs pour 100 g : énergie (kcal), protéines (facteur Jones), glucides et lipides. Les valeurs notées « < x » dans le fichier source sont converties en x/2 pour permettre les calculs ; les tirets et valeurs absentes restent non renseignés. Source : ANSES, Table Ciqual 2025, licence Etalab – Open Licence 2.0.\n

NOUVEAUTÉ V2.2.0
- Bouton « Importer les repas d’hier » sous la section Mes repas.
- Une confirmation indique le nombre d’aliments copiés et précise que les repas déjà présents aujourd’hui sont conservés.
- L’importation copie les aliments et leurs quantités/valeurs nutritionnelles ; elle ne modifie jamais la journée source.

NOUVEAUTÉ V2.2.2
- Correction du zoom automatique de Safari iPhone lors de la sélection des champs de saisie : taille de texte des champs portée à 16 px minimum.
- Le zoom général de la page reste disponible avec les gestes habituels.
- Aucun changement aux objectifs nutritionnels ni aux données enregistrées.

NOUVEAUTÉ V2.3.0
- Icône de copie sur chaque aliment du journal.
- Copie vers un autre repas de la même journée, avec choix du repas et confirmation.
- L'aliment d'origine reste en place ; la copie conserve quantité et valeurs nutritionnelles.

NOUVEAUTÉ V2.3.1
- Remplacement des fenêtres système prompt/confirm par une fenêtre de copie intégrée au design NutriTracker.
- Choix du repas sous forme de boutons, puis étape de confirmation visuelle.

NOUVEAUTÉ V2.3.3 — SAUVEGARDES
- Création automatique d'une sauvegarde locale quotidienne à l'ouverture, avec conservation des 7 dernières copies.
- Export manuel JSON via le bouton « Exporter vers Fichiers / iCloud » : choisir iCloud Drive dans la feuille de partage/enregistrement iOS.
- Restauration d'un fichier JSON NutriTracker avec validation du format et création d'une copie locale avant remplacement.
- Pas de chiffrement par mot de passe.
NOTE : l'application web ne peut pas écrire silencieusement dans iCloud Drive. L'export vers iCloud nécessite une action de l'utilisateur.


V2.3.3 : barres de progression des calories, protéines, glucides et lipides en vert classique sous 90 %, vert néon de 90 à 100 %, rouge au-dessus de 100 %. Aucun libellé ou code couleur ajouté à l'interface.

*** OpenClassrooms Projet N°5: ***

    Construisez une API sécurisée pour une application d'avis gastronomiques

*** TORTEVOIS Benoit - 06/2002 ***

Javascript uniquement.

Création d'un serveur node, établissement des différents fichiers nécessaires à la gestion des routes établies par le front.
Création d'un cluster de BD MongoDB sur leur cloud Atlas, et connexion via app.js.

Travail uniquement sur le back, 8 routes créées:
- POST: signup --> pour enregistrer un compte
- POST: login --> pour se connecter à son compte
- POST: sauces --> pour ajouter une sauce dans la BD
- GET: sauces --> pour afficher l'ensemble des sauces dans la BD
- GET: sauces:id --> pour afficher la sauce sélectionnée et ainsi disposer des différentes options (like, dislike, modifier, supprimer)
- POST: like --> pour liker/disliker une sauce
- PUT: id --> pour modifier une sauce
- DELETE: id --> pour supprimer une sauce

Toutes les routes (hors login et signup) vérifient l'autorisation de l'user via un token délivré par auth.js.
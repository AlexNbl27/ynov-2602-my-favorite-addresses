# Exercices S3 - Mardi 24 Février

## Exercice 1

**Question :** Selon vous, pour ce cas précis, quelles sont les différences entre tester le controller avec un test d'intégration, ou tester la fonction de recherche avec des tests unitaires ? Quelle conclusion en tirez-vous ?

### Réponse

#### Tests d'intégration sur le controller (ex: `POST /api/addresses/searches`)

**Avantages :**
- Testent le flux complet : routing, middleware d'authentification (`isAuthorized`), validation des entrées, logique métier et réponse HTTP
- Détectent les problèmes d'intégration entre composants (ex: erreur dans le middleware, mauvaise injection de dépendances)
- Garantissent que l'API fonctionne comme attendu du point de vue d'un client externe
- Permettent de tester les cas d'erreur HTTP (400, 403, 404) dans leur contexte réel

**Inconvénients :**
- Plus lents à exécuter (nécessitent une base de données, même en mémoire)
- Plus difficiles à isoler en cas d'échec : l'erreur peut venir du controller, du middleware, de l'ORM ou de la fonction utilitaire
- Nécessitent un setup complexe (création d'utilisateurs, authentification, données de test)
- La fonction `getDistance` est testée indirectement, ce qui rend difficile la couverture de tous ses cas limites

#### Tests unitaires sur la fonction `getDistance`

**Avantages :**
- Très rapides à exécuter (pas de dépendances externes)
- Isolent précisément la logique mathématique (formule de Haversine)
- Permettent de tester facilement les cas limites : mêmes coordonnées, points aux antipodes, latitudes extrêmes (pôles), valeurs négatives
- En cas d'échec, l'erreur est immédiatement localisée
- Facilitent le développement en TDD

**Inconvénients :**
- Ne garantissent pas que la fonction est correctement intégrée dans le controller
- Ne testent pas la validation des entrées faite au niveau du controller
- Un test unitaire qui passe ne prouve pas que l'API fonctionne de bout en bout

#### Conclusion

Les deux approches sont **complémentaires et non mutuellement exclusives** :

1. **Tests unitaires pour `getDistance`** : essentiels pour valider la logique mathématique pure avec une couverture exhaustive des cas limites (distance nulle, très grandes distances, coordonnées aux limites). C'est une fonction pure sans effets de bord, idéale pour les tests unitaires.

2. **Tests d'intégration pour le controller** : nécessaires pour valider le comportement de l'API dans son ensemble, mais peuvent se contenter de quelques cas représentatifs pour la recherche, car la logique de distance est déjà couverte par les tests unitaires.

Cette stratégie permet d'avoir une **pyramide de tests équilibrée** : beaucoup de tests unitaires rapides à la base, et des tests d'intégration ciblés au sommet pour valider les scénarios critiques.

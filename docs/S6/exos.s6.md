# Exercices S6 - TDD

## Exercice 1 : Validation du mot de passe (TDD)

Nouvelle fonctionnalite developpee en approche TDD :
- Mot de passe minimum 8 caracteres
- Tests ecrits AVANT le code (RED -> GREEN)

## Exercice 2 : Correction bug email (TDD)

Bug corrige : emails invalides acceptes
- Validation format email avec regex
- Tests ecrits AVANT la correction

## Exercice 3 : Tests Bruno pour fonctionnalite future

Fonctionnalite "Favoris" - tests sans implementation :
- POST /api/addresses/:id/favorite
- DELETE /api/addresses/:id/favorite
- GET /api/addresses/favorites

## Exercice 4 : Codewars et les tests

### Katas proposes

- Facile : https://www.codewars.com/kata/5b853229cfde412a470000d0
- Moyen : https://www.codewars.com/kata/59f061773e532d0c87000a86
- Difficile : https://www.codewars.com/kata/57b06f90e298a7b53d000a86

### Comment les tests sont utilises dans la resolution d'algos Codewars ?

Dans Codewars, les tests jouent un role central et different du TDD classique :

**1. Tests comme specification**
Les tests sont pre-ecrits par l'auteur du kata et definissent exactement le comportement attendu. Le developpeur n'a pas a ecrire les tests, il doit comprendre ce qu'ils attendent.

**2. Feedback immediat**
A chaque soumission, les tests s'executent et affichent les resultats. On voit immediatement quels cas passent ou echouent, ce qui permet d'iterer rapidement.

**3. Tests visibles vs tests caches**
- **Tests visibles** : On peut voir les inputs/outputs attendus, ce qui aide a comprendre le probleme
- **Tests caches** : Certains tests sont masques pour eviter le "hardcoding" (coder les reponses en dur sans vraiment resoudre le probleme)

**4. Approche TDD inversee**
- En TDD classique : on ecrit les tests PUIS le code
- En Codewars : les tests existent deja, on ecrit le code pour les faire passer

**5. Progression par les edge cases**
Les tests couvrent souvent :
- Cas de base (exemples simples)
- Edge cases (valeurs limites, tableaux vides, negatifs...)
- Tests de performance (grandes entrees)

Cela force a penser a tous les cas possibles, pas seulement aux cas "heureux".

**Conclusion** : Codewars utilise les tests comme outil d'apprentissage et de validation. C'est une excellente facon de pratiquer la lecture de tests et la resolution de problemes guides par les tests.

## Exercice 5 Bonus : Tests supplementaires

Tests ajoutes pour augmenter la couverture :

- `tests/validation.test.ts` : Tests unitaires email/password (22 tests)
- `tests/getCoordinatesFromSearch.test.ts` : Tests API geocoding (6 tests)
- `client/e2e/validation.spec.ts` : Tests E2E validation formulaire

**Total : 82 tests serveur (avant: 51)**

# Exercices S4

## Exercice 2

### Question 3 : Pourquoi dans ce projet avoir un code coverage de 100% ne signifie pas avoir une application totalement testée ?

#### Réponse

Un code coverage de 100% indique que chaque ligne de code a été exécutée au moins une fois pendant les tests, mais cela ne garantit pas que l'application est totalement testée pour plusieurs raisons :

**1. Le coverage ne mesure pas la qualité des assertions**
- Une ligne peut être exécutée sans qu'aucune assertion ne vérifie son comportement
- Exemple : un test peut appeler `getDistance()` sans vérifier que le résultat est correct

**2. Le coverage ne couvre pas toutes les combinaisons d'entrées**
- La fonction `getDistance` peut avoir 100% de coverage avec un seul test, mais les cas limites (coordonnées négatives, pôles, antipodes, même point) ne sont pas forcément testés
- Les validations dans les controllers peuvent être couvertes sans tester toutes les combinaisons de champs manquants

**3. Le coverage ne teste pas l'intégration entre les composants**
- Les tests unitaires du serveur (Jest) et les tests du client (Vitest) sont séparés
- Le coverage ne capture pas les problèmes d'intégration client-serveur (ex: format de données incompatible, erreurs CORS)

**4. Le coverage ne teste pas les comportements asynchrones et les conditions de concurrence**
- Les appels à l'API externe `data.geopf.fr` dans `getCoordinatesFromSearch` sont mockés
- Les vrais problèmes réseau (timeout, erreurs intermittentes) ne sont pas testés

**5. Le coverage ne couvre pas le frontend React**
- Les tests actuels (`app.spec.ts`) testent uniquement l'API backend
- Les composants React (pages, contextes, hooks) ne sont pas couverts par ces tests
- Les interactions utilisateur (formulaires, navigation) ne sont pas validées

**6. Le coverage ne teste pas les aspects non-fonctionnels**
- Performance sous charge
- Sécurité (injection SQL, XSS, authentification JWT compromise)
- Accessibilité de l'interface utilisateur

**Conclusion** : Le code coverage est un indicateur utile mais insuffisant. Il mesure la quantité de code exécuté, pas la qualité des tests ni leur pertinence métier.

---

### Question 4 : Trouvez une solution pour obtenir le code coverage de l'API lors de l'exécution des tests E2E

#### Réponse

Pour mesurer le code coverage de l'API (serveur Express) pendant l'exécution des tests E2E Playwright, il faut **instrumenter le code serveur** et **collecter les données de couverture** pendant que les tests E2E s'exécutent.

#### Solution recommandée : NYC (Istanbul) avec le serveur Express

**Étape 1 : Installer les dépendances**

```bash
cd server
npm install --save-dev nyc @istanbuljs/nyc-config-typescript source-map-support
```

**Étape 2 : Configurer NYC dans `package.json` du serveur**

```json
{
  "nyc": {
    "extends": "@istanbuljs/nyc-config-typescript",
    "include": ["src/**/*.ts"],
    "exclude": ["src/**/*.spec.ts"],
    "reporter": ["text", "html", "lcov"],
    "all": true,
    "sourceMap": true,
    "instrument": true
  },
  "scripts": {
    "dev": "nodemon src/index.ts",
    "dev:coverage": "nyc --silent ts-node src/index.ts",
    "coverage:report": "nyc report"
  }
}
```

**Étape 3 : Ajouter un endpoint pour récupérer le coverage (uniquement en dev)**

Dans `server/src/app.ts` ou `server/src/index.ts` :

```typescript
if (process.env.NODE_ENV !== 'production') {
  app.get('/__coverage__', (req, res) => {
    res.json((global as any).__coverage__ || {});
  });
}
```

**Étape 4 : Modifier la configuration Playwright pour collecter le coverage**

Dans `client/playwright.config.ts` :

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  // ... autres configurations
});
```

Créer `client/e2e/global-teardown.ts` :

```typescript
import fs from 'fs';
import path from 'path';

async function globalTeardown() {
  // Récupérer le coverage depuis le serveur
  const response = await fetch('http://localhost:3000/__coverage__');
  const coverage = await response.json();

  // Sauvegarder dans un fichier pour NYC
  const coverageDir = path.join(__dirname, '../../server/.nyc_output');
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(coverageDir, 'e2e-coverage.json'),
    JSON.stringify(coverage)
  );
}

export default globalTeardown;
```

**Étape 5 : Script pour lancer les tests E2E avec coverage**

Dans le `package.json` racine ou un script shell :

```bash
# 1. Démarrer le serveur avec instrumentation
cd server && npm run dev:coverage &
SERVER_PID=$!

# 2. Attendre que le serveur soit prêt
sleep 5

# 3. Lancer les tests E2E
cd client && npx playwright test

# 4. Arrêter le serveur (le coverage est collecté au teardown)
kill $SERVER_PID

# 5. Générer le rapport de coverage
cd server && npm run coverage:report
```

#### Alternative : c8 (plus moderne, basé sur V8)

Si vous utilisez Node.js 18+, `c8` est une alternative plus légère :

```bash
npm install --save-dev c8
```

```json
{
  "scripts": {
    "dev:coverage": "c8 --include='src/**/*.ts' ts-node src/index.ts"
  }
}
```

#### Résultat attendu

Après exécution des tests E2E, vous obtiendrez un rapport de coverage montrant quelles parties de l'API ont été sollicitées par les scénarios Playwright (inscription, connexion, navigation).

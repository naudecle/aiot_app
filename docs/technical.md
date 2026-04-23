# Explication technique — Simulation et détection d'anomalies

Ce document décrit la façon dont l'application génère des données simulées, les persiste et détecte les anomalies (logique AIoT) :

## 1. Contexte & fichiers principaux

- Simulation et logique d'alerte : `src/contexts/AppContext.tsx`
- Persistance : `src/services/db.ts`
- Affichage & filtrage des alertes : `src/screens/DashboardScreen.tsx`, `src/screens/HistoryScreen.tsx`

## 2. Simulation des données

- Un `useEffect` dans le contexte global déclenche un intervalle toutes les 3 secondes qui crée un nouvel objet de type `SensorData` et le publie dans l'état global.
- Valeurs générées (plages et probabilités utilisées) :
  - `temperature`: `18 + Math.random() * 25` → env. 18–43 °C
  - `humidity`: `25 + Math.random() * 55` → env. 25–80 %
  - `motion`: `Math.random() > 0.75 ? 1 : 0` → ≈ 25 % de détection
  - `energy`: `50 + Math.random() * 500` → env. 50–550 W

Extrait (simplifié) :

```ts
const newData: SensorData = {
  temperature: +(18 + Math.random() * 25).toFixed(1),
  humidity: +(25 + Math.random() * 55).toFixed(1),
  motion: Math.random() > 0.75 ? 1 : 0,
  energy: +(50 + Math.random() * 500).toFixed(0),
  timestamp: new Date().toISOString(),
};
```

Chaque point est ensuite inséré via `insertData(...)` (persistance) et l'état global (`currentData`, `previousData`, `trends`, `aiotStatus`, `alertActive`) est mis à jour.

### 2.1 Intégration météo & localisation (nouveau)

- Le contexte global récupère désormais la météo réelle via l'API OpenWeatherMap (service `fetchWeather`) et la position de l'appareil avec `expo-location` (`Location.getCurrentPositionAsync`).
- Comportement :
  - Une tâche (`useEffect`) demande la permission de localisation à l'utilisateur (`Location.requestForegroundPermissionsAsync`).
  - Si la permission est accordée, la position est utilisée pour appeler `fetchWeather(latitude, longitude)` ; sinon la requête utilise une `CITY` par défaut (du fichier `.env`).
  - Les données météo sont rafraîchies toutes les 60 secondes.
- Impact sur la simulation : si `realWeather` est disponible, la génération des valeurs se base sur `realWeather.temperature` et `realWeather.humidity` avec une petite perturbation aléatoire :

```ts
temperature: realWeather
  ? +(realWeather.temperature + (Math.random() * 2 - 1)).toFixed(1)
  : +(18 + Math.random() * 25).toFixed(1),
humidity: realWeather
  ? +(realWeather.humidity + (Math.random() * 3 - 1.5))
  : +(25 + Math.random() * 55).toFixed(1),
```

- UI : un composant `WeatherCard` (`src/components/weather.tsx`) affiche la météo récupérée (température, ressenti, humidité, vent) et indique la source (API).

- Variables d'environnement (voir `.env.example`) :
  - `EXPO_PUBLIC_WEATHER_API_KEY` — clé OpenWeatherMap
  - `EXPO_PUBLIC_WEATHER_URL` — endpoint API (par défaut `https://api.openweathermap.org/data/2.5/weather`)
  - `EXPO_PUBLIC_WEATHER_CITY` — ville par défaut si la localisation échoue ou si permission refusée

- Dépendances et permissions :
  - `expo-location` est utilisée (ajoutée à `package.json`).
  - Pour la publication, ajouter les permissions de localisation dans `app.json` / manifest (Android `ACCESS_FINE_LOCATION`, iOS `NSLocationWhenInUseUsageDescription`) et mentionner la raison d'usage.

- Risques opérationnels : quotas API, latence réseau et gestion de la permission utilisateur. Prévoir un toggle UX si l'utilisateur souhaite désactiver la météo réelle.

## 3. Persistance

- API : `initDB()`, `insertData(...)`, `getHistory()`, `clearHistory()`, `getRecordCount()`.
- Comportement :
  - Sur mobile (Expo natif) : ouverture d'une base SQLite (`expo-sqlite`) et écriture dans la table `SensorData`.
  - Sur le Web (ou si SQLite échoue) : fallback vers un store en mémoire (`memoryStore`) avec un tampon conservant les 500 dernières entrées.

Extrait (concept) :

```ts
// insertData -> sqliteDB.runAsync(...) ou push dans memoryStore
```

## 4. Détection d'anomalies (logique AIoT)

- Méthode : détection par **seuils** configurables (`thresholds`) : `temperature`, `humidity`, `energy`.
- À chaque point :
  - `coolingActive = newData.temperature > thresholds.temperature`
  - `dehumidifierActive = newData.humidity > thresholds.humidity`
  - `energySavingMode = newData.energy > thresholds.energy`
- Un indicateur `alertActive` devient `true` si une de ces conditions est vraie. Ces états alimentent `aiotStatus` et pilotent l'affichage des alertes dans le Dashboard et l'Historique.

Extrait (simplifié) :

```ts
const cooling = newData.temperature > thresholds.temperature;
const dehumidifier = newData.humidity > thresholds.humidity;
const energySaving = newData.energy > thresholds.energy;
setAiotStatus({
  coolingActive: cooling,
  dehumidifierActive: dehumidifier,
  energySavingMode: energySaving,
});
setAlertActive(cooling || dehumidifier || energySaving);
```

## 5. Calcul de tendance

- Une fonction `computeTrend(current, previous)` renvoie `'up' | 'down' | 'stable'`.
- Règle : si la différence absolue est < 0.5 → `stable`, sinon `up` ou `down`.

Extrait :

```ts
const diff = current - previous;
if (Math.abs(diff) < 0.5) return "stable";
return diff > 0 ? "up" : "down";
```

## 6. Avantages et limites

- Avantages :
  - Approche simple et déterministe, facile à comprendre et à tester.
  - Seuils configurables via l'interface (réglables en production/test).
  - Faible coût de calcul, fonctionne en temps réel sur des appareils mobiles modestes.
- Limites :
  - Détection purement par seuils — ne capture pas les anomalies statistiques ou comportementales (pas d'analyse temporelle avancée ni d'algorithmes ML).
  - Sensible aux fausses alertes si les seuils ne sont pas correctement calibrés.

## 7. Améliorations possibles

- Ajouter un calcul sur fenêtre temporelle (moyenne mobile, médiane sur N points) pour réduire le bruit.
- Introduire des méthodes statistiques (z-score, IQR) ou des modèles ML (Isolation Forest, LSTM) pour détection d'anomalies plus robustes.
- Enrichir la persistance pour effectuer des agrégations côté base (par exemple résumés horaires/journaliers).

## 8. Références dans le dépôt

- `src/contexts/AppContext.tsx` — simulation, logique AIoT, tendances
- `src/services/db.ts` — persistance SQLite / fallback mémoire
- `src/screens/DashboardScreen.tsx` — affichage temps réel et banner d'alerte
- `src/screens/HistoryScreen.tsx` — historique, filtres et statistiques

---

Fichier généré automatiquement : `docs/technical.md` — adapté pour inclusion dans un rapport technique.

# AIoT Dashboard App

Une application mobile hybride intelligente développée avec **React Native** et **Expo** qui simule et surveille des données de capteurs IoT en temps réel.

## 🌟 Fonctionnalités

- **Simulation IoT en temps réel (toutes les 3 s)** : Génération automatique de mesures simulées — température, humidité, mouvement et consommation d'énergie — avec plages et probabilités réalistes (ex. température ~18–43°C, humidité ~25–80%, mouvement détecté ≈25% du temps, énergie ≈50–550 W).
- **Dashboard en direct** : Affichage des valeurs actuelles, indicateurs de tendance (`up`/`down`/`stable` calculés sur la variation entre points) et bannière d'alerte AIoT.
- **Logique AIoT basée sur règles** : Détection d'anomalies par seuils configurables (température, humidité, énergie). Actions/états dérivés : refroidissement, déshumidification, mode économie d'énergie ; `alertActive` passe à `true` si l'un des seuils est franchi.
- **Historique et Statistiques** : Persistance des mesures et affichage des 200 derniers enregistrements ; calculs agrégés (moyenne, min, max, nombre d'alertes) et filtres (tous / critiques / normaux).
- **Stockage flexible** : Sauvegarde native sur SQLite via `expo-sqlite` (iOS/Android) avec fallback en mémoire sur le Web (tampon limité à 500 enregistrements).
- **Paramétrage et contrôle** : Interface pour ajuster les seuils, activer/désactiver la simulation et basculer le thème (mode sombre).

## 🛠️ Technologies Utilisées

- **Framework & Runtime** : React Native + Expo (hybride mobile / web)
- **Langage** : TypeScript — typage pour composants et logique applicative
- **UI** : React Native Paper (Material Design 3) — composants et thèmes
- **Navigation** : React Navigation (Bottom Tabs)
- **Persistance** : `expo-sqlite` pour stockage local natif (table `SensorData`), fallback en mémoire pour l'exécution web
- **Outils & dépendances** : Metro/Expo CLI, Expo Go pour tests sur appareil, utilitaires React Hooks (`useEffect`, `useState`, `useContext`) pour la simulation et la synchronisation

Pour les détails d'implémentation : la simulation et la logique d'alerte sont gérées depuis le contexte global ([src/contexts/AppContext.tsx](src/contexts/AppContext.tsx#L1-L170)), et la persistance par [src/services/db.ts](src/services/db.ts#L1-L103).

## 🚀 Démarrage Rapide

### Prérequis

- Node.js installé
- L'application **Expo Go** installée sur votre smartphone (Android/iOS)

### Installation

1. Cloner le dépôt :

```bash
git clone https://github.com/naudecle/aiot_app.git
cd aiot_app
```

2. Installer les dépendances :

```bash
npm install
```

3. Lancer le serveur de développement :

```bash
npx expo start
```

Si _npx expo start_ ne marche pas en scannant le QR code avec Expo Go, verifie d'abord si votre ordinateur et l'appareil mobile sont sur le même réseau essaie avec la commande :

```bash
npx expo start --tunnel
```

Si en scannant le QR code, le disfonctionnement persiste veuillez suivre les étapes suivantes (sur Windows):

1. Assurez vous que votre ordinateur et appareil mobile sont sur le même réseau.
2. Dans le terminal, lorsque vous avez exécuté la commande « npx expo start », sous le code QR, vous avez vu un message qui affiche : « Metro en attente sur exp://192.168.XX.XXX:PORT#». Quelle est l’adresse IP :Port# utilisée par expo ? Gardez ce port # .
3. Accédez à la barre de recherche windows
4. tapez « Windows Security » (on dirait un bouclier bleu)
5. Cliquez sur « Firewall & network protection »
6. Advanced settings
7. Inbound Rules
8. New Rule (Sur la droite de l'ecran)
9. Choisissez Port
10. Choisissez TCP
11. Entrez le numéro de port utilisé par Expo
12. Cliquer sur " Allow all the connection "
13. Laissez tout coché
14. Ajouter un nom (ex: Expo)
    Puis ok et relancez la commande:

```bash
npx expo start --tunnel
```

### Tester l'application

- **Sur Mobile** : Scannez le QR code généré dans le terminal avec l'application **Expo Go** (Android) ou l'appareil photo qui va ouvrir l'application **Expo Go** (iOS).
- **Sur Web** : Appuyez sur `w` dans le terminal pour ouvrir l'application dans votre navigateur (utilise le fallback mémoire pour la base de données).

## 📱 Captures d'écran

<img width="1913" height="859" alt="image" src="https://github.com/user-attachments/assets/195c0f0f-6e89-44ee-b687-f8aae7a9dbfa" />
<img width="1903" height="942" alt="image" src="https://github.com/user-attachments/assets/33926435-6f18-4853-899d-6587b694bb24" />
<img width="1910" height="748" alt="image" src="https://github.com/user-attachments/assets/1bb27c82-d124-4382-8b49-73dd98d4e436" />
<img width="1919" height="429" alt="image" src="https://github.com/user-attachments/assets/0d28467a-5bb5-43c2-9202-12320e891b3c" />




## 💡 Notes sur le développement

- **Web Support** : Le module WebAssembly de SQLite n'est pas complètement pris en charge par Metro Bundler sur le Web. Un _fallback_ en mémoire (`inMemoryDB`) a été implémenté pour garantir le fonctionnement fluide de l'application sur navigateur. Les données persistantes (SQLite) sont actives sur iOS et Android.

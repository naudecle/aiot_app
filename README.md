# AIoT Dashboard App

Une application mobile hybride intelligente développée avec **React Native** et **Expo** qui simule et surveille des données de capteurs IoT en temps réel.

## 🌟 Fonctionnalités

- **Simulation IoT en temps réel** : Génération automatique de données (Température, Humidité, Mouvement, Énergie) toutes les 3 secondes.
- **Dashboard Dynamique** : Affichage en temps réel avec indicateurs de tendance (↑/↓), micro-animations et alertes visuelles.
- **Logique AIoT Intelligente** : Réactions automatiques du système basées sur des seuils :
  - 🌡️ Température élevée -> _Système de refroidissement activé_
  - 💧 Humidité élevée -> _Déshumidificateur activé_
  - ⚡ Forte consommation -> _Mode économie d'énergie_
- **Historique et Statistiques** : Suivi des 200 dernières mesures avec moyennes, minimums, maximums, et filtres de criticité.
- **Base de Données Locale** : Sauvegarde des données avec `expo-sqlite` (sur mobile) et un fallback en mémoire (sur le web).
- **Personnalisation** : Interface premium avec Mode Sombre, configuration des seuils critiques, et contrôle de la simulation.

## 🛠️ Technologies Utilisées

- **Framework** : React Native / Expo
- **Navigation** : React Navigation v7 (Bottom Tabs)
- **UI/UX** : React Native Paper (Material Design 3)
- **Base de données** : SQLite
- **Langage** : TypeScript

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

- **Sur Mobile** : Scannez le QR code généré dans le terminal avec l'application **Expo Go** (Android) ou l'appareil photo (iOS).
- **Sur Web** : Appuyez sur `w` dans le terminal pour ouvrir l'application dans votre navigateur (utilise le fallback mémoire pour la base de données).

## 📱 Captures d'écran

<img width="929" height="965" alt="dashboard_alert" src="https://github.com/user-attachments/assets/0ee337e0-b636-4b1b-992a-56734a226cf2" />
<img width="929" height="965" alt="dashboard_normal" src="https://github.com/user-attachments/assets/0d6d8ad3-2b14-443b-8e5e-8cf298dbad68" />
<img width="929" height="965" alt="historique" src="https://github.com/user-attachments/assets/4bae590f-89e6-4a8f-90d4-faf59b1b3608" />
<img width="929" height="965" alt="parametres" src="https://github.com/user-attachments/assets/d8e9de4d-34a1-459b-9b69-b3fc037cc9dd" />

## 💡 Notes sur le développement

- **Web Support** : Le module WebAssembly de SQLite n'est pas complètement pris en charge par Metro Bundler sur le Web. Un _fallback_ en mémoire (`inMemoryDB`) a été implémenté pour garantir le fonctionnement fluide de l'application sur navigateur. Les données persistantes (SQLite) sont actives sur iOS et Android.

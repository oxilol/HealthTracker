<div align="center">

# Health Tracker

**Une application mobile web complète pour suivre sa santé, sa nutrition et ses entraînements au quotidien.**

<br/>

> **Projet personnel** — Construit pour mon utilisation personnel, je voulais une application qui pouvait combiner tout les données que je voulais visualiser à la même endroit avec une interface qui me convient.

---

## Aperçu

Health Tracker est une application web conçue et développée par moi-même, afin de répondre à un besoin : **centraliser le suivi de sa santé physique dans une unique interface centralisée**.

En effet, toutes les applications existantes sur le marché sont bien dans certains domaines (MyFitnessPal, Strong, Apple Health…), mais aucune ne centralise la nutritions, entraînements, cardio et métriques de santé tous dans une simple interface. C'est pourquoi j'ai décidé de créé ma propre application.

---

## Fonctionnalités principales

| Module | Ce que ça fait |
|--------|---------------|
| **Dashboard** | Vue hebdomadaire avec une navigation par semaine. Statistiques en fonction du nombre de pas effectués, des calories dépensées, du nombre d'entrainements et de la moyenne de calories. Barre de progression des journées en fonction des pas effectués/ de calories dépensées/ de protéines. |
| **Nutrition** | Tracking quotidien des macros (protéines, glucides et lipides). Recherche dans la base de donnée USDA. Création de ses propres aliments et repas. Possibilité de faire un quick add. Anneau de progression animé. |
| **Entraînement** | Deux modes : le **Gym** (muscu) et le **Cardio**. Templates d'entraînement réutilisables. Logging par sets avec la quantité de poids utilisée et le nombre de répétitions. Performance précédente affichée pour encourager la surcharge progressive. Carte avec la possibilité de swipe-to-delete les sets. |
| **Santé** | Synchronisation des data Apple health : nombre de pas, énergie active, distance et étages. Poids corporel avec l'historique. Calendrier interactif. |
| **Statistiques** | Graphiques avec Recharts sur 7 / 30 / 90 jours. Comparaison dynamique de deux métriques possibles entre elles (par exemple : poids vs calories, pas vs protéines...). Courbe d'évolution des performances par exercice. |
| **Auth** | Inscription / connexion via Supabase Auth. Protection des routes côté client. Tokens JWT sur chaque appel API. |

---

## Tech stack

### Frontend
| Technologie | Rôle |
|-------------|------|
| **Next.js** | Framework full-stack **React** |
| **TypeScript** | Typage strict de bout en bout — chaque entité (Food, Workout, HealthMetrics…) est typée |
| **Tailwind CSS** | Système de design dark-mode, responsive, avec animations custom |
| **Zustand** | State management léger pour l'état UI (modals, formulaires, navigation) |
| **Recharts** | Graphiques interactifs (Area, Line, ComposedChart) pour le module Stats |


### Backend
| Technologie | Rôle |
|-------------|------|
| **Supabase** (PostgreSQL) | Base de données relationnelle avec Row Level Security, auth intégrée, et client admin pour les opérations serveur |
| **Next.js API Routes** | 15+ endpoints REST protégés par JWT |
| **USDA FoodData Central API** | Recherche d'aliments et récupération des valeurs nutritionnelles |
| **Apple HealthKit** | Synchronisation des métriques passives (pas, calories, distance, étages) via token de sync personnel |

---

## Architecture

L'application suit une architecture **feature-based** qui sépare clairement les responsabilités. Chaque domaine métier (santé, nutrition, workouts, stats) est autonome avec ses propres composants, hooks et logique.

Architecture de l'application : 
![Architecture de l'application](./docs/screenshots/architecture.png)

Flow de données des métriques santé (AppleHealth) : 
![Health metriques flow](./docs/screenshots/architecture-healthdata.png)


### Pourquoi cette architecture ?

- **Feature-based** : Chaque module (health, nutrition, workouts, stats) a son dossier avec `components/` et `hooks/`. Ça permet de travailler sur une section sans toucher aux autres.
- **Custom hooks comme couche d'abstraction** : Toute la logique data-fetching est encapsulée dans des hooks (`useWorkoutSession`, `useNutritionLogs`, `useHealthData`…). Les composants ne font que du rendu.
- **Zustand pour l'état UI** : Permet de gérer les modals, les formulaires et l'état de navigation.
- **Double client Supabase** : Un client browser (avec anon key) pour l'auth côté client, et un client admin (service role key) côté serveur pour les opérations qui bypassent le RLS — par exemple, l'import depuis HealthKit qui arrive avec un token de sync, pas un JWT utilisateur.
- **Token de synchronisation HealthKit** : Plutôt que d'exposer les credentials Supabase à l'app iOS, chaque utilisateur génère un UUID unique stocké dans `profiles.health_sync_token`. L'app iOS envoie ce token dans le header, et le serveur le valide contre la base de données.

---

## Structure du projet

```
health-tracker/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Dashboard principal (vue hebdomadaire)
│   ├── layout.tsx                # Layout global (dark theme, AppShell, Toaster)
│   ├── globals.css               # Styles globaux + animations custom
│   ├── login/                    # Page de connexion
│   ├── signup/                   # Page d'inscription
│   ├── nutrition/                # Page nutrition (suivi macros)
│   ├── workouts/                 # Page entraînement (gym + cardio)
│   ├── health/                   # Page santé (métriques Apple Health + poids)
│   ├── stats/                    # Page statistiques (graphiques)
│   └── api/                      # 15+ API Routes REST
│       ├── health/               # CRUD métriques santé + calendrier + poids
│       ├── nutrition/            # CRUD logs nutrition + objectifs + repas
│       ├── workouts/             # CRUD sessions gym + cardio + sets + templates
│       ├── foods/                # Recherche USDA
│       ├── stats/                # Agrégation données pour graphiques
│       ├── import/health-app/    # Endpoint de réception données HealthKit
│       └── health-sync-token/    # Gestion des tokens de sync iOS
│
├── features/                     # Modules métier (feature-based architecture)
│   ├── auth/                     # Composants + hooks d'authentification
│   ├── health/                   # Dashboard santé, calendrier, sync settings
│   ├── nutrition/                # Formulaires, recherche, progress rings, calculs
│   ├── workouts/                 # Templates, sessions, cartes d'exercice, cardio
│   └── stats/                    # Graphiques Recharts (activity, weight, nutrition, compare)
│
├── components/                   # Composants UI réutilisables
│   ├── AppShell.tsx              # Navigation bottom-tab + route protection
│   ├── SwipeableCard.tsx         # Carte avec swipe-to-delete (touch events)
│   ├── Button.tsx / Input.tsx    # Composants de formulaire
│   └── Card.tsx                  # Container card stylisé
│
├── store/                        # État global (Zustand)
│   ├── workoutStore.ts           # UI state pour les modals d'entraînement
│   ├── nutritionStore.ts         # UI state pour la recherche d'aliments
│   ├── healthStore.ts            # UI state pour le modal de sync
│   └── userStore.ts              # Profil utilisateur connecté
│
├── services/                     # Clients Supabase
│   ├── supabaseClient.ts         # Client browser (anon key, auth côté client)
│   └── supabaseAdmin.ts          # Client serveur (service role, bypass RLS)
│
├── lib/                          # Utilitaires partagés
│   ├── apiAuth.ts                # Validation JWT → client Supabase authentifié
│   ├── getToken.ts               # Helper pour récupérer le Bearer token
│   └── dateUtils.ts              # Formatage et arithmétique de dates
│
└── types/                        # Interfaces TypeScript
    ├── health.ts                 # HealthMetrics, WeightLog
    ├── nutrition.ts              # Food, Meal, NutritionLog, NutritionGoals, SearchResultFood
    ├── workout.ts                # WorkoutTemplate, WorkoutSession, ExerciseSet
    └── cardio.ts                 # CardioTemplate, CardioSession, CardioLog
```

---

## Démo de l'application

![Démo de l'application](./docs/demo.gif)

---

## Décisions techniques

### Pourquoi Next.js et pas React Native ?
J'ai choisi une application web plutôt qu'une app native pour plusieurs raisons : déploiement instantané (pas d'App Store), la possibilité d'utiliser Next.js comme backend léger et la synchronisation sur desktop, l'interface est optimisée mobile-first mais fonctionne aussi sur desktop.

### Pourquoi un token de sync plutôt que OAuth ?
 Un UUID stocké en base de données est suffisant pour authentifier les requêtes de sync. C'est simple et sécurisé et le token est par utilisateur et régénérable.

### Comment fonctionne le calcul nutritionnel ?
Chaque aliment a ses macros définis **par quantité de base** (ex: 100g). Quand l'utilisateur log une quantité différente, un ratio est calculé (`quantité saisie / quantité de base`) et appliqué à tous les macros. Le système supporte aussi les « portions » comme unité alternative.

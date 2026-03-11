# Sognudimare - Product Requirements Document

## Original Problem Statement
Application mobile de croisières en catamaran (Corse, Sardaigne, Grèce, Caraïbes). L'objectif initial était de corriger un bug critique de paiement sur l'app iOS live, puis de construire un panneau d'administration et redesigner la homepage.

## Architecture
- **Frontend**: React Native / Expo / TypeScript / expo-router
- **Backend**: Python / FastAPI / MongoDB
- **Paiement**: Square (production)
- **Hébergement backend**: Railway
- **Build & Deploy mobile**: EAS (Expo Application Services)
- **Distribution**: Apple App Store + Google Play Console

## Core Files
- `frontend/app/index.tsx` - Homepage (redesign complet)
- `frontend/app/admin.tsx` - Panneau d'administration
- `frontend/app.json` - Configuration Expo (v1.8.0)
- `frontend/eas.json` - Configuration EAS build
- `backend/server.py` - API FastAPI (cruises, admin, paiement)

## What's Been Implemented

### Completed (All sessions)
- [x] Fix du bug de paiement (code corrigé dans `payment/[cruiseId].tsx`)
- [x] Panneau d'administration complet (CRUD croisières, dates, prix)
- [x] Redesign complet de la homepage:
  - Carousel animé en hero section
  - Section "Choisissez votre aventure" avec boarding cards
  - Section "Nos destinations" en layout vertical
  - Section "Ce qui fait vraiment notre différence" (redesign élégant)
  - Section "Des vacances tout inclus" (redesign élégant avec cartes scrollables)
  - Section "Une collaboration responsable et engagée" (partenaires locaux)
  - Section "Club des Voyageurs" (3 cartes tarifs)
  - Section "Nos engagements écoresponsables"
  - Section "À propos de Sognudimare"
- [x] Suppression du banner "2021"
- [x] `app.json` corrigé: projectId invalide supprimé, version 1.8.0, buildNumber 9

### Completed Today (March 2026)
- [x] Vérification visuelle complète du redesign homepage
- [x] Correction `app.json`: suppression du `projectId: "sognudimare-app"` (invalide)
- [x] Mise à jour version: 1.7.1 → 1.8.0, buildNumber 8 → 9, versionCode 8 → 9
- [x] Vérification API backend (4 croisières, admin login OK)
- [x] Redesign section "Club des Voyageurs" : image des cartes Club ajoutée, "BEST" supprimé, design plus élégant avec pills de tarifs

## Pending / Next Steps

### P0 - EAS Build (User Action Required)
L'utilisateur doit exécuter sur sa machine locale:
```bash
cd frontend
npx eas login          # Se connecter au compte Expo
npx eas init           # Régénérer un projectId UUID valide
npx eas build --platform ios --profile preview   # Tester le build
```

### P1 - Soumission App Store (User Action Required)
```bash
npx eas build --platform ios --profile production
npx eas submit --platform ios --latest
```

### P2 - Backlog
- Guide utilisateur pour le panneau admin
- Publication production Google Play (après test fermé)
- Intégration API MisterBooking (synchro prix/disponibilités)

## Credentials
- Admin Panel: `admin` / `Capitaine2026!`
- Backend Railway: `https://sognudimare-app-production.up.railway.app`
- Apple Team ID: `LA5WFU7RW5`
- ASC App ID: `6758972863`

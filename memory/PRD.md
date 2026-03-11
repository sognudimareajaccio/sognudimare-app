# Sognudimare - Product Requirements Document

## Original Problem Statement
Application mobile de croisieres en catamaran (Corse, Sardaigne, Grece, Caraibes). L'objectif initial etait de corriger un bug critique de paiement sur l'app iOS live, puis de construire un panneau d'administration et redesigner l'ensemble du frontend.

## Architecture
- **Frontend**: React Native / Expo / TypeScript / expo-router
- **Backend**: Python / FastAPI / MongoDB
- **Paiement**: Square (production)
- **Hebergement backend**: Railway
- **Build & Deploy mobile**: EAS (Expo Application Services)
- **Distribution**: Apple App Store + Google Play Console

## Core Files
- `frontend/app/index.tsx` - Homepage (redesign complet)
- `frontend/app/engagements.tsx` - Page engagements (redesign complet)
- `frontend/app/catamarans.tsx` - Page flotte (avec Lucy Sunreef 50)
- `frontend/app/admin.tsx` - Panneau d'administration
- `frontend/app.json` - Configuration Expo (v1.8.0)
- `frontend/eas.json` - Configuration EAS build
- `backend/server.py` - API FastAPI (cruises, admin, paiement)

## What's Been Implemented

### Completed (All sessions)
- [x] Fix du bug de paiement (code corrige dans `payment/[cruiseId].tsx`)
- [x] Panneau d'administration complet (CRUD croisieres, dates, prix)
- [x] Redesign complet de la homepage avec carousel anime, sections elegantes
- [x] Page croisiere redesignee : hero moderne, carte "PROCHAIN DEPART", barre fixe reservation
- [x] Page Destinations redesignee : cards premium avec prochain depart et prix
- [x] Page La Flotte redesignee : catamarans Lagoon 38/43/46 + Lucy Sunreef 50 (flagship)
- [x] Page L'Equipage redesignee : hero, section "Reve de mer", fiches equipage, valeurs
- [x] Page Club modernisee : header marine, tabs dores, style coherent
- [x] `app.json` corrige: projectId invalide supprime, version 1.8.0, buildNumber 9

### Completed (11 Mars 2026)
- [x] Correction lien Maddalena : la photo "Archipel la Maddalena" redirige maintenant vers la croisiere "Sardaigne & Corse du Sud"
- [x] Page Engagements redesignee : design premium avec hero navy, carte donation 1%, liste d'engagements numerotee, section equipage engage, cartes d'associations avec bordure doree, citation et CTA elegant
- [x] Lucy (Sunreef 50) deja ajoutee a la page flotte (flagship avec badge PRESTIGE)
- [x] Lucy mise a jour : 4 cabines (1 proprietaire 2PAX, 2 invites 4PAX, 1 VIP 2PAX = 8 passagers), detail affiche dans le modal
- [x] Icone voilier (sail-boat) pour "Des catamarans recents" dans la section "Ce qui fait vraiment notre difference" en homepage
- [x] Page Admin redesignee : theme navy/or premium avec barre de stats, tabs dores, cartes croisieres avec image/badge/prix, modals elegants, login premium
- [x] Boutons de la page Flotte renvoient en haut de page avant navigation
- [x] Upload d'images dans l'admin : endpoint backend `/api/admin/upload-image` + bouton "Uploader une image" dans le modal d'edition avec apercu
- [x] Icones du menu du bas plus elegantes : ancre (Accueil), rose des vents (Croisieres), voilier (Club), marqueur (Contact)
- [x] Page Contact redesignee : hero avec photo Nicolas & Maud, mot de remerciement de l'equipage, cartes contact (tel/email/adresse), reseaux sociaux, lien admin, footer avec logo et infos legales

## Pending / Next Steps

### P0 - EAS Build (User Action Required)
L'utilisateur doit executer sur sa machine locale:
```bash
cd frontend
npx eas login          # Se connecter au compte Expo
npx eas init           # Regenerer un projectId UUID valide
npx eas build --platform ios --profile preview   # Tester le build
```

### P1 - Soumission App Store (User Action Required)
```bash
npx eas build --platform ios --profile production
npx eas submit --platform ios --latest
```

### P2 - Backlog
- Guide utilisateur pour le panneau admin
- Publication production Google Play (apres test ferme)
- Integration API MisterBooking (synchro prix/disponibilites)

### Refactoring suggere
- Deplacer le contenu hardcode (details flotte, equipage, textes) vers des fichiers JSON ou endpoints backend

## Credentials
- Admin Panel: `admin` / `Capitaine2026!`
- Backend Railway: `https://sognudimare-app-production.up.railway.app`
- Apple Team ID: `LA5WFU7RW5`
- ASC App ID: `6758972863`

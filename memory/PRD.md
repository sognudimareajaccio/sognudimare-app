# Sognudimare - Product Requirements Document

## Original Problem Statement
Application mobile de croisieres en catamaran (Corse, Sardaigne, Grece, Caraibes). L'objectif initial etait de corriger un bug critique de paiement sur l'app iOS live, puis de construire un panneau d'administration et redesigner l'ensemble du frontend. L'app a ete deployee sur App Store Connect (v1.9.0) et une version web a ete deployee sur Netlify pour les reservations.

## Architecture
- **Frontend**: React Native / Expo (SDK 54) / TypeScript / expo-router
- **Backend**: Python / FastAPI / MongoDB
- **Paiement**: Square (production)
- **Hebergement backend**: Railway
- **Build & Deploy mobile**: EAS (Expo Application Services)
- **Distribution**: Apple App Store + Google Play Console
- **Web**: Netlify (sognudimare-reservations.netlify.app)

## Core Files
- `frontend/app/index.tsx` - Homepage
- `frontend/app/cruises.tsx` - Page destinations (responsive desktop)
- `frontend/app/cruise/[id].tsx` - Detail croisiere
- `frontend/app/booking/[cruiseId].tsx` - Page reservation
- `frontend/app/payment/[cruiseId].tsx` - Page paiement
- `frontend/app/_layout.tsx` - Layout avec navigation
- `frontend/app/engagements.tsx` - Page engagements
- `frontend/app/contact.tsx` - Page contact
- `frontend/app/admin.tsx` - Panneau admin
- `frontend/app/catamarans.tsx` - Page flotte
- `backend/server.py` - API FastAPI

## What's Been Implemented

### Completed
- [x] Fix du bug de paiement
- [x] Panneau d'administration complet (CRUD, upload images)
- [x] Redesign complet de toutes les pages (theme navy/or premium)
- [x] Page Contact creee
- [x] Page Engagements redesignee
- [x] Lucy (Sunreef 50) ajoutee a la flotte
- [x] Build iOS v1.9.0 uploade sur App Store Connect
- [x] Backend deploye sur Railway (stable)
- [x] Version web deployee sur Netlify
- [x] Layout responsive desktop pour la page croisieres
- [x] Navigation web: bouton retour -> /cruises sur toutes les pages
- [x] Barre "ACCUEIL" (lien sognudimare.com) sur toutes les pages web (cruises, cruise detail, booking, payment)
- [x] Styles topBar corriges sur cruises.tsx (manquants auparavant)

## Pending / Next Steps

### P0 - Deploiement Netlify (User Action Required)
L'utilisateur doit deployer les dernieres corrections de navigation sur Netlify:
1. Sauvegarder le code via "Save to Github"
2. Localement: `git pull`, `npx expo export --platform web`, copier vers le dossier client, `netlify deploy`

### P1 - Soumission App Store (User Action Required)
L'app v1.9.0 est sur App Store Connect - l'utilisateur doit la soumettre pour review.

### P2 - Backlog
- Integration API MisterBooking (synchro prix/disponibilites)
- Publication production Google Play
- Guide utilisateur pour le panneau admin

## Credentials
- Admin Panel: `admin` / `Capitaine2026!`
- Backend Railway: `https://sognudimare-app-production.up.railway.app`
- Apple Team ID: `LA5WFU7RW5`
- ASC App ID: `6758972863`

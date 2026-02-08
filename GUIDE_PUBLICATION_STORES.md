# 📱 Guide de Publication - Sognudimare App

## Configuration Actuelle
- **Nom de l'app** : Sognudimare
- **Bundle ID (iOS)** : com.sognudimare.app
- **Package (Android)** : com.sognudimare.app
- **Icône** : ✅ Créée à partir de votre logo

---

## Étape 1 : Créer les Comptes Développeur

### Apple App Store (99€/an)
1. Allez sur https://developer.apple.com/programs/enroll/
2. Cliquez sur "Start Your Enrollment"
3. Connectez-vous avec votre Apple ID (ou créez-en un)
4. Choisissez "Individual" ou "Organization" (si entreprise)
5. Payez les 99€/an
6. ⏳ Attendre 24-48h pour validation

### Google Play Store (25$ une fois)
1. Allez sur https://play.google.com/console/signup
2. Acceptez les conditions et payez 25$
3. ✅ Accès immédiat

---

## Étape 2 : Installer les outils (sur votre ordinateur)

```bash
# 1. Installer Node.js (si pas déjà fait)
# Téléchargez depuis https://nodejs.org/

# 2. Installer EAS CLI
npm install -g eas-cli

# 3. Se connecter à Expo
eas login
```

---

## Étape 3 : Préparer le Build

### Pour iOS (App Store)
```bash
cd /chemin/vers/frontend

# Créer le build iOS
eas build --platform ios --profile production
```

Vous aurez besoin de :
- Votre Apple ID
- Votre mot de passe Apple ID
- Accepter la création des certificats

### Pour Android (Play Store)
```bash
# Créer le build Android
eas build --platform android --profile production
```

---

## Étape 4 : Soumettre aux Stores

### Soumission App Store
```bash
eas submit --platform ios
```

Vous aurez besoin de :
- App Store Connect App ID
- Apple Team ID

### Soumission Play Store
```bash
eas submit --platform android
```

Vous aurez besoin de :
- Créer une clé de service Google Cloud (JSON)

---

## Étape 5 : Informations Requises pour les Stores

### App Store (Apple)
- ✅ Nom : Sognudimare
- ❓ Sous-titre : "Croisières en Méditerranée" (30 caractères max)
- ❓ Description : (4000 caractères max)
- ❓ Mots-clés : "croisière, catamaran, corse, méditerranée, vacances"
- ❓ Catégorie : "Voyages"
- ❓ Screenshots iPhone (6.5") : 1284 x 2778 px
- ❓ URL Politique de confidentialité
- ❓ URL Support

### Play Store (Google)
- ✅ Nom : Sognudimare
- ❓ Description courte : (80 caractères max)
- ❓ Description longue : (4000 caractères max)
- ❓ Screenshots : min 2, max 8
- ❓ Icône : 512x512 px (déjà faite)
- ❓ Feature Graphic : 1024x500 px
- ❓ URL Politique de confidentialité

---

## Délais Estimés

| Étape | Délai |
|-------|-------|
| Compte Apple Developer | 24-48h |
| Compte Google Play | Immédiat |
| Build iOS | ~20 min |
| Build Android | ~15 min |
| Review Apple | 1-7 jours |
| Review Google | 1-3 jours |

---

## Support

Si vous avez besoin d'aide pour :
- Rédiger les descriptions
- Créer les screenshots
- Créer la politique de confidentialité
- Toute autre étape

N'hésitez pas à demander !

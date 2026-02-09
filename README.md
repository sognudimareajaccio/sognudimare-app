# Sognudimare - Application Mobile

Application de réservation de croisières en catamaran en Corse et Sardaigne.

## 🚀 Technologies

- **Frontend**: React Native / Expo
- **Backend**: FastAPI / Python
- **Database**: MongoDB
- **Paiement**: Square

## 📱 Installation

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
npm install
npx expo start
```

## 🔐 Configuration

Créez un fichier `backend/.env` avec vos clés API (voir `.env.example`).

## 📦 Build pour les stores

```bash
cd frontend
npx eas build --platform all
npx eas submit --platform ios
npx eas submit --platform android
```

## 📞 Contact

- Website: https://www.sognudimare.com
- Email: contact@sognudimare-catamarans.com

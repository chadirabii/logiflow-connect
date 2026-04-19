# LogiFlow Connect

Frontend Vite + React + TypeScript branché sur Supabase (auth + données métier).

## Prérequis

- Node.js 18+
- Un projet Supabase

## Configuration

1. Copier `.env.example` vers `.env`
2. Renseigner :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` (ou `VITE_SUPABASE_ANON_KEY`)

## Lancer le projet

```bash
npm install
npm run dev
```

## Données Supabase utilisées

Le frontend lit/écrit directement dans ces tables :

- `profiles`
- `user_roles`
- `bookings`
- `shipments`
- `tracking_events`
- `documents`
- `conversations`
- `messages`
- `reclamations`
- `notifications`

## Initialiser Supabase en 1 fois

1. Ouvrir Supabase Dashboard → SQL Editor
2. Copier/coller le contenu de `supabase/setup.sql`
3. Exécuter le script
4. Créer vos comptes admin/manager dans Auth, puis affecter leur rôle avec les requêtes d'exemple en bas du script

## Emails notifications (Node.js + Nodemailer)

Un serveur Node.js SMTP est inclus: `server/mail-server.js`.

1. Ajouter dans `.env`:

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="hrportal2023@gmail.com"
SMTP_PASS="your-gmail-app-password"
SMTP_FROM="LogiFlow <hrportal2023@gmail.com>"
MAIL_SERVER_PORT="4000"
MAIL_CORS_ORIGIN="http://localhost:8080"
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
# Optionnel: active une clé API côté backend
# MAIL_API_KEY="choose-a-strong-random-key"

VITE_MAIL_API_URL="http://localhost:4000"
# Optionnel: si MAIL_API_KEY est défini
# VITE_MAIL_API_KEY="choose-a-strong-random-key"
```

2. Lancer le serveur mail:

```bash
npm run mail:dev
```

3. Lancer le frontend:

```bash
npm run dev
```

Endpoints disponibles:

- `GET /health`
- `POST /notifications/email`
- `POST /notifications/bulk`

Le bouton "Tester le service email" du dashboard admin envoie maintenant un email de test vers l'email du compte connecté.

## Smoke test (insertion de test)

1. Créer d'abord ces utilisateurs dans Auth :
   - `admin@247logistics.com`
   - `manager@247logistics.com`
   - `client@247logistics.com`
2. Ouvrir SQL Editor
3. Exécuter `supabase/smoke_test_seed.sql`
4. Vérifier le tableau de sortie (comptes par table)

## Authentification

- Connexion/inscription via Supabase Auth
- Les profils sont stockés dans `profiles`
- Les rôles (`admin`, `manager`, `client`) sont stockés dans `user_roles`

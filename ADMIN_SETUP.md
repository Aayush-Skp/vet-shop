# Curavet Admin CMS Setup

## Quick Start

1. **Copy environment file**
   ```bash
   cp .env.example .env.local
   ```

2. **Set JWT_SECRET** (for session cookies)
   ```
   JWT_SECRET=your-random-32-char-secret
   ```

3. **Add admin users** in Firebase Console -> Authentication -> Users -> Add user (email + password)

4. **Run with Next.js**
   ```bash
   npm run dev
   ```

5. **Access admin**
   - Login: http://localhost:3000/admin (sign in with Firebase Auth email/password)
   - Products: http://localhost:3000/admin/products

## Firebase Auth (Admin Login)

1. Enable **Authentication** in Firebase Console
2. Go to **Sign-in method** -> **Email/Password** -> Enable
3. Add admin users: **Authentication** -> **Users** -> **Add user** (email + password)
4. No registration in the app - create users only in Firebase Console

## Firebase Setup

Firebase config lives in `.env.local` (local) or env vars (deployed dev). Copy from `.env.example`.

### Client SDK (browser - analytics, auth)
From Firebase Console -> **Project Settings** -> **General** -> Your apps:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=curavet-80a7c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=curavet-80a7c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=curavet-80a7c.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

### Admin SDK (server - Firestore)
1. Enable **Firestore Database**
2. Go to **Project Settings** -> **Service accounts** -> **Generate new private key**
3. Add to `.env.local`:
   ```
   FIREBASE_PROJECT_ID=curavet-80a7c
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@curavet-80a7c.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
   (Copy the private key from the JSON, keeping `\n` for newlines.)

4. Create a Firestore **products** collection (it will be created automatically on first write)

## Cloudinary Setup

1. Go to **Dashboard** -> **Settings** -> **API Keys**
2. Add to `.env.local`:
   ```
   CLOUDINARY_CLOUD_NAME=dycbgqfgi
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

Images are stored in the `curavet/products` folder in Cloudinary.

## Running the Site

- **Full site with admin:** `npm run dev` -> Next.js at http://localhost:3000 (admin at /admin)
- **Static only (no admin):** `npm run dev:static` -> serves static files only

The main site falls back to `data/products.json` when Firebase is not configured.

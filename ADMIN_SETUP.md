# Curavet Admin CMS Setup

## Quick Start

1. **Set environment variables** in `.env.local` (see sections below)
2. **Add admin users** in Firebase Console -> Authentication -> Users -> Add user (email + password)
3. **Run the app**
   ```bash
   npm run dev
   ```
4. **Access admin** at http://localhost:3000/admin (sign in with Firebase Auth email/password)

## Firebase Setup

### Authentication (Admin Login)

1. Enable **Authentication** in Firebase Console
2. Go to **Sign-in method** -> **Email/Password** -> Enable
3. Add admin users: **Authentication** -> **Users** -> **Add user** (email + password)
4. No registration in the app — create users only in Firebase Console

### Firestore Database

1. Enable **Firestore Database** in Firebase Console
2. Collections (`products`, `bookings`, `featured_images`) are created automatically on first write
3. Set Firestore security rules to allow public reads and authenticated writes:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /products/{productId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /bookings/{bookingId} {
         allow create: if true;
         allow read, update, delete: if request.auth != null;
       }
       match /featured_images/{imageId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

### Client SDK Config

From Firebase Console -> **Project Settings** -> **General** -> Your apps, add to `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

## Cloudinary Setup

1. Go to Cloudinary **Dashboard** -> **Settings** -> **API Keys**
2. Add to `.env.local`:
   ```
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

Product images are stored in `curavet/products` and hero images in `curavet/hero` folders in Cloudinary.

## Deployment (Vercel)

Add all the above environment variables to your Vercel project settings under **Settings** -> **Environment Variables**. The admin pages use `force-dynamic` rendering to avoid build-time Firebase errors.

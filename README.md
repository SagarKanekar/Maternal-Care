# MaternalCare

MaternalCare is a Vite + React + TypeScript web app for maternal health monitoring, dashboards, and Firebase-backed authentication.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Firebase (Auth + Firestore)

## Prerequisites

- Node.js 18+ (Node.js 20 recommended)
- npm 9+
- A Firebase project with Email/Password auth enabled

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment Variables

Copy the template and fill your Firebase values:

```bash
cp .env.example .env
```

Required keys:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Where to find these values:

1. Open Firebase Console.
2. Go to your project.
3. Click Project settings (gear icon) -> General.
4. Under Your apps, select your Web app.
5. In SDK setup and configuration, copy values from the `firebaseConfig` object.

## 3. Enable Firebase Authentication

1. Firebase Console -> Authentication -> Sign-in method.
2. Enable Email/Password provider.

## 4. Run in Development

```bash
npm run dev
```

The app will be available at the local URL shown by Vite (usually `http://localhost:5173`).

## 5. Build the Project

Create a production build:

```bash
npm run build
```

Output is generated in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## Available Scripts

- `npm run dev` -> start development server
- `npm run build` -> production build
- `npm run build:dev` -> development-mode build
- `npm run preview` -> preview production build
- `npm run lint` -> run ESLint

## Authentication Flow (Implemented)

- Login and signup are handled with Firebase Auth (Email/Password).
- On signup, profile data is stored in Firestore in `users/{uid}`.
- Header UI shows login state and supports logout.

## Suggested Next Steps

1. Add route guards for authenticated and role-based access.
2. Add Firestore security rules for `users/{uid}`.
3. Add role-based protection for sensor data collections.

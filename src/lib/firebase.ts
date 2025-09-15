
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} satisfies Partial<FirebaseOptions>;

const requiredConfigKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
] as const;

const hasRequiredFirebaseConfig = (
  config: Partial<FirebaseOptions>,
): config is FirebaseOptions =>
  requiredConfigKeys.every((key) => {
    const value = config[key];
    return typeof value === 'string' && value.length > 0;
  });

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

const resolveFirebaseConfig = (): FirebaseOptions => {
  if (!hasRequiredFirebaseConfig(firebaseConfig)) {
    throw new Error(
      'Firebase configuration is missing. Please provide the required NEXT_PUBLIC_FIREBASE_* environment variables.',
    );
  }

  return firebaseConfig;
};

export const isFirebaseConfigured = (): boolean => hasRequiredFirebaseConfig(firebaseConfig);

export const getFirebaseApp = (): FirebaseApp => {
  if (cachedApp) {
    return cachedApp;
  }

  const config = resolveFirebaseConfig();
  cachedApp = getApps().length ? getApp() : initializeApp(config);

  return cachedApp;
};

export const getFirebaseAuth = (): Auth => {
  if (cachedAuth) {
    return cachedAuth;
  }

  cachedAuth = getAuth(getFirebaseApp());
  return cachedAuth;
};

export const getFirestoreDb = (): Firestore => {
  if (cachedDb) {
    return cachedDb;
  }

  cachedDb = getFirestore(getFirebaseApp());
  return cachedDb;
};

export type { FirebaseApp };

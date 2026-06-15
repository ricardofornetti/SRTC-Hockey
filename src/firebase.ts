import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged as firebaseOnAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc as firestoreDeleteDoc, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
// NOTA DE SEGURIDAD: Este archivo de configuración contiene la "apiKey" pública
// de Firebase para esta aplicación web. Es información pública por diseño:
// Firebase está hecho para que esta clave viaje al navegador del usuario.
// NO mover esto a variables de entorno ni intentar "ocultarla": no aporta
// seguridad y puede romper el build (Vite necesita este valor en build-time).
// La seguridad real de los datos se controla exclusivamente desde
// `firestore.rules`, validando quién está autenticado (request.auth) y
// comparando su email contra la lista de administradores autorizados.
import firebaseConfig from '../firebase-applet-config.json';
import { 
  INITIAL_PLAYERS, 
  INITIAL_MATCH_LIST, 
  INITIAL_STANDINGS, 
  INITIAL_NEWS, 
  INITIAL_GALLERY, 
  INITIAL_CONVOCATIONS, 
  INITIAL_NOTIFICATIONS 
} from './data';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)")
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

// -----------------------------------------------------------------------
// AUTENTICACIÓN / ROLES
// -----------------------------------------------------------------------
// Lista de emails con permisos de Administrador (control total de la app).
// Esta lista debe coincidir EXACTAMENTE con la definida en `firestore.rules`
// (función isAdmin()/isStaff()), porque las reglas de Firestore son la
// verificación real: esto solo controla qué ve la interfaz.
// Para agregar/quitar administradores:
//   1. Crear/eliminar el usuario en Firebase Console > Authentication > Users.
//   2. Actualizar este arreglo y la lista equivalente en firestore.rules.
export const ADMIN_EMAILS: string[] = [
  'fornettiricardo@gmail.com',
];

/**
 * Inicia sesión como administrador con email y contraseña.
 * Lanza un error con un mensaje amigable en español si falla.
 */
export async function signInAdmin(email: string, password: string): Promise<User> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return credential.user;
  } catch (error) {
    // No exponemos el detalle técnico de Firebase al usuario final.
    if (import.meta.env.DEV) {
      console.error('signInAdmin error:', error);
    }
    throw new Error('No se pudo iniciar sesión. Verifica el email y la contraseña.');
  }
}

/**
 * Cierra la sesión actual.
 */
export async function signOutAdmin(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('signOutAdmin error:', error);
    }
  }
}

/**
 * Suscribe un callback a los cambios de sesión de Firebase Auth.
 * Devuelve la función de desuscripción.
 */
export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * Determina si el usuario autenticado actual tiene permisos de administrador,
 * comparando su email contra ADMIN_EMAILS. Esto es solo para la interfaz;
 * la validación real ocurre en `firestore.rules`.
 */
export function isAdminUser(user: User | null): boolean {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email);
}

// Verification of Connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      if (import.meta.env.DEV) {
        console.error("Please check your Firebase configuration or network status.");
      }
    }
  }
}
testConnection();

// Types for Firebase integration and Error Reporting
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

/**
 * Maneja errores de Firestore de forma segura:
 * - En desarrollo, registra el detalle completo (incluyendo info de sesión)
 *   solo en la consola local para facilitar el debugging.
 * - En producción, registra y propaga únicamente un mensaje genérico, sin
 *   datos de autenticación (uid, email, proveedor, etc.), para evitar
 *   exponer información de sesión en la consola del navegador del usuario.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);

  if (import.meta.env.DEV) {
    console.error('Firestore Error (detalle dev):', {
      message,
      operationType,
      path,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        isAnonymous: auth.currentUser?.isAnonymous,
      },
    });
  } else {
    console.error('Firestore Error:', JSON.stringify({ error: message, operationType, path }));
  }

  throw new Error(`Error de Firestore (${operationType}): ${message}`);
}

/**
 * Subscribes to a Firestore collection with real-time sync.
 * Triggers callback whenever document updates are detected on the server!
 */
export function subscribeToCollection<T>(
  collectionName: string, 
  onUpdate: (data: T[]) => void
): () => void {
  const colRef = collection(db, collectionName);
  
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({
          ...docSnap.data()
        } as T);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, collectionName);
    }
  );
}

/**
 * Helper to recursively remove undefined fields from an object for Firestore safety.
 */
function cleanUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => cleanUndefined(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, cleanUndefined(v)])
    );
  }
  return obj;
}

/**
 * Saves/updates a document in a specific collection.
 */
export async function saveDocument(
  collectionName: string, 
  docId: string, 
  data: any
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  try {
    const cleanedData = cleanUndefined(data);
    await setDoc(docRef, cleanedData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

/**
 * Deletes a document from a specific collection.
 */
export async function deleteDocument(
  collectionName: string, 
  docId: string
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  try {
    await firestoreDeleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
  }
}

/**
 * Seeds Firestore database with high-quality initial data from data.ts
 * if the database collections are currently empty.
 */
export async function seedInitialDataIfCollectionIsEmpty(): Promise<void> {
  try {
    // 1. Players
    const playersRef = collection(db, 'players');
    const playersSnap = await getDocs(playersRef);
    if (playersSnap.empty) {
      console.log('Seeding initial players to Firestore...');
      for (const p of INITIAL_PLAYERS) {
        await setDoc(doc(db, 'players', p.id), p);
      }
    }

    // 2. Matches
    const matchesRef = collection(db, 'matches');
    const matchesSnap = await getDocs(matchesRef);
    if (matchesSnap.empty) {
      console.log('Seeding initial matches to Firestore...');
      for (const m of INITIAL_MATCH_LIST) {
        await setDoc(doc(db, 'matches', m.id), m);
      }
    } else {
      // Backport playoff matches if they are not in Firestore
      const existingIds = new Set(matchesSnap.docs.map(doc => doc.id));
      const playoffMatches = INITIAL_MATCH_LIST.filter(m => m.fase === 'cuartos' || m.fase === 'semifinal' || m.fase === 'final');
      let backportedCount = 0;
      for (const m of playoffMatches) {
        if (!existingIds.has(m.id)) {
          await setDoc(doc(db, 'matches', m.id), m);
          backportedCount++;
        }
      }
      if (backportedCount > 0) {
        console.log(`Backported ${backportedCount} playoff matches to Firestore.`);
      }
    }

    // 3. Standings
    const standingsRef = collection(db, 'standings');
    const standingsSnap = await getDocs(standingsRef);
    if (standingsSnap.empty) {
      console.log('Seeding initial standings to Firestore...');
      for (const s of INITIAL_STANDINGS) {
        await setDoc(doc(db, 'standings', s.id), s);
      }
    }

    // 4. News
    const newsRef = collection(db, 'news');
    const newsSnap = await getDocs(newsRef);
    if (newsSnap.empty) {
      console.log('Seeding initial news to Firestore...');
      for (const n of INITIAL_NEWS) {
        await setDoc(doc(db, 'news', n.id), n);
      }
    }

    // 5. Gallery
    const galleryRef = collection(db, 'gallery');
    const gallerySnap = await getDocs(galleryRef);
    if (gallerySnap.empty) {
      console.log('Seeding initial gallery items to Firestore...');
      for (const g of INITIAL_GALLERY) {
        await setDoc(doc(db, 'gallery', g.id), g);
      }
    }

    // 6. Convocations
    const convocationsRef = collection(db, 'convocations');
    const convocationsSnap = await getDocs(convocationsRef);
    if (convocationsSnap.empty) {
      console.log('Seeding initial convocations to Firestore...');
      for (const c of INITIAL_CONVOCATIONS) {
        await setDoc(doc(db, 'convocations', c.id), c);
      }
    }

    // 7. Notifications
    const notificationsRef = collection(db, 'notifications');
    const notificationsSnap = await getDocs(notificationsRef);
    if (notificationsSnap.empty) {
      console.log('Seeding initial notifications to Firestore...');
      for (const n of INITIAL_NOTIFICATIONS) {
        await setDoc(doc(db, 'notifications', n.id), n);
      }
    }

    // 8. Custom Logo fallback to default settings if empty
    const settingsLogoDoc = doc(db, 'settings', 'logo');
    const logoSaved = localStorage.getItem('srtc_custom_club_logo');
    if (logoSaved) {
      await setDoc(settingsLogoDoc, { id: 'logo', value: logoSaved });
    }

    console.log('Data seeding completed (if necessary).');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

/**
 * Automatically calculates differences between local state changes and Firestore,
 * applying the required additions, updates, or deletions.
 */
export async function syncCollection<T extends { id: string }>(
  collectionName: string,
  currentItems: T[],
  newItems: T[]
): Promise<void> {
  const currentById = new Map(currentItems.map(item => [item.id, item]));
  const newById = new Map(newItems.map(item => [item.id, item]));

  // Find added or modified items
  const toUpsert: T[] = [];
  for (const item of newItems) {
    const existing = currentById.get(item.id);
    if (!existing || JSON.stringify(existing) !== JSON.stringify(item)) {
      toUpsert.push(item);
    }
  }

  // Find deleted items
  const toDelete: string[] = [];
  for (const item of currentItems) {
    if (!newById.has(item.id)) {
      toDelete.push(item.id);
    }
  }

  // Apply changes to Firestore
  try {
    for (const item of toUpsert) {
      await saveDocument(collectionName, item.id, item);
    }
    for (const id of toDelete) {
      await deleteDocument(collectionName, id);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
  }
}


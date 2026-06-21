import React, { useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const oldFirebaseConfig = {
  apiKey: "AIzaSyDQjXf8P4CPlhVTDmlXFDou6jnqqPKDSHU",
  authDomain: "silken-concept-wsjh2.firebaseapp.com",
  projectId: "silken-concept-wsjh2",
  storageBucket: "silken-concept-wsjh2.firebasestorage.app",
  messagingSenderId: "1034403352770",
  appId: "1:1034403352770:web:f9cef5c0d728fe9c632b5b",
};
const OLD_DATABASE_ID = "ai-studio-cad8a50e-a3c6-4736-b207-7d2994b4d7a8";

type MigrationStatus = 'idle' | 'running' | 'completed' | 'failed';

interface CollectionProgress {
  name: string;
  status: 'pending' | 'migrating' | 'success' | 'error';
  processed: number;
  total: number;
  errorMsg?: string;
}

const COLLECTIONS = [
  'players',
  'matches',
  'standings',
  'news',
  'gallery',
  'convocations',
  'notifications',
  'settings'
];

export default function DataMigrationTool() {
  const [status, setStatus] = useState<MigrationStatus>('idle');
  const [progress, setProgress] = useState<Record<string, CollectionProgress>>(
    COLLECTIONS.reduce((acc, col) => {
      acc[col] = { name: col, status: 'pending', processed: 0, total: 0 };
      return acc;
    }, {} as Record<string, CollectionProgress>)
  );
  const [generalLog, setGeneralLog] = useState<string[]>([]);
  const [totalMigrated, setTotalMigrated] = useState(0);

  const addLog = (message: string) => {
    setGeneralLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runMigration = async () => {
    if (status === 'running') return;
    
    setStatus('running');
    setTotalMigrated(0);
    setGeneralLog([]);
    addLog('Iniciando proceso de migración de datos...');

    // Initialize/retrieve legacy app
    let legacyApp;
    try {
      const existingApp = getApps().find(app => app.name === 'legacyApp');
      if (existingApp) {
        addLog('Conectando a la instancia legacy de Firebase (existente)...');
        legacyApp = getApp('legacyApp');
      } else {
        addLog('Iniciando nueva conexión con el proyecto legacy silken-concept-wsjh2...');
        legacyApp = initializeApp(oldFirebaseConfig, 'legacyApp');
      }
    } catch (err: any) {
      addLog(`Error al conectar con la app legacy: ${err.message}`);
      setStatus('failed');
      return;
    }

    // Get legacy Firestore reference
    let oldDb;
    try {
      oldDb = getFirestore(legacyApp, OLD_DATABASE_ID);
      addLog(`Base de datos legacy referenciada correctamente (${OLD_DATABASE_ID})`);
    } catch (err: any) {
      addLog(`Error al referenciar base de datos legacy: ${err.message}`);
      setStatus('failed');
      return;
    }

    let overallMigrated = 0;

    for (const colName of COLLECTIONS) {
      setProgress(prev => ({
        ...prev,
        [colName]: { ...prev[colName], status: 'migrating' }
      }));
      addLog(`Migrando colección: "${colName}"...`);

      try {
        // Read old documents
        const oldColRef = collection(oldDb, colName);
        const snapshot = await getDocs(oldColRef);
        const docsList = snapshot.docs;
        const totalDocsInCol = docsList.length;

        addLog(`Leídos ${totalDocsInCol} documentos de la colección "${colName}" del proyecto antiguo.`);

        setProgress(prev => ({
          ...prev,
          [colName]: { ...prev[colName], total: totalDocsInCol }
        }));

        if (totalDocsInCol === 0) {
          setProgress(prev => ({
            ...prev,
            [colName]: { ...prev[colName], status: 'success' }
          }));
          addLog(`Colección "${colName}" terminada (vacía).`);
          continue;
        }

        let copiedInCol = 0;

        for (const docSnap of docsList) {
          const docId = docSnap.id;
          const docData = docSnap.data();

          // Write to the new database
          const newDocRef = doc(db, colName, docId);
          await setDoc(newDocRef, docData);

          copiedInCol++;
          overallMigrated++;

          setProgress(prev => ({
            ...prev,
            [colName]: { ...prev[colName], processed: copiedInCol }
          }));
        }

        setProgress(prev => ({
          ...prev,
          [colName]: { ...prev[colName], status: 'success' }
        }));
        addLog(`Colección "${colName}" migrada con éxito! (${copiedInCol}/${totalDocsInCol} corregidos).`);

      } catch (err: any) {
        addLog(`[ERROR] Falló la colección "${colName}": ${err.message}`);
        setProgress(prev => ({
          ...prev,
          [colName]: { ...prev[colName], status: 'error', errorMsg: err.message }
        }));
      }
    }

    setTotalMigrated(overallMigrated);
    setStatus('completed');
    addLog(`Migración terminada de forma general. Total de documentos migrados: ${overallMigrated}`);
  };

  return (
    <div id="data-migration-tool" className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-5 my-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-amber-100 dark:bg-amber-900/60 p-2 rounded-lg text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400">
            ⚠️ Herramienta temporal de migración — eliminar después de usar
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-500">
            Copia los datos históricos (partidos, jugadoras, estadísticas, noticias, etc.) desde la base de datos temporal anterior al nuevo proyecto oficial en producción.
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-5">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-amber-200 dark:border-amber-800 text-sm">
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Información del Entorno:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <li><strong>Origen:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">silken-concept-wsjh2</code> (DB: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{OLD_DATABASE_ID}</code>)</li>
            <li><strong>Destino:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">hockey-san-rafael</code> (DB: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">(default)</code>)</li>
          </ul>
        </div>

        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950 text-xs text-red-700 dark:text-red-400 rounded-lg">
          <strong>Advertencia de Seguridad:</strong> Esta acción sobrescribirá los documentos existentes en la base nueva que tengan el mismo ID. Ejecutar una sola vez para evitar colisiones.
        </div>
      </div>

      {/* Button and status */}
      <div className="flex flex-wrap items-center gap-4 mb-5">
        <button
          onClick={runMigration}
          disabled={status === 'running'}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold transition-all shadow-md ${
            status === 'running'
              ? 'bg-amber-400 dark:bg-amber-600 cursor-not-allowed'
              : 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 active:scale-95'
          }`}
        >
          {status === 'running' ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
          {status === 'running' ? 'Migrando datos...' : 'Iniciar migración de datos antiguos'}
        </button>

        {status === 'completed' && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4" /> ¡Migración exitosa! {totalMigrated} docs copiados
          </span>
        )}
      </div>

      {/* Real-time collection checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {COLLECTIONS.map(colName => {
          const item = progress[colName];
          return (
            <div
              key={colName}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm"
            >
              <div className="flex items-center gap-2">
                {item.status === 'pending' && <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />}
                {item.status === 'migrating' && <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />}
                {item.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {item.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                <span className="font-medium text-gray-700 dark:text-gray-300 font-mono">{colName}</span>
              </div>
              <div className="text-xs text-gray-500 font-mono">
                {item.status === 'success' && `${item.total}/${item.total} copiados ✅`}
                {item.status === 'migrating' && `${item.processed}/${item.total || '?'} copiando...`}
                {item.status === 'pending' && 'En espera'}
                {item.status === 'error' && (
                  <span className="text-red-500" title={item.errorMsg}>Error ❌</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Logging Console output */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 font-mono uppercase tracking-wider">Consola de progreso:</p>
        <div className="bg-gray-950 text-emerald-400 p-4 rounded-lg font-mono text-[11px] max-h-48 overflow-y-auto space-y-1 shadow-inner border border-gray-850">
          {generalLog.length === 0 ? (
            <span className="text-gray-500 italic">Listo para iniciar. Ningún log registrado aún.</span>
          ) : (
            generalLog.map((log, index) => (
              <div key={index} className="leading-relaxed border-b border-gray-900/40 pb-0.5">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// src/lib/firebase/server.ts
export const runtime = "nodejs"; // por si este archivo se importa en rutas
import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

let app: App | undefined;

// Lee service account desde variable de entorno (Railway)
function loadServiceAccount() {
  console.log("🔍 Verificando variables de entorno disponibles...");
  console.log("Variables con FIREBASE:", Object.keys(process.env).filter(key => key.includes('FIREBASE')));

  const rawEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  console.log("Valor de FIREBASE_SERVICE_ACCOUNT_KEY:", rawEnv ? "Presente (" + rawEnv.length + " caracteres)" : "NO PRESENTE");

  if (!rawEnv) {
    console.error("❌ FIREBASE_SERVICE_ACCOUNT_KEY no está configurada en Railway");
    console.error("Variables de entorno disponibles:", Object.keys(process.env));
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY no encontrada. Configúrala en las variables de entorno de Railway");
  }

  if (rawEnv.length < 100) {
    console.error("❌ FIREBASE_SERVICE_ACCOUNT_KEY parece estar truncada:", rawEnv);
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY está truncada. Railway limita el tamaño de las variables.");
  }

  try {
    console.log("🔄 Intentando parsear FIREBASE_SERVICE_ACCOUNT_KEY...");
    const parsed = JSON.parse(rawEnv);
    console.log("✅ Credenciales cargadas exitosamente desde variable de entorno");
    console.log("Project ID:", parsed.project_id);

    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      // repara "\n" escapados si vinieron así
      privateKey: String(parsed.private_key).replace(/\\n/g, "\n"),
    };
  } catch (e) {
    console.error("❌ Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:", e instanceof Error ? e.message : String(e));
    console.error("Contenido recibido (primeros 200 chars):", rawEnv.substring(0, 200));
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY está malformada. Verifica que el JSON sea válido");
  }
}

try {
  if (!getApps().length) {
    const svc = loadServiceAccount();
    app = initializeApp({ credential: cert(svc) });
  } else {
    app = getApps()[0];
  }
} catch (e) {
  console.error("[Firebase Admin] Error al inicializar (modular):", e);
  app = undefined;
}

export const db = app ? getFirestore(app) : null;
export const authAdmin = app ? getAuth(app) : null;

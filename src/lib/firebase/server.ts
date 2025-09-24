// src/lib/firebase/server.ts
export const runtime = "nodejs"; // por si este archivo se importa en rutas
import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

let app: App | undefined;

// Lee service account desde archivo o desde variable:
// - Preferimos variable de entorno para Railway
function loadServiceAccount() {
  // Primero intenta con variable de entorno (Railway)
  const rawEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (rawEnv) {
    try {
      const parsed = JSON.parse(rawEnv);
      return {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        // repara "\n" escapados si vinieron así
        privateKey: String(parsed.private_key).replace(/\\n/g, "\n"),
      };
    } catch (e) {
      console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:", e);
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY malformado");
    }
  }

  // Fallback: archivo local (desarrollo)
  const cfgPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (cfgPath) {
    try {
      const abs = path.resolve(process.cwd(), cfgPath);
      const raw = fs.readFileSync(abs, "utf8");
      const json = JSON.parse(raw);
      return {
        projectId: json.project_id,
        clientEmail: json.client_email,
        privateKey: json.private_key, // ya viene con saltos reales
      };
    } catch (e) {
      console.error("Error reading service account file:", e);
      throw new Error("Archivo de service account no encontrado o inválido");
    }
  }

  throw new Error("No hay credenciales: configura FIREBASE_SERVICE_ACCOUNT_KEY en Railway");
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

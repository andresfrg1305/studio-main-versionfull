// src/lib/firebase/server.ts
export const runtime = "nodejs"; // por si este archivo se importa en rutas
import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

let app: App | undefined;

// Lee service account desde archivo o desde variable:
// - Preferimos archivo: FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccount.local.json
function loadServiceAccount() {
  const cfgPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (cfgPath) {
    const abs = path.resolve(process.cwd(), cfgPath);
    const raw = fs.readFileSync(abs, "utf8");
    const json = JSON.parse(raw);
    return {
      projectId: json.project_id,
      clientEmail: json.client_email,
      privateKey: json.private_key, // ya viene con saltos reales
    };
  }

  // Fallback: variable en una sola línea
  const rawEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!rawEnv) throw new Error("No hay credenciales: ni PATH ni KEY en variables de entorno");
  const parsed = JSON.parse(rawEnv);
  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    // repara "\n" escapados si vinieron así
    privateKey: String(parsed.private_key).replace(/\\n/g, "\n"),
  };
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

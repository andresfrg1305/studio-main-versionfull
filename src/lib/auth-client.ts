"use client";

import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export async function loginAndEnsureProfile(email: string, password: string) {
  // Inicia sesión
  const cred = await signInWithEmailAndPassword(auth!, email, password || "");

  const uid = cred.user.uid;
  const ref = doc(db!, "profiles", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      id: uid,
      email: cred.user.email ?? email,
      fullName: cred.user.displayName ?? email.split("@")[0],
      role: "resident",
      phone: "",
      interiorNumber: 0,
      houseNumber: "",
      createdAt: serverTimestamp(),
    });
    return "resident" as const;
  } else {
    const data = snap.data() as { role?: string };
    return (data.role ?? "resident") as "admin" | "resident";
  }
}

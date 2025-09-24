"use server";

import { z } from "zod";
import { db, authAdmin } from "@/lib/firebase/server";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(3),
  phone: z.string().optional().default(""),
  interiorNumber: z.coerce.number().int().nonnegative().default(0),
  houseNumber: z.string().optional().default(""),
  role: z.enum(["resident", "admin"]).default("resident"),
  vehicle: z
    .object({
      licensePlate: z.string().min(3),
      brand: z.string().optional().default(""),
      model: z.string().optional().default(""),
      color: z.string().optional().default(""),
    })
    .optional(),
});

// Utilidad para serializar errores del Admin SDK
function explainError(e: any): string {
  const code = e?.code || e?.errorInfo?.code;
  const msg = e?.message || e?.errorInfo?.message || "Error desconocido";
  if (code === "auth/email-already-exists") return "El correo ya está registrado.";
  if (code === "auth/invalid-password") return "La contraseña temporal no cumple la política.";
  if (code === "auth/invalid-email") return "El correo no es válido.";
  if (code === "auth/operation-not-allowed") return "Habilita Email/Password en Firebase Authentication.";
  return `${code ?? "error"}: ${msg}`;
}

export async function createResident(input: z.infer<typeof schema>) {
  if (!db || !authAdmin) return { ok: false, error: "Firebase Admin no inicializado" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };
  const data = parsed.data;

  try {
    // 1) Crear usuario en Auth
    const user = await authAdmin.createUser({
      email: data.email,
      password: data.password,
      displayName: data.fullName,
      emailVerified: false,
      disabled: false,
    });

    // 2) Perfil
    await db.collection("profiles").doc(user.uid).set({
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      phone: data.phone,
      interiorNumber: data.interiorNumber,
      houseNumber: data.houseNumber,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 3) Vehículo (opcional)
    if (data.vehicle) {
      await db.collection("vehicles").add({
        userId: user.uid,
        licensePlate: data.vehicle.licensePlate.toUpperCase(),
        brand: data.vehicle.brand,
        model: data.vehicle.model,
        color: data.vehicle.color,
        active: true,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    revalidatePath("/admin/residents");
    return { ok: true, uid: user.uid };
  } catch (e: any) {
    // Si el correo ya existe, completa/actualiza el perfil + vehículo
    if (e?.code === "auth/email-already-exists") {
      const existing = await authAdmin.getUserByEmail(data.email);

      await db.collection("profiles").doc(existing.uid).set(
        {
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          phone: data.phone,
          interiorNumber: data.interiorNumber,
          houseNumber: data.houseNumber,
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      if (data.vehicle) {
        await db.collection("vehicles").add({
          userId: existing.uid,
          licensePlate: data.vehicle.licensePlate.toUpperCase(),
          brand: data.vehicle.brand,
          model: data.vehicle.model,
          color: data.vehicle.color,
          active: true,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      revalidatePath("/admin/residents");
      return { ok: true, uid: existing.uid, info: "Usuario ya existía en Auth" };
    }

    // Devuelve el error real para que lo veas en el toast
    console.error("[createResident] error:", e);
    return { ok: false, error: explainError(e) };
  }
}


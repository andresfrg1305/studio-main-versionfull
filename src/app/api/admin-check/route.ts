export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/server";

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({
        ok: false,
        why: "db_null",
        hasEnv: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY),
        envStartsWith: process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.slice(0, 40) ?? null,
      }, { status: 500 });
    }
    const cols = await db.listCollections().then(cs => cs.map(c => c.id));
    return NextResponse.json({ ok: true, project: "gestionaph", collections: cols });
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(session.user as any).id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword || String(newPassword).length < 6) {
      return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
    if (!user) {
      return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    }

    const ok = await bcrypt.compare(String(currentPassword), user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Password attuale errata" }, { status: 400 });
    }

    const newHash = await bcrypt.hash(String(newPassword), 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash, mustChangePassword: false },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        entityType: "USER",
        entityId: user.id,
        action: "CHANGE_PASSWORD",
        payload: {},
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { tempPassword } = await req.json().catch(() => ({} as any));
  const pw = String(tempPassword || "CambioSubito!123");
  const hash = await bcrypt.hash(pw, 10);

  try {
    await prisma.user.update({
      where: { id: params.id },
      data: { passwordHash: hash, mustChangePassword: true },
    });
    return NextResponse.json({ ok: true, tempPassword: pw });
  } catch (e) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }
}

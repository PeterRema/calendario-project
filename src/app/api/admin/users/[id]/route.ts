import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetId = params.id;
  const selfId = (session.user as any).id as string;
  if (targetId === selfId) {
    return NextResponse.json({ error: "Non puoi eliminare te stesso" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id: targetId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }
}

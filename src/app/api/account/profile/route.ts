import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { id: true, name: true, email: true, role: true, mustChangePassword: true, createdAt: true },
  });
  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Nome non valido" }, { status: 400 });
  const updated = await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { name },
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json(updated);
}

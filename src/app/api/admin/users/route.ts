import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, mustChangePassword: true, createdAt: true },
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { name, email, role, tempPassword } = await req.json();
  if (!name || !email) return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
  const pw = String(tempPassword || "CambioSubito!123");
  const hash = await bcrypt.hash(pw, 10);
  try {
    const created = await prisma.user.create({
      data: {
        name: String(name),
        email: String(email),
        role: role === "ADMIN" ? "ADMIN" : "USER",
        passwordHash: hash,
        mustChangePassword: true,
      },
      select: { id: true, name: true, email: true, role: true, mustChangePassword: true, createdAt: true },
    });
    return NextResponse.json({ user: created, tempPassword: pw }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Email già esistente" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}

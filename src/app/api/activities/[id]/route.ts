
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activity = await prisma.activity.findFirst({
    where: { id: params.id, userId: (session.user as any).id },
  });
  if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(activity);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, startDate, endDate, note } = body || {};

  // Ensure ownership
  const existing = await prisma.activity.findFirst({
    where: { id: params.id, userId: (session.user as any).id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.activity.update({
    where: { id: params.id },
    data: {
      ...(type ? { type } : {}),
      ...(startDate ? { startDate: new Date(String(startDate)) } : {}),
      ...(endDate ? { endDate: new Date(String(endDate)) } : {}),
      note: note === undefined ? existing.note : note ? String(note) : null,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ensure ownership
  const existing = await prisma.activity.findFirst({
    where: { id: params.id, userId: (session.user as any).id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.activity.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

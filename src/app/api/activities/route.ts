import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;
  const start = searchParams.get("start") || undefined;
  const end = searchParams.get("end") || undefined;

  // Show activities of ALL users (visibility), not just own
  const where: any = {};
  if (type) where.type = type as any;
  if (start || end) where.startDate = {};
  if (start) where.startDate.gte = new Date(start);
  if (end) where.startDate.lte = new Date(end);

  const activities = await prisma.activity.findMany({
    where,
    orderBy: { startDate: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(activities);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Non autorizzato. Effettua il login." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    
    // Verifica che l'utente esista nel database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ 
        error: "Utente non trovato. Potrebbe essere necessario effettuare nuovamente il login." 
      }, { status: 404 });
    }

    const body = await req.json();
    const { type, startDate, endDate, note } = body || {};
    
    if (!type || !startDate || !endDate) {
      return NextResponse.json({ error: "Dati mancanti: tipo, data di inizio e fine sono obbligatori" }, { status: 400 });
    }

    // Verifica che il tipo di attività sia valido
    const allowedTypes = ["FERIE", "USCITA", "MALATTIA", "PERMESSO", "RIUNIONE"] as const;
    if (!allowedTypes.includes(String(type) as any)) {
      return NextResponse.json({ error: "Tipo di attività non valido" }, { status: 400 });
    }

    const activity = await prisma.activity.create({
      data: {
        userId: user.id,
        type,
        startDate: new Date(String(startDate)),
        endDate: new Date(String(endDate)),
        note: note ? String(note) : null,
      },
    });
    
    return NextResponse.json(activity, { status: 201 });
    
  } catch (error) {
    console.error('Errore durante la creazione dell\'attività:', error);
    
    // Controlla se è un errore di Prisma con codice P2003
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return NextResponse.json({ 
        error: "Errore di riferimento: l'utente specificato non esiste" 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Si è verificato un errore durante il salvataggio dell'attività" 
    }, { status: 500 });
  }
}

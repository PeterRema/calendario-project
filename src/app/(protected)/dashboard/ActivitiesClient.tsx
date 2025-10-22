"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ACTIVITY_TYPES = [
  { value: "FERIE", label: "Ferie" },
  { value: "USCITA", label: "Uscita" },
  { value: "MALATTIA", label: "Malattia" },
  { value: "PERMESSO", label: "Permesso" },
  { value: "RIUNIONE", label: "Riunione" },
];

type Activity = {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  note?: string | null;
  user?: { id: string; name: string; email: string };
};

export default function ActivitiesClient() {
  const { data: session } = useSession();
  const myId = (session?.user as any)?.id as string | undefined;
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: "FERIE", start: "", startTime: "", end: "", endTime: "", note: "" });
  const [filters, setFilters] = useState({ type: "ALL", start: "", end: "" });

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.type && filters.type !== "ALL") params.set("type", filters.type);
    if (filters.start) params.set("start", filters.start);
    if (filters.end) params.set("end", filters.end);
    const res = await fetch(`/api/activities?${params.toString()}`);
    const data = await res.json().catch(() => []);
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.start || !form.end) return;
    
    // Aggiungi il timezone per assicurarti che le date siano interpretate correttamente
    const startIso = `${form.start}${form.startTime ? `T${form.startTime}:00.000` : "T00:00:00.000"}Z`;
    const endIso = `${form.end}${form.endTime ? `T${form.endTime}:59.999` : "T23:59:59.999"}Z`;
    
    const startDt = new Date(startIso);
    const endDt = new Date(endIso);
    
    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime()) || startDt.getTime() > endDt.getTime()) {
      alert("Controlla date e orari: l'inizio deve essere prima o uguale alla fine.");
      return;
    }
    
    try {
      const requestBody = {
        type: form.type,
        startDate: startDt.toISOString(),
        endDate: endDt.toISOString(),
        note: form.note || undefined,
      };
      
      console.log('Invio richiesta al server:', {
        url: '/api/activities',
        method: 'POST',
        body: requestBody
      });
      
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Risposta dal server:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        let errorResponse;
        try {
          errorResponse = await response.text();
          console.error('Errore dal server (testo):', errorResponse);
          // Prova a parsare come JSON
          const jsonError = JSON.parse(errorResponse);
          console.error('Errore dal server (JSON):', jsonError);
          throw new Error(jsonError.error || jsonError.message || 'Errore durante il salvataggio');
        } catch (e) {
          console.error('Errore nel parsing della risposta di errore:', e);
          throw new Error(`Errore ${response.status}: ${response.statusText}. Dettagli: ${errorResponse || 'Nessun dettaglio aggiuntivo'}`);
        }
      }
      
      setForm({ type: form.type, start: "", startTime: "", end: "", endTime: "", note: "" });
      await load();
    } catch (error) {
      console.error('Errore:', error);
      alert('Si è verificato un errore durante il salvataggio. Controlla la console per i dettagli.');
    }
  };

  const onDelete = async (id: string) => {
    await fetch(`/api/activities/${id}`, { method: "DELETE" });
    await load();
  };

  const onFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    await load();
  };

  const rows = useMemo(() => (Array.isArray(items) ? items.map((a) => ({
    ...a,
    start: new Date(a.startDate).toLocaleString(),
    end: new Date(a.endDate).toLocaleString(),
  })) : []), [items]);

  return (
    <div className="grid gap-6 min-w-0">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Nuova attività</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          <form onSubmit={onCreate} className="grid gap-3 md:gap-3 w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-7 items-stretch min-w-0">
            <div className="grid gap-2 lg:col-span-1 min-w-0">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger className="rounded-full w-full"><SelectValue placeholder="Seleziona tipo" /></SelectTrigger>
                <SelectContent>{ACTIVITY_TYPES.map(t => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 lg:col-span-1 min-w-0">
              <Label>Inizio</Label>
              <Input className="w-full" type="date" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} />
            </div>
            <div className="grid gap-2 lg:col-span-1 min-w-0">
              <Label>Ora</Label>
              <Input className="w-full" type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div className="grid gap-2 lg:col-span-1 min-w-0">
              <Label>Fine</Label>
              <Input className="w-full" type="date" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} />
            </div>
            <div className="grid gap-2 lg:col-span-1 min-w-0">
              <Label>Ora</Label>
              <Input className="w-full" type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
            </div>
            <div className="grid gap-2 md:col-span-3 lg:col-span-2 min-w-0">
              <Label>Note</Label>
              <Input className="w-full" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Opzionale" />
            </div>
            <div className="md:col-span-3 lg:col-span-1 mt-1 md:mt-0 flex md:justify-start lg:justify-end">
              <Button type="submit" size="sm" className="rounded-full">Salva</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Storico attività</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          <form onSubmit={onFilter} className="mb-4 grid gap-3 md:gap-3 w-full grid-cols-1 md:grid-cols-4 lg:grid-cols-6 items-stretch min-w-0">
            <div className="grid gap-2 lg:col-span-2 min-w-0">
              <Label>Tipo</Label>
              <Select value={filters.type} onValueChange={(v) => setFilters((f) => ({ ...f, type: v }))}>
                <SelectTrigger className="rounded-full w-full"><SelectValue placeholder="Tutti" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tutti</SelectItem>
                  {ACTIVITY_TYPES.map(t => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 lg:col-span-2 min-w-0">
              <Label>Da</Label>
              <Input className="w-full" type="date" value={filters.start} onChange={(e) => setFilters((f) => ({ ...f, start: e.target.value }))} />
            </div>
            <div className="grid gap-2 lg:col-span-2 min-w-0">
              <Label>A</Label>
              <Input className="w-full" type="date" value={filters.end} onChange={(e) => setFilters((f) => ({ ...f, end: e.target.value }))} />
            </div>
            <div className="md:col-span-2 lg:col-span-1" />
            <div className="md:col-span-2 lg:col-span-1 mt-1 md:mt-0 flex md:justify-start lg:justify-end">
              <Button type="submit" size="sm" variant="secondary" className="rounded-full">Filtra</Button>
            </div>
          </form>

          <div className="overflow-x-auto min-w-0">
          <Table className="text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>Utente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Inizio</TableHead>
                <TableHead className="hidden md:table-cell">Fine</TableHead>
                <TableHead className="hidden md:table-cell">Note</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{a.user?.name ?? a.user?.email ?? ""}</TableCell>
                  <TableCell>{ACTIVITY_TYPES.find(t => t.value === a.type)?.label ?? a.type}</TableCell>
                  <TableCell>{a.start}</TableCell>
                  <TableCell className="hidden md:table-cell">{a.end}</TableCell>
                  <TableCell className="hidden md:table-cell break-words">{a.note ?? ""}</TableCell>
                  <TableCell className="text-right">
                    {a.user?.id === myId && (
                      <Button size="sm" variant="destructive" className="rounded-full" onClick={() => onDelete(a.id)}>Elimina</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">Nessuna attività</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

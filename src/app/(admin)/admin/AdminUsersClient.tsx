"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  mustChangePassword: boolean;
  createdAt: string;
}

export default function AdminUsersClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "USER" as "ADMIN" | "USER", tempPassword: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setErr(errData?.error || "Errore caricamento utenti");
        setUsers([]);
      } else {
        const data = await res.json().catch(() => []);
        setUsers(Array.isArray(data) ? data : []);
        setErr(null);
      }
    } catch (e) {
      setErr("Errore di rete nel caricamento utenti");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data?.error || "Errore creazione utente");
      return;
    }
    setMsg(`Utente creato. Password temporanea: ${data.tempPassword}`);
    setForm({ name: "", email: "", role: "USER", tempPassword: "" });
    await load();
  };

  const onReset = async (id: string) => {
    setMsg(null);
    setErr(null);
    const res = await fetch(`/api/admin/users/${id}/reset-password`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data?.error || "Errore reset password");
      return;
    }
    setMsg(`Password temporanea aggiornata: ${data.tempPassword}`);
  };

  const onDelete = async (id: string) => {
    setMsg(null);
    setErr(null);
    const ok = confirm("Eliminare definitivamente questo utente? Questa azione non è reversibile.");
    if (!ok) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data?.error || "Errore eliminazione utente");
      return;
    }
    await load();
    setMsg("Utente eliminato");
  };

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Nuovo utente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="grid gap-2">
              <Label>Ruolo</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as any }))}>
                <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Password temporanea (opzionale)</Label>
              <Input value={form.tempPassword} onChange={(e) => setForm((f) => ({ ...f, tempPassword: e.target.value }))} placeholder="Di default: CambioSubito!123" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="rounded-full">Crea utente</Button>
            </div>
            {msg && <p className="text-sm text-green-700 md:col-span-2">{msg}</p>}
            {err && <p className="text-sm text-red-600 md:col-span-2">{err}</p>}
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Utenti</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ruolo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(users) ? users : []).map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.mustChangePassword ? "Cambio password richiesto" : "OK"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="secondary" className="rounded-full" onClick={() => onReset(u.id)}>Reset</Button>
                    <Button size="sm" variant="destructive" className="rounded-full" onClick={() => onDelete(u.id)}>Elimina</Button>
                  </TableCell>
                </TableRow>
              ))}
              {Array.isArray(users) && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">Nessun utente</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

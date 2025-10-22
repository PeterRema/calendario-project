"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch("/api/account/profile");
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setName(data?.name ?? "");
        setEmail(data?.email ?? "");
      }
      setLoading(false);
    };
    load();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);
    const res = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setErr(data?.error || "Errore salvataggio");
      return;
    }
    setMsg("Profilo aggiornato");
  };

  return (
    <div className="p-6">
      <Card className="rounded-2xl max-w-xl">
        <CardHeader>
          <CardTitle>Profilo</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Caricamento...</p>
          ) : (
            <form onSubmit={onSave} className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm" htmlFor="name">Nome</label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <label className="text-sm" htmlFor="email">Email</label>
                <Input id="email" value={email} disabled />
              </div>
              {err && <p className="text-sm text-red-600">{err}</p>}
              {msg && <p className="text-sm text-green-700">{msg}</p>}
              <div className="flex gap-3">
                <Button type="submit" disabled={saving} className="rounded-full">Salva</Button>
                <Button type="button" variant="secondary" className="rounded-full" onClick={() => location.assign('/account/change-password')}>Cambia password</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  return (
    <div className="p-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Amministrazione</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Ciao {user?.name ?? "Admin"}. Qui gestirai utenti e panoramica attività.</p>
          <p className="text-sm text-muted-foreground mt-2">Funzioni: creazione utenti, reset password, vista aggregata attività (in arrivo).</p>
        </CardContent>
      </Card>

      <div className="mt-6">
        <AdminUsersClient />
      </div>
    </div>
  );
}

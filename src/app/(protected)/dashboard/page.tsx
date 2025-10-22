import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ActivitiesClient from "./ActivitiesClient";
import CalendarView from "./CalendarView";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  return (
    <div className="p-6">
      <div className="mt-6">
        <CalendarView />
      </div>

      <div className="mt-6">
        <ActivitiesClient />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { it } from "date-fns/locale";

const TYPE_LABEL: Record<string, string> = {
  FERIE: "Ferie",
  USCITA: "Uscita",
  MALATTIA: "Malattia",
  PERMESSO: "Permesso",
  RIUNIONE: "Riunione",
};

const TYPE_COLOR: Record<string, string> = {
  FERIE: "bg-green-500",
  USCITA: "bg-blue-500",
  MALATTIA: "bg-red-500",
  PERMESSO: "bg-amber-500",
  RIUNIONE: "bg-violet-500",
};

type Activity = {
  id: string;
  type: keyof typeof TYPE_LABEL;
  startDate: string;
  endDate: string;
  user?: { id: string; name: string; email: string };
};

function eachDay(start: Date, end: Date) {
  const days: Date[] = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cur <= last) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export default function CalendarView() {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const today = new Date();
  const minDate = new Date(2025, 0, 1);
  const initialMonth = today >= minDate ? today : minDate;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch("/api/activities");
      const data = await res.json().catch(() => []);
      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    load();
  }, []);

  const modifiers = useMemo(() => {
    const map: Record<string, Date[]> = {};
    if (!Array.isArray(items)) return map;
    for (const a of items) {
      const s = new Date(a.startDate);
      const e = new Date(a.endDate);
      const key = a.type as string;
      const dates = eachDay(s, e);
      map[key] = [...(map[key] || []), ...dates];
    }
    return map;
  }, [items]);
  const dayEntries = useMemo(() => {
    // map yyyy-mm-dd -> list of { type, user }
    const map: Record<string, Array<{ type: string; who: string }>> = {};
    const keyOf = (d: Date) => d.toISOString().slice(0, 10);
    for (const a of items) {
      for (const d of eachDay(new Date(a.startDate), new Date(a.endDate))) {
        const k = keyOf(d);
        const who = a.user?.name || a.user?.email || "";
        (map[k] ||= []).push({ type: a.type, who });
      }
    }
    return map;
  }, [items]);

  const modifiersClassNames = useMemo(() => {
    const classes: Record<string, string> = {};
    for (const key of Object.keys(TYPE_COLOR)) {
      classes[key] = `${TYPE_COLOR[key]} text-white`;
    }
    return classes;
  }, []);

  return (
    <Card className="rounded-2xl">
      <CardContent>
        <div className="flex flex-col md:flex-row items-start md:justify-center gap-6 md:gap-10">
          <div className="mx-auto w-full max-w-3xl">
            <DayPicker
              mode="single"
              captionLayout="dropdown"
              numberOfMonths={1}
              pagedNavigation
              showOutsideDays
              className="text-base md:text-xl [&_.rdp-day]:w-9 [&_.rdp-day]:h-9 [&_.rdp-day_button]:w-9 [&_.rdp-day_button]:h-9 md:[&_.rdp-day]:w-10 md:[&_.rdp-day]:h-10 md:[&_.rdp-day_button]:w-10 md:[&_.rdp-day_button]:h-10 [&_.rdp-day_today_.rdp-day_button]:border-2 [&_.rdp-day_today_.rdp-day_button]:border-blue-500 [&_.rdp-day_today_.rdp-day_button]:rounded-full"
              locale={it}
              fromDate={new Date(2025, 0, 1)}
              fromYear={2025}
              toYear={2099}
              defaultMonth={initialMonth}
              selected={selected}
              onSelect={setSelected}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
            />
          </div>
          <div className="grid w-full md:w-72 gap-3 shrink-0">
            <div className="grid gap-2 max-w-md mx-auto md:mx-0 w-full">
              <div className="text-sm text-muted-foreground">Legenda</div>
              {Object.entries(TYPE_LABEL).map(([key, label]) => (
                <div className="flex items-center gap-2" key={key}>
                  <span className={`inline-block size-3 rounded-full ${TYPE_COLOR[key]}`}></span>
                  <span className="text-sm">{label}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {items.filter((a) => a.type === key).length}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="grid gap-2 max-w-md mx-auto md:mx-0 w-full">
              <div className="text-sm text-muted-foreground">Dettagli giorno</div>
              <div className="rounded-lg border p-3 text-sm min-h-24">
                {(() => {
                  const key = selected ? selected.toISOString().slice(0, 10) : undefined;
                  const entries = key ? dayEntries[key] : undefined;
                  if (!entries || entries.length === 0) return <span className="text-muted-foreground">Nessuna attività</span>;
                  return (
                    <ul className="space-y-1">
                      {entries.map((e, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className={`inline-block size-2.5 rounded-full ${TYPE_COLOR[e.type]}`}></span>
                          <span>{TYPE_LABEL[e.type as keyof typeof TYPE_LABEL] ?? e.type}</span>
                          <span className="text-muted-foreground">– {e.who}</span>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

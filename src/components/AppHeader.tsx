"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import HeaderActions from "@/components/HeaderActions";

export default function AppHeader() {
  const pathname = usePathname();
  if (pathname === "/login") return null;
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Image src="/logo.svg" alt="Logo" width={180} height={44} priority />
        <div className="text-lg font-semibold">Calendario disponibilità</div>
        <HeaderActions />
      </div>
    </header>
  );
}

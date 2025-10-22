"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, User, KeyRound } from "lucide-react";
import { useSession } from "next-auth/react";

export default function HeaderActions() {
  const router = useRouter();
  const { data, status } = useSession();
  if (status !== "authenticated") return null;
  const role = (data?.user as any)?.role as string | undefined;
  const homeHref = role === "ADMIN" ? "/admin" : "/dashboard";
  return (
    <div className="ml-auto flex items-center gap-2">
      <Button className="rounded-full" onClick={() => router.push(homeHref)}>Home</Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="rounded-full">Profilo</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push("/account/change-password")}>
            <KeyRound className="mr-2 size-4" /> Cambia password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="mr-2 size-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

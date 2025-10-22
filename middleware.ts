import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = new Set<string>([
  "/",
  "/login",
  "/api/auth",
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (
    pathname === "/" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-me" });

  // If no token and accessing protected pages
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/account");
  if (!token && isProtected) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  if (token) {
    const role = (token as any).role as string | undefined;
    const mustChangePassword = Boolean((token as any).mustChangePassword);

    // Force change password flow
    const isChangePwPath = pathname.startsWith("/account/change-password") || pathname.startsWith("/api/account/change-password");
    if (mustChangePassword && !isChangePwPath) {
      const url = new URL("/account/change-password", req.url);
      return NextResponse.redirect(url);
    }

    // Prevent non-admin access to /admin
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      const url = new URL("/dashboard", req.url);
      return NextResponse.redirect(url);
    }

    // Prevent logged users from visiting /login
    if (pathname === "/login") {
      const url = new URL(role === "ADMIN" ? "/admin" : "/dashboard", req.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/|favicon|icons|assets|manifest).*)",
  ],
};

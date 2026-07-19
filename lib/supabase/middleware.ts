import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const STAFF_PREFIXES = ["/dashboard", "/crm", "/clients", "/projects", "/quotes", "/invoices", "/settings"];
const CLIENT_PREFIXES = ["/client"];
const PUBLIC_PREFIXES = ["/login"];
// Reset-password briefly creates an authenticated (recovery) session before the
// user has set a new password — never bounce these away like /login does.
const AUTH_ACTION_PREFIXES = ["/forgot-password", "/reset-password"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isStaffRoute = STAFF_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
  const isClientRoute = CLIENT_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
  const isPublicRoute = PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
  const isAuthActionRoute = AUTH_ACTION_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );

  if (isAuthActionRoute) {
    return response;
  }

  if (!user && (isStaffRoute || isClientRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && (isStaffRoute || isClientRoute)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    if (isStaffRoute && role === "client") {
      const url = request.nextUrl.clone();
      url.pathname = "/client";
      return NextResponse.redirect(url);
    }

    if (isClientRoute && role !== "client") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  if (user && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

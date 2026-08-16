import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. CRITICAL BYPASS: Force an immediate native bypass for public shared preview links
  // This stops the proxy from rewriting or evaluating authentication constraints entirely.
  if (pathname.startsWith("/shared/")) {
    return NextResponse.next();
  }

  // --- Rest of your original standard proxy logic ---
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = pathname === "/login";
  const isVerifyPage = pathname === "/login/verify";
  const otpVerified =
    request.cookies.get("posthinks_otp_verified")?.value === "true";

  // Core Guardrails
  if (!user) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  // User is authenticated but needs OTP verification
  if (!otpVerified) {
    if (!isVerifyPage) {
      return NextResponse.redirect(new URL("/login/verify", request.url));
    }
  } else {
    // User is fully authenticated and verified
    if (isLoginPage || isVerifyPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

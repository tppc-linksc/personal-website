import { NextRequest, NextResponse } from "next/server";
import { verifyStudioSession, STUDIO_SESSION_COOKIE } from "@/lib/studio-auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/studio") && !pathname.startsWith("/studio/login")) {
    const session = request.cookies.get(STUDIO_SESSION_COOKIE)?.value;
    const isAuthenticated = await verifyStudioSession(session);

    if (!isAuthenticated) {
      const loginUrl = new URL("/studio/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/content")) {
    const session = request.cookies.get(STUDIO_SESSION_COOKIE)?.value;
    const isAuthenticated = await verifyStudioSession(session);

    if (!isAuthenticated) {
      const loginUrl = new URL("/studio/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/content/:path*"],
};

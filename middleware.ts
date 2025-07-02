import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // 임시: 로그인 여부는 쿠키 'logged_in'으로 판단 (실제 서비스에서는 세션/토큰 등 사용)
  const isLoggedIn = request.cookies.get('logged_in')?.value === 'true';
  const isOnboarded = request.cookies.get('onboarded')?.value === 'true';

  // 보호 라우트: /logs, /onboarding
  if (pathname.startsWith('/logs')) {
    if (!isLoggedIn) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    if (!isOnboarded) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  }
  if (pathname.startsWith('/onboarding')) {
    if (!isLoggedIn) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    // 온보딩 완료 시 /logs로 이동
    if (isOnboarded) {
      const url = request.nextUrl.clone();
      url.pathname = '/logs';
      return NextResponse.redirect(url);
    }
  }
  if (pathname.startsWith('/login')) {
    if (isLoggedIn && isOnboarded) {
      const url = request.nextUrl.clone();
      url.pathname = '/logs';
      return NextResponse.redirect(url);
    }
    if (isLoggedIn && !isOnboarded) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/logs/:path*', '/onboarding/:path*', '/login'],
};

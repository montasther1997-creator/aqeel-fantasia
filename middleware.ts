import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

const ADMIN_PATH = /^\/(ar|en)\/admin(\/.*)?$/;
const LOGIN_PATH = /^\/(ar|en)\/admin\/login$/;

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Defense-in-depth: block unauthenticated requests to /admin/* in the edge,
  // BEFORE they reach the page server component. The cookie is only inspected
  // for presence here — full JWT verification still runs in `requireAdmin()`.
  if (ADMIN_PATH.test(pathname) && !LOGIN_PATH.test(pathname)) {
    const cookie = req.cookies.get('fantasia_admin');
    if (!cookie?.value) {
      const locale = pathname.split('/')[1] || 'ar';
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/admin/login`;
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return intl(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

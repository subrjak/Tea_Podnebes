import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SESSION_COOKIE = process.env.NODE_ENV === 'production'
  ? '__Host-tea_session'
  : 'tea_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const AUTH_PATHS = new Set(['login', 'register']);

const getApiBaseUrl = () => {
  const baseUrl = process.env.API_UPSTREAM_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error('API_UPSTREAM_URL is not configured.');
  }

  return baseUrl.replace(/\/+$/, '');
};

const isSameOriginRequest = (request) => {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0].trim();
  const host = forwardedHost || request.headers.get('host') || requestUrl.host;
  const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0].trim();
  const protocol = forwardedProtocol || requestUrl.protocol.slice(0, -1);
  const expectedOrigin = `${protocol}://${host}`;
  const origin = request.headers.get('origin');

  if (origin) {
    try {
      const originUrl = new URL(origin);
      return originUrl.origin === expectedOrigin;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get('referer');
  if (!referer) return false;

  try {
    return new URL(referer).origin === expectedOrigin;
  } catch {
    return false;
  }
};

const jsonError = (message, status) => NextResponse.json(
  { message },
  { status, headers: { 'Cache-Control': 'no-store' } },
);

const clearSessionCookie = (response) => {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
};

/**
 * Next.js BFF: forwards same-origin API calls to Laravel and keeps the upstream
 * bearer token in an HttpOnly cookie so browser JavaScript cannot read it.
 */
async function proxyRequest(request, context) {
  const { path = [] } = await context.params;
  const method = request.method.toUpperCase();

  if (MUTATING_METHODS.has(method) && !isSameOriginRequest(request)) {
    return jsonError('Cross-origin request rejected.', 403);
  }

  const apiPath = path.map((segment) => encodeURIComponent(segment)).join('/');
  const upstreamUrl = new URL(`${getApiBaseUrl()}/${apiPath}`);
  upstreamUrl.search = new URL(request.url).search;

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  const accept = request.headers.get('accept');

  if (contentType) headers.set('Content-Type', contentType);
  if (accept) headers.set('Accept', accept);
  if (sessionToken) headers.set('Authorization', `Bearer ${sessionToken}`);

  const hasBody = !['GET', 'HEAD'].includes(method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      cache: 'no-store',
      redirect: 'manual',
    });

    const responseHeaders = new Headers({ 'Cache-Control': 'no-store' });
    const upstreamContentType = upstreamResponse.headers.get('content-type');
    if (upstreamContentType) responseHeaders.set('Content-Type', upstreamContentType);

    const isAuthRequest = method === 'POST' && AUTH_PATHS.has(path[0]) && path.length === 1;
    if (isAuthRequest && upstreamResponse.ok) {
      const payload = await upstreamResponse.json();
      const { token, ...safePayload } = payload;

      if (typeof token !== 'string' || token.length === 0) {
        return jsonError('The API did not return an authentication token.', 502);
      }

      const response = NextResponse.json(safePayload, {
        status: upstreamResponse.status,
        headers: responseHeaders,
      });

      response.cookies.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE,
      });

      return response;
    }

    const response = new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });

    if (upstreamResponse.status === 401 && sessionToken) {
      clearSessionCookie(response);
    }

    if (method === 'POST' && path.length === 1 && path[0] === 'logout') {
      clearSessionCookie(response);
    }

    return response;
  } catch {
    const response = jsonError('The API server could not be reached.', 502);
    return method === 'POST' && path.length === 1 && path[0] === 'logout'
      ? clearSessionCookie(response)
      : response;
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;

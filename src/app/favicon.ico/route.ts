/**
 * Legacy browser favicon probe. The canonical vector icon remains /favicon.svg,
 * but browsers and crawlers may still request /favicon.ico automatically.
 */
export function GET(request: Request) {
  return Response.redirect(new URL("/favicon.svg", request.url), 308);
}

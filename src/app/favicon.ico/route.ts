/**
 * Browsers and automated clients still request /favicon.ico even when our
 * canonical icon is declared as /favicon.svg in Next metadata.
 */
export function GET(request: Request) {
  return Response.redirect(new URL("/favicon.svg", request.url), 308);
}

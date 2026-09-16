import assert from "node:assert/strict";
import test from "node:test";
import { getSiteOrigin } from "../src/content/site";

test("never uses the separate yorayriniwnl.in website as the portfolio origin", () => {
  const environment = process.env as Record<string, string | undefined>;
  const previousOrigin = environment.NEXT_PUBLIC_SITE_URL;
  const previousVercelOrigin = environment.VERCEL_PROJECT_PRODUCTION_URL;
  delete environment.VERCEL_PROJECT_PRODUCTION_URL;

  try {
    environment.NEXT_PUBLIC_SITE_URL = "https://yorayriniwnl.in";
    assert.equal(getSiteOrigin(), "https://ayush-roy-portfolio.vercel.app");

    environment.NEXT_PUBLIC_SITE_URL = "https://www.yorayriniwnl.in";
    assert.equal(getSiteOrigin(), "https://ayush-roy-portfolio.vercel.app");
  } finally {
    if (previousOrigin === undefined) delete environment.NEXT_PUBLIC_SITE_URL;
    else environment.NEXT_PUBLIC_SITE_URL = previousOrigin;
    if (previousVercelOrigin === undefined) delete environment.VERCEL_PROJECT_PRODUCTION_URL;
    else environment.VERCEL_PROJECT_PRODUCTION_URL = previousVercelOrigin;
  }
});

test("uses the Vercel production origin when the explicit origin is absent", () => {
  const environment = process.env as Record<string, string | undefined>;
  const previousOrigin = environment.NEXT_PUBLIC_SITE_URL;
  const previousVercelOrigin = environment.VERCEL_PROJECT_PRODUCTION_URL;
  const previousNodeEnv = environment.NODE_ENV;

  delete environment.NEXT_PUBLIC_SITE_URL;
  environment.VERCEL_PROJECT_PRODUCTION_URL = "ayush-portfolio-10-release.vercel.app";
  environment.NODE_ENV = "production";

  assert.equal(getSiteOrigin(), "https://ayush-portfolio-10-release.vercel.app");

  if (previousOrigin === undefined) delete environment.NEXT_PUBLIC_SITE_URL;
  else environment.NEXT_PUBLIC_SITE_URL = previousOrigin;
  if (previousVercelOrigin === undefined) delete environment.VERCEL_PROJECT_PRODUCTION_URL;
  else environment.VERCEL_PROJECT_PRODUCTION_URL = previousVercelOrigin;
  if (previousNodeEnv === undefined) delete environment.NODE_ENV;
  else environment.NODE_ENV = previousNodeEnv;
});

test("ignores the separate website value when Vercel provides its production origin", () => {
  const environment = process.env as Record<string, string | undefined>;
  const previousOrigin = environment.NEXT_PUBLIC_SITE_URL;
  const previousVercelOrigin = environment.VERCEL_PROJECT_PRODUCTION_URL;
  const previousNodeEnv = environment.NODE_ENV;

  environment.NEXT_PUBLIC_SITE_URL = "https://yorayriniwnl.in";
  environment.VERCEL_PROJECT_PRODUCTION_URL = "ayush-portfolio-10-release.vercel.app";
  environment.NODE_ENV = "production";

  assert.equal(getSiteOrigin(), "https://ayush-portfolio-10-release.vercel.app");

  if (previousOrigin === undefined) delete environment.NEXT_PUBLIC_SITE_URL;
  else environment.NEXT_PUBLIC_SITE_URL = previousOrigin;
  if (previousVercelOrigin === undefined) delete environment.VERCEL_PROJECT_PRODUCTION_URL;
  else environment.VERCEL_PROJECT_PRODUCTION_URL = previousVercelOrigin;
  if (previousNodeEnv === undefined) delete environment.NODE_ENV;
  else environment.NODE_ENV = previousNodeEnv;
});

test("ignores stale separate website values in both origin variables", () => {
  const environment = process.env as Record<string, string | undefined>;
  const previousOrigin = environment.NEXT_PUBLIC_SITE_URL;
  const previousVercelOrigin = environment.VERCEL_PROJECT_PRODUCTION_URL;
  const previousNodeEnv = environment.NODE_ENV;

  environment.NEXT_PUBLIC_SITE_URL = "https://yorayriniwnl.in";
  environment.VERCEL_PROJECT_PRODUCTION_URL = "https://yorayriniwnl.in";
  environment.NODE_ENV = "production";

  assert.equal(getSiteOrigin(), "https://ayush-roy-portfolio.vercel.app");

  if (previousOrigin === undefined) delete environment.NEXT_PUBLIC_SITE_URL;
  else environment.NEXT_PUBLIC_SITE_URL = previousOrigin;
  if (previousVercelOrigin === undefined) delete environment.VERCEL_PROJECT_PRODUCTION_URL;
  else environment.VERCEL_PROJECT_PRODUCTION_URL = previousVercelOrigin;
  if (previousNodeEnv === undefined) delete environment.NODE_ENV;
  else environment.NODE_ENV = previousNodeEnv;
});

test("uses the stable portfolio Vercel origin during a Vercel build without configured origins", () => {
  const environment = process.env as Record<string, string | undefined>;
  const previousOrigin = environment.NEXT_PUBLIC_SITE_URL;
  const previousVercelOrigin = environment.VERCEL_PROJECT_PRODUCTION_URL;
  const previousVercelMarker = environment.VERCEL;
  const previousNodeEnv = environment.NODE_ENV;

  delete environment.NEXT_PUBLIC_SITE_URL;
  delete environment.VERCEL_PROJECT_PRODUCTION_URL;
  environment.VERCEL = "1";
  environment.NODE_ENV = "production";

  assert.equal(getSiteOrigin(), "https://ayush-roy-portfolio.vercel.app");

  if (previousOrigin === undefined) delete environment.NEXT_PUBLIC_SITE_URL;
  else environment.NEXT_PUBLIC_SITE_URL = previousOrigin;
  if (previousVercelOrigin === undefined) delete environment.VERCEL_PROJECT_PRODUCTION_URL;
  else environment.VERCEL_PROJECT_PRODUCTION_URL = previousVercelOrigin;
  if (previousVercelMarker === undefined) delete environment.VERCEL;
  else environment.VERCEL = previousVercelMarker;
  if (previousNodeEnv === undefined) delete environment.NODE_ENV;
  else environment.NODE_ENV = previousNodeEnv;
});

test("requires an origin for production metadata", () => {
  const environment = process.env as Record<string, string | undefined>;
  const previousOrigin = environment.NEXT_PUBLIC_SITE_URL;
  const previousVercelOrigin = environment.VERCEL_PROJECT_PRODUCTION_URL;
  const previousVercelMarker = environment.VERCEL;
  const previousNodeEnv = environment.NODE_ENV;
  delete environment.NEXT_PUBLIC_SITE_URL;
  delete environment.VERCEL_PROJECT_PRODUCTION_URL;
  delete environment.VERCEL;
  environment.NODE_ENV = "production";

  assert.throws(() => getSiteOrigin(), /must be set for production/);

  if (previousOrigin === undefined) delete environment.NEXT_PUBLIC_SITE_URL;
  else environment.NEXT_PUBLIC_SITE_URL = previousOrigin;
  if (previousVercelOrigin === undefined) delete environment.VERCEL_PROJECT_PRODUCTION_URL;
  else environment.VERCEL_PROJECT_PRODUCTION_URL = previousVercelOrigin;
  if (previousVercelMarker === undefined) delete environment.VERCEL;
  else environment.VERCEL = previousVercelMarker;
  if (previousNodeEnv === undefined) delete environment.NODE_ENV;
  else environment.NODE_ENV = previousNodeEnv;
});

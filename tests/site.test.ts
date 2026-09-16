import assert from "node:assert/strict";
import test from "node:test";
import { getSiteOrigin } from "../src/content/site";

function withEnvironment(
  updates: Record<string, string | undefined>,
  callback: () => void,
): void {
  const environment = process.env as Record<string, string | undefined>;
  const previous = Object.fromEntries(
    Object.keys(updates).map((key) => [key, environment[key]]),
  );

  try {
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) delete environment[key];
      else environment[key] = value;
    }
    callback();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete environment[key];
      else environment[key] = value;
    }
  }
}

test("accepts the GoDaddy custom domain as the canonical origin", () => {
  withEnvironment(
    {
      NEXT_PUBLIC_SITE_URL: "https://yorayriniwnl.in",
      VERCEL_PROJECT_PRODUCTION_URL: "ayush-portfolio-10-release.vercel.app",
      VERCEL: undefined,
      NODE_ENV: "production",
    },
    () => assert.equal(getSiteOrigin(), "https://yorayriniwnl.in"),
  );
});

test("explicit custom domain wins over the Vercel production origin", () => {
  withEnvironment(
    {
      NEXT_PUBLIC_SITE_URL: "https://yorayriniwnl.in",
      VERCEL_PROJECT_PRODUCTION_URL: "ayush-portfolio-10-release.vercel.app",
      VERCEL: undefined,
      NODE_ENV: "production",
    },
    () => assert.equal(getSiteOrigin(), "https://yorayriniwnl.in"),
  );
});

test("uses the Vercel production origin when no explicit origin is configured outside a Vercel build", () => {
  withEnvironment(
    {
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_PROJECT_PRODUCTION_URL: "ayush-portfolio-10-release.vercel.app",
      VERCEL: undefined,
      NODE_ENV: "production",
    },
    () => assert.equal(getSiteOrigin(), "https://ayush-portfolio-10-release.vercel.app"),
  );
});

test("uses the custom domain during a Vercel build without configured origins", () => {
  withEnvironment(
    {
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_PROJECT_PRODUCTION_URL: undefined,
      VERCEL: "1",
      NODE_ENV: "production",
    },
    () => assert.equal(getSiteOrigin(), "https://yorayriniwnl.in"),
  );
});

test("rejects origins with credentials or unsupported protocols", () => {
  withEnvironment(
    {
      NEXT_PUBLIC_SITE_URL: "ftp://yorayriniwnl.in",
      VERCEL_PROJECT_PRODUCTION_URL: undefined,
      VERCEL: undefined,
      NODE_ENV: "production",
    },
    () => assert.throws(() => getSiteOrigin(), /must use HTTP\(S\)/),
  );

  withEnvironment(
    {
      NEXT_PUBLIC_SITE_URL: "https://user:pass@yorayriniwnl.in",
      VERCEL_PROJECT_PRODUCTION_URL: undefined,
      VERCEL: undefined,
      NODE_ENV: "production",
    },
    () => assert.throws(() => getSiteOrigin(), /without credentials/),
  );
});

test("requires an origin outside Vercel production", () => {
  withEnvironment(
    {
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_PROJECT_PRODUCTION_URL: undefined,
      VERCEL: undefined,
      NODE_ENV: "production",
    },
    () => assert.throws(() => getSiteOrigin(), /must be set for production/),
  );
});

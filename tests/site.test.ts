import assert from "node:assert/strict";
import test from "node:test";
import { getSiteOrigin } from "../src/content/site";

test("rejects the separate yorayriniwnl.in website as the portfolio origin", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://yorayriniwnl.in";
  assert.throws(() => getSiteOrigin(), /separate website/);

  process.env.NEXT_PUBLIC_SITE_URL = "https://www.yorayriniwnl.in";
  assert.throws(() => getSiteOrigin(), /separate website/);
});

test("requires an explicit origin for production metadata", () => {
  const environment = process.env as Record<string, string | undefined>;
  const previousOrigin = environment.NEXT_PUBLIC_SITE_URL;
  const previousNodeEnv = environment.NODE_ENV;
  delete environment.NEXT_PUBLIC_SITE_URL;
  environment.NODE_ENV = "production";

  assert.throws(() => getSiteOrigin(), /must be set for production/);

  if (previousOrigin === undefined) delete environment.NEXT_PUBLIC_SITE_URL;
  else environment.NEXT_PUBLIC_SITE_URL = previousOrigin;
  if (previousNodeEnv === undefined) delete environment.NODE_ENV;
  else environment.NODE_ENV = previousNodeEnv;
});

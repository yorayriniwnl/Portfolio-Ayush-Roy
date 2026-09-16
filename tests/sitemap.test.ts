import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "../src/app/sitemap";

test("sitemap contains only the recruiter-facing canonical routes", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://portfolio.example.test";
  const entries = sitemap();
  const urls = entries.map((entry) => String(entry.url));
  assert.ok(urls.includes("https://portfolio.example.test/projects"));
  for (const slug of ["portfolio", "helios", "zenith", "ai-vs-real", "talks"]) {
    assert.ok(urls.includes(`https://portfolio.example.test/projects/${slug}`));
  }
  assert.equal(urls.some((url) => url.includes("/work/")), false);
  assert.equal(urls.some((url) => url.includes("token-usage")), false);
  assert.equal(urls.some((url) => url.endsWith("/live") || url.endsWith("/source")), false);
});

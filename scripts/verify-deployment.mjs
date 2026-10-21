#!/usr/bin/env node
/**
 * Deployment integration check.
 *
 * Confirms the two deployments are alive, share a working database, and each
 * links to the other using the URLs configured at deploy time.
 *
 * Usage:
 *   npm run verify:deploy
 *   NEXT_PUBLIC_WEBSITE_URL=https://umafashions.in \
 *   NEXT_PUBLIC_STORE_URL=https://shop.umafashions.in \
 *   npm run verify:deploy -- --production
 */
import { readFileSync } from "node:fs";
import path from "node:path";

function loadEnvFile(file) {
  try {
    const content = readFileSync(file, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!match) continue;
      const key = match[1];
      if (process.env[key] !== undefined) continue;
      process.env[key] = match[2].replace(/^['"]|['"]$/g, "");
    }
  } catch {
    // No env file — rely on the process environment (CI / shell).
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env"));

const strict = process.argv.includes("--production");
const websiteUrl = (process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const storeUrl = (process.env.NEXT_PUBLIC_STORE_URL ?? "http://localhost:3001").replace(/\/$/, "");

const results = [];
function record(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function get(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "uma-deploy-check/1.0" },
      redirect: "follow",
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkHealth(name, base, expectedApp) {
  try {
    const response = await get(`${base}/api/health`);
    const body = await response.json();
    record(
      `${name} health`,
      response.ok && body.status === "ok" && body.app === expectedApp && body.database === "connected",
      `${response.status} ${body.status ?? "unknown"} / db ${body.database ?? "unknown"}`
    );
    return response.ok && body.database === "connected";
  } catch (error) {
    record(`${name} health`, false, error instanceof Error ? error.message : "unreachable");
    return false;
  }
}

async function checkCrossLink(name, fromUrl, expectedLink) {
  try {
    const response = await get(fromUrl);
    const html = await response.text();
    record(
      `${name} links to its counterpart`,
      response.ok && html.includes(expectedLink),
      response.ok ? `looking for ${expectedLink}` : `HTTP ${response.status}`
    );
  } catch (error) {
    record(`${name} cross-link`, false, error instanceof Error ? error.message : "unreachable");
  }
}

console.log(`\nUma Fashions deployment check`);
console.log(`  website: ${websiteUrl}`);
console.log(`  store:   ${storeUrl}\n`);

const websiteHealthy = await checkHealth("Website", websiteUrl, "website");
const storeHealthy = await checkHealth("Store", storeUrl, "store");

await checkCrossLink("Website", `${websiteUrl}/`, storeUrl);
await checkCrossLink("Store", `${storeUrl}/`, websiteUrl);

if (!websiteHealthy || !storeHealthy) {
  record("Shared database", false, "at least one app cannot reach PostgreSQL");
} else {
  record("Shared database", true, "both apps report a connected database");
}

if (strict) {
  const usingLocalhost = websiteUrl.includes("localhost") || storeUrl.includes("localhost");
  record("Production URLs", !usingLocalhost, usingLocalhost ? "localhost URL in production" : "custom domains configured");
  record(
    "HTTPS",
    websiteUrl.startsWith("https://") && storeUrl.startsWith("https://"),
    "both sites must be served over HTTPS"
  );
}

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length > 0) {
  console.error("\nFix the failing checks before announcing the launch.");
  process.exit(1);
}
console.log("Both deployments are in sync. ✓");

/**
 * Patches Next.js's optional-peer-dependency-resolve-plugin to be a no-op.
 *
 * The plugin (added by Next 14.2) taps the `raw-module` resolver hook to
 * provide optional peer-dependency handling. On Windows + Next 14.2.x +
 * enhanced-resolve 5.21.x it surfaces two failures during `next build`:
 *   1. "TypeError: _resolveContext_stack.delete is not a function"
 *   2. "Module not found: Recursion in resolving" against @mui/material
 *      subpaths (e.g. @mui/material/MenuItem) because the plugin re-enters
 *      the same hook on the rewritten request.
 *
 * This project's dependencies do not rely on the optional peer-dep feature,
 * so we early-return from `apply()` to bypass the plugin entirely.
 *
 * Idempotent: re-running is a no-op once the patch sentinel is present.
 */
const fs = require("fs");
const path = require("path");

const targetPath = path.join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "build",
  "webpack",
  "plugins",
  "optional-peer-dependency-resolve-plugin.js"
);

if (!fs.existsSync(targetPath)) {
  process.exit(0);
}

const SENTINEL = "PATCHED: disabled to avoid Recursion in resolving";

const current = fs.readFileSync(targetPath, "utf8");

if (current.includes(SENTINEL)) {
  process.exit(0);
}

const applyRegex =
  /apply\(resolver\) \{\n\s+const target = resolver\.ensureHook\("raw-module"\);/;

if (!applyRegex.test(current)) {
  throw new Error(
    `[patch-next-resolver] Expected pattern not found in ${targetPath}. ` +
      `The Next.js internal layout may have changed.`
  );
}

const patched = current.replace(
  applyRegex,
  [
    "apply(resolver) {",
    `        // ${SENTINEL} on Windows + Next 14.2 + enhanced-resolve 5.21.x.`,
    "        // The plugin only adds optional peer-dep handling, which is not used by this project's deps.",
    "        return;",
    '        const target = resolver.ensureHook("raw-module");',
  ].join("\n")
);

fs.writeFileSync(targetPath, patched);
console.log(
  `[patch-next-resolver] Patched ${path.relative(process.cwd(), targetPath)}`
);

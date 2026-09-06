/**
 * Lets a guard import the site's real TypeScript instead of a second copy of it.
 *
 * ⛔ WHY THIS EXISTS. `lib/procedure-pages.ts` holds the rules that decide
 * whether a price comparison page is honest — the clinic threshold, the
 * verified-only gate, what a null price means versus a zero one. A guard that
 * re-implemented any of that would be asking itself whether it agrees with
 * itself, which is the circular check this estate has already shipped twice.
 *
 * So the guard imports the module the site imports. Node 24 strips the types on
 * its own; what it cannot do is resolve the two things TypeScript resolves for
 * Next — the `@/` path alias, and an extensionless relative specifier. This
 * hook resolves exactly those two and nothing else.
 *
 * ⛔ It resolves `@/x` against the REPO ROOT, which is what tsconfig's
 * `"@/*": ["./*"]` means. Pointing it anywhere else would silently load a
 * different file than the one Next loads, and the guard would then be proving
 * things about a module that never ships.
 */
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// The extensions TypeScript would try, in the order it tries them.
const EXTS = ['.ts', '.tsx', '.mjs', '.js', '.json'];

function firstThatExists(base) {
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
  for (const ext of EXTS) {
    const candidate = base + ext;
    if (fs.existsSync(candidate)) return candidate;
  }
  for (const ext of EXTS) {
    const candidate = path.join(base, 'index' + ext);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export async function resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) {
    const hit = firstThatExists(path.join(ROOT, specifier.slice(2)));
    // ⛔ Fall through rather than inventing a URL when nothing matches: a
    // fabricated path produces a confusing ERR_MODULE_NOT_FOUND pointing at a
    // file that was never asked for.
    if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true };
  }

  if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    const hit = firstThatExists(path.resolve(parentDir, specifier));
    if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true };
  }

  return next(specifier, context);
}

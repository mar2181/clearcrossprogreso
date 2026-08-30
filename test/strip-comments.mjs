#!/usr/bin/env node
/**
 * Guard: the shared comment stripper works.
 *
 * It runs FIRST, because three other guards scan source through it. If it is
 * wrong they do not fail — they report confident nonsense, in either direction:
 * a violation that is only their own explanatory comment, or a clean bill of
 * health on a file it silently truncated.
 *
 * Both failure modes below are real and were hit during this work, not invented:
 *   - a URL in a template literal ate the rest of the file (naive `//` regex)
 *   - a quote inside a regex literal opened a string that never closed, so every
 *     block comment after `.replace(/'/g, '&#39;')` in lib/email.ts survived
 */
import { readFileSync } from 'node:fs'
import { stripComments as s } from './_strip-comments.mjs'

let failures = 0
const check = (c, m) => { console.log((c ? 'ok    ' : 'FAIL  ') + m); if (!c) failures++ }

// --- the two failures that actually happened, against the real files ---------
const email = readFileSync('lib/email.ts', 'utf8')
const outEmail = s(email)
check(!outEmail.includes("=== 'your_resend_api_key'"),
  'a string quoted only inside a comment is removed from lib/email.ts')
check(outEmail.includes('emailConfigured'), 'control: real code in lib/email.ts survives')
check(outEmail.includes('&#39;'), 'control: the string literal beside the regex survives')

const ga = readFileSync('components/analytics/GoogleAnalytics.tsx', 'utf8')
const outGa = s(ga)
check(outGa.includes('googletagmanager.com/gtag/js'),
  'a URL inside a template literal is not mistaken for a line comment')
check(!outGa.includes('deliberately NOT'), 'comment prose is removed')
check(outGa.length > ga.length * 0.4, 'control: the file was not truncated')

// --- regex literals vs division ---------------------------------------------
check(s('const a = b / c; // x').trim() === 'const a = b / c;',
  'division is not mistaken for the start of a regex')
check(s("x.replace(/'/g, 'q') /* gone */").includes("/'/g"),
  'a quote inside a regex does not open a string')
check(!s("x.replace(/'/g, 'q') /* gone */").includes('gone'),
  '...and a comment after that regex is still stripped')
check(s('const re = /[/]/; /* gone */').includes('/[/]/'),
  'a slash inside a character class does not end the regex')
check(!s('const re = /[/]/; /* gone */').includes('gone'),
  '...and the comment after THAT is stripped too')

// --- line numbers stay usable ------------------------------------------------
const nl = (t) => (t.match(/\n/g) || []).length
const sample = 'a\n/* one\ntwo\nthree */\nb\n'
check(nl(s(sample)) === nl(sample), 'block comments keep their newlines, so line numbers still line up')

console.log(failures === 0 ? '\nPASS — the stripper is sound.' : `\nFAILED — ${failures} check(s).`)
process.exit(failures === 0 ? 0 : 1)

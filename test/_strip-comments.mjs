/**
 * Strip JS/TS comments, string- and regex-aware. Shared by every guard that
 * scans source.
 *
 * ⛔ COMMENTS MUST BE STRIPPED, and this is not a nicety. Guards here look for
 * things like `es-MX`, or the old config check — strings the fix's own comments
 * deliberately QUOTE in order to explain why they were removed. A scan that reads
 * comments accuses its own explanation, and the tempting repair is to delete the
 * explanation. That has now happened three times in this repo.
 *
 * ⛔ IT MUST BE STRING-AWARE, not a `//.*$` regex. These sources contain
 * `https://www.googletagmanager.com` inside a template literal; a naive strip
 * truncates the file at that double slash, so the guard reads a file ending
 * mid-expression and reports confident nonsense.
 *
 * ⛔ AND IT MUST UNDERSTAND REGEX LITERALS, which the first version did not.
 * `lib/email.ts` contains `.replace(/'/g, '&#39;')`. Treated as division, the
 * apostrophe INSIDE that regex opens a string, the state machine never closes it,
 * and every block comment after that line survives untouched — so the guard
 * scanning that exact file reported a violation that was only its own comment.
 * Measured, not theorised: that is precisely how it failed.
 *
 * ⛔ Lives in ONE file on purpose. Three near-copies of a subtle parser is how
 * one of them gets fixed and the others quietly do not.
 */
const BACKSLASH = String.fromCharCode(92)

// `/` starts a regex only where a VALUE may begin. After an identifier, a number
// or a closing bracket it is division. This is the standard heuristic; it is not
// a full JS parser, and it does not need to be.
const BEFORE_REGEX = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^', 'r'])
const KEYWORDS_BEFORE_REGEX = ['return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'instanceof', 'new', 'do', 'else', 'yield', 'await']

function regexCanStartHere(out) {
  // Walk back over whitespace to the last significant character.
  let i = out.length - 1
  while (i >= 0 && /\s/.test(out[i])) i--
  if (i < 0) return true // start of file
  const c = out[i]
  if (c === 'r' || /[A-Za-z0-9_$)\]]/.test(c)) {
    // Could still be a keyword like `return /re/`. Check the trailing word.
    const word = (out.slice(0, i + 1).match(/[A-Za-z_$][A-Za-z0-9_$]*$/) || [''])[0]
    return KEYWORDS_BEFORE_REGEX.includes(word)
  }
  return BEFORE_REGEX.has(c)
}

export function stripComments(src) {
  let out = ''
  let i = 0
  const n = src.length
  let quote = null // ' " ` or null
  while (i < n) {
    const c = src[i]
    const d = src[i + 1]

    if (quote) {
      if (c === BACKSLASH) { out += c + (d ?? ''); i += 2; continue }
      if (c === quote) quote = null
      out += c; i++; continue
    }

    if (c === '"' || c === "'" || c === '`') { quote = c; out += c; i++; continue }

    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; continue }

    if (c === '/' && d === '*') {
      i += 2
      // Keep the newlines so reported line numbers stay meaningful.
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] === '\n') out += '\n'
        i++
      }
      i += 2; continue
    }

    // A regex literal. Consumed whole — including any quote character inside it,
    // which is the entire reason this branch exists.
    if (c === '/' && regexCanStartHere(out)) {
      out += c; i++
      let inClass = false
      while (i < n) {
        const r = src[i]
        if (r === BACKSLASH) { out += r + (src[i + 1] ?? ''); i += 2; continue }
        if (r === '[') inClass = true
        else if (r === ']') inClass = false
        else if (r === '/' && !inClass) { out += r; i++; break }
        else if (r === '\n') break // unterminated; bail rather than eat the file
        out += r; i++
      }
      continue
    }

    out += c; i++
  }
  return out
}

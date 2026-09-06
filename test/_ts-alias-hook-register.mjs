// Registers the resolver hook. Kept separate because module.register() must run
// before the module graph it affects is loaded.
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
register('./_ts-alias-hook.mjs', pathToFileURL('./test/'));

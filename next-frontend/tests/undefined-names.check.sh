#!/bin/sh
# A name used in a .jsx component but never imported or declared is an "Application error: a client-side exception" on the page that
# renders it (ReferenceError: Sparkles is not defined broke /settings). Next.js does not stop the build for it (typescript / eslint are
# switched off in next.config.mjs), so this check does: run it from next-frontend (needs node_modules):  sh tests/undefined-names.check.sh
cd "$(dirname "$0")/.." || exit 1
out=$(npx tsc --allowJs --checkJs --noEmit --jsx preserve --skipLibCheck --target es2022 --lib dom,dom.iterable,es2022 \
  --module esnext --moduleResolution bundler --strict false --noImplicitAny false $(git ls-files 'components/*.jsx' 'components/**/*.jsx' 'app/**/*.jsx') 2>&1 \
  | grep -E "TS2304|TS2552")
if [ -n "$out" ]; then echo "$out"; echo "FAIL: names used but not defined"; exit 1; fi
echo "ok: every name used in the .jsx components is defined"

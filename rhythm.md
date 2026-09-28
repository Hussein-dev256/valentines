# Repository Rhythm

This file captures the working standard for this repository so the app stays easy to maintain, safe to publish, and predictable to extend.

## Product Rhythm

- keep the core sender -> share -> receiver -> result flow intact
- preserve the dual-token model:
  - `receiver_token` for answer access
  - `sender_token` for result access
- treat local storage as convenience only, never as the source of authorization
- keep the playful product tone in the UI, but keep docs and implementation notes direct and precise

## Engineering Rhythm

- prefer targeted fixes over broad rewrites
- keep business logic in `src/services/` and route behavior in `src/pages/`
- update tests when changing token flow, answer submission, share behavior, or result handling
- keep internal docs aligned with the real code paths and route names
- when adding new behavior, document required environment variables and operational assumptions

## Security Rhythm

- do not hardcode passwords, secret keys, or fallback credentials in source
- do not log tokens, credentials, or sensitive configuration values
- only use the Supabase anon key in client-side code
- keep service-role credentials, personal notes, and exported secrets out of the repository
- prefer secure defaults: if admin configuration is missing, fail closed rather than opening access

## Git Rhythm

- commit source, tests, docs, and intentional static assets
- do not commit `.env` files, build artifacts, dependency folders, coverage output, or local deployment state
- keep `.env.example` as the only committed environment template
- review tracked files periodically with `git ls-files`
- review ignored files periodically with `git check-ignore -v <path>`

## Verification Rhythm

Before merging meaningful changes:

- run `npm run test`
- run `npm run build`
- sanity-check the main flows:
  - create a Valentine
  - share the receiver link
  - answer from the receiver route
  - reveal from the sender route
  - confirm admin access only works when `VITE_ADMIN_PASSWORD` is configured

## Documentation Rhythm

- keep `README.md` accurate for setup, routes, scripts, and deployment
- keep this file updated when repository standards change
- remove stale guidance instead of letting multiple contradictory docs accumulate

## Project Structure & Module Organization

- `src/main.tsx` is the browser entry point and `src/App.tsx` defines the
  top-level React Router routes.
- `src/pages/` contains route screens. `src/components/` contains reusable
  application components, and `src/components/ui/` contains low-level Radix
  and shadcn-style primitives.
- `src/general.ts` contains shared API functions, `src/config.ts` contains
  runtime configuration, `src/lib/` contains utilities, and `src/hooks/`
  contains reusable hooks. The `@` alias resolves to `src/`.
- `src/assets/` contains imported assets and `public/` contains files served
  directly by Vite.
- `tests/` is the only test tree. Put Vitest component tests and shared MSW
  handlers/setup there.
- `vitest.config.ts` configures jsdom and shared setup. `Dockerfile` and
  `nginx.conf` define the production SPA image.
- `Jenkinsfile` defines the multibranch CI/CD pipeline. `deploy.sh` performs
  the main-branch deployment over SSH and runs Compose from `~/web` on the
  production host.
- `dist/`, `coverage/`, `node_modules/`, and TypeScript build-info files
  are generated and must not be edited.

## Build, Test, and Development Commands

Run commands from `frontend/`:

```bash
npm ci
npm run dev
npm run build
npm run lint
npm run lint:test
npm test
npm run test:watch
```

`npm run lint:test` is the focused non-mutating lint check for test code.
After relevant JavaScript tests pass, build and smoke-test the Docker image only
when application code or runtime dependencies changed:

```bash
docker build -t taavoni-frontend:verify .
docker run --name taavoni-frontend-verify --env-file .env.example -p 8080:80 taavoni-frontend:verify
docker inspect taavoni-frontend-verify
```

Confirm the container remains running, becomes healthy, and serves the SPA.
Remove verification containers afterward. Documentation-only and test-only
changes do not require an image rebuild.

## Coding Style & Naming Conventions

- Write strict TypeScript and functional React components. Avoid `any`, unused
  values, duplicated state, and side effects during render.
- Use `PascalCase` for components and exported types, `camelCase` for
  functions, variables, props, and hooks, and `UPPER_SNAKE_CASE` for true
  constants.
- Use `use<Feature>` for hooks and match existing file naming within each
  directory.
- Follow ESLint configuration. Reuse existing UI primitives and the `cn`
  helper before adding base components.
- Keep routes in `App.tsx` and API access behind shared helpers/configuration.
- Preserve Persian copy, right-to-left behavior, semantic labels, keyboard and
  focus support, and responsive layouts.
- Never expose credentials, tokens, cookies, or server secrets in browser code,
  logs, fixtures, or environment files.

## Testing Guidelines

Write frontend tests in TypeScript with Vitest. Use React Testing Library for
rendering, user-event for interaction, and MSW for HTTP mocking.

Use these naming conventions:

- Logic files: `<feature>.test.ts`
- Component files: `<feature>.test.tsx`
- Suites: `describe('<Feature>', ...)`
- Cases: `it('does <observable behavior>', ...)`

Test user-visible behavior through the real component flow:

```text
React component
  -> GET /projects
  -> MSW response
  -> assertion about what the UI displays or does
```

Do not mock `fetch`, Axios, or shared API helpers when MSW can intercept the
request at the network boundary. Reset MSW handlers after every case, fail on
unhandled requests, and never call development or production APIs.

For each applicable new feature, test in this order:

1. Successful behavior and the returned data shown in the UI.
2. Form validation and invalid input.
3. Authentication, authorization, and permission-based visibility.
4. Loading states and backend error messages.
5. Important edge cases and previously reported bugs.

Feature tests must cover applicable interactions: login, validation, buttons
calling the correct API, permission-based hide/show behavior, tables rendering
returned data, create/edit/delete refreshing visible data, loading states, and
backend errors. Only test behaviors relevant to the feature.

Follow these rules:

- Test observable behavior, accessible names, and user interactions rather than
  private implementation, component state, CSS selectors, or snapshots.
- Keep tests independent, repeatable, and order-independent.
- Prefer `findBy*` and `waitFor` over arbitrary sleeps.
- Assert request method/path/body when an interaction sends data.
- Add a regression test whenever fixing a bug.
- Do not change production behavior merely to make a test pass; behavior-
  preserving refactoring for testability is allowed.
- Run the relevant tests and `npm run lint:test` after every change. Run the
  full suite and project lint before completion when feasible.
- Ask before installing system-wide software or changing shared infrastructure.
- Report passing tests, failures, and important behavior that remains untested.

## Commit & Pull Request Guidelines

Do not commit, push, or open a pull request unless the user requests it.

When asked to commit:

- Begin the subject with `fix:` or `add:`.
- Group files by one logical change and exclude unrelated changes.
- Do not create one commit per file unless the files are independent changes.

When asked to open a pull request:

- Explain each feature or fix separately.
- Include exact test and lint commands with their results.
- Mention known limitations and unresolved failures.

## Completion Criteria

A code-change task is complete when:

1. The requested behavior is implemented.
2. Relevant tests are added or updated.
3. Relevant tests and test lint pass.
4. The full suite and project lint run when feasible.
5. Unrelated or pre-existing failures are clearly reported.
6. No production credentials or production services were used.

In the final report, summarize changes in simple words, provide exact test and
lint commands and results, and mention anything not tested and why. If changes
are ready but unpublished, ask whether the user wants them committed and opened
as a pull request.

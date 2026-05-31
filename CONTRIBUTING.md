# Contributing

## Branch Names

Format: `<type>/<short-description>` — lowercase, hyphens only, no spaces.

| Type        | When to use                                |
| ----------- | ------------------------------------------ |
| `feat/`     | New feature                                |
| `fix/`      | Bug fix                                    |
| `chore/`    | Dependency updates, config, tooling        |
| `refactor/` | Code restructuring without behavior change |
| `docs/`     | Documentation only                         |
| `test/`     | Adding or fixing tests                     |
| `hotfix/`   | Urgent production fix                      |

Examples:

```
feat/user-authentication
fix/login-redirect-loop
chore/update-dependencies
refactor/extract-auth-middleware
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/). Format:

```
<type>(<scope>): <description>
```

- **type:** `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`, `perf`, `ci`
- **scope:** optional, lowercase — affected area (e.g. `auth`, `api`, `ui`)
- **description:** lowercase, imperative mood, no period, max 72 chars

**Good:**

```
feat(auth): add OAuth2 login with Google
fix(api): resolve pagination off-by-one error
chore: bump next to 16.2.1
refactor(ui): extract Button into shared component
```

**Bad:**

```
Fixed bug.
WIP
updated stuff
feat: Added new feature.
```

Breaking changes: add `!` after type and a `BREAKING CHANGE:` footer.

```
feat(api)!: remove deprecated v1 endpoints

BREAKING CHANGE: /api/v1/* routes no longer exist, migrate to /api/v2/*
```

## Pull Requests

- **Title:** same format as a commit message — `type(scope): description`
- **Size:** small and focused — one concern per PR. Split unrelated changes.
- **Description must include:**
  - What changed and why
  - How to test it
  - Link to related issue (if any)
  - Screenshots for any UI changes
- **Never merge your own PR** without review
- Branch must be up to date with `main` before merging

## Git Hooks

After cloning the repository, run `npm install` at the project root to install
the Husky hooks into `.husky/`.

The root hooks are:

- `pre-commit`: runs `lint-staged` against staged files.
- `pre-push`: runs `npm run quality`.

No separate package-level hook installation is required. Contributors need
Node.js and npm installed at the project root for the hook installation step.

# Release Process

How versions are bumped, changelogs generated, tags created, and release branches
managed. This is the authoritative release reference for the repository and mirrors the
`git-environment-flow` (release rules) + `github-conventions` (meta rules) Countergank
skills.

## Versioning: SemVer from commit history

Version bumps are derived from Conventional Commits since the last tag, using SemVer
priority `BREAKING > feat > fix/perf`:

| Commit pattern | Bump |
|----------------|------|
| `feat!:` or `BREAKING CHANGE:` footer | MAJOR (`1.2.3` → `2.0.0`) |
| `feat:` | MINOR (`1.2.3` → `1.3.0`) |
| `fix:` / `perf:` | PATCH (`1.2.3` → `1.2.4`) |
| only `docs`/`style`/`test`/`chore`/`build`/`ci`/`refactor` | No release — abort |

Find the last version tag:

```bash
git describe --tags --abbrev=0 --match "v*"
```

Collect commits since it and determine the bump. If no `v*` tag exists, the repo starts
at `1.0.0` and the full history is considered.

## Changelog generation

Generate the changelog from commit history per Keep a Changelog, mapping commit types to
sections:

| CHANGELOG section | Commit types |
|-------------------|--------------|
| Breaking Changes | `feat!:` / `BREAKING CHANGE:` footer |
| Added | `feat` |
| Changed | `refactor`, `perf` |
| Fixed | `fix` |
| Removed | `revert` |

Internal types (`docs`, `style`, `test`, `chore`, `build`, `ci`) are omitted from the
changelog. Format entries as `- <description> (<scope>)`. Use ISO dates
(`YYYY-MM-DD`).

## Annotated tags

Only **annotated** tags are allowed — never lightweight tags.

- `vX.Y.Z` on `main`: production release.
  ```bash
  git tag -a v1.2.0 -m "Release 1.2.0 - 2026-08-29"
  ```
- `vX.Y.Z-rcN` on `staging`: release candidate during curation.
  ```bash
  git tag -a v1.2.0-rc1 -m "RC1 1.2.0 - 2026-08-29"
  ```

The tag message includes the version, the ISO date, and (where useful) the changelog.
Ready-made tooling is provided at `.agents/skills/git-environment-flow/assets/release.sh`
(`--dry-run`, `--bump`, `--changelog`). It never auto-pushes — pushing is a manual step.

## Release branch lifecycle

```
develop ─cut─▶ release/x.y.z ─bugfixes─▶ staging (vX.Y.Z-rcN) ─approve─▶ main (vX.Y.Z) ─backmerge─▶ develop ─delete branch
```

1. **Cut** `release/x.y.z` from `develop` at scope freeze (SemVer `x.y.z`).
2. **Stabilize** — bugfixes only on the release branch.
3. **Stage** — merge to `staging`, tag `vX.Y.Z-rcN`.
4. **Release** — after staging approval, merge to `main`, tag `vX.Y.Z`.
5. **Backmerge** `main` to `develop` to keep it in sync.
6. **Cleanup** — delete the `release/x.y.z` branch. Tags remain as records.

## Deployment tracking

- GitHub Environments map `Staging` → `staging` and `Production` → `main`.
- Tags are the authoritative deployment markers and rollback targets — use tags, not
  commit SHAs:
  ```bash
  git log v1.1.0..v1.2.0 --oneline   # changelog between releases
  git checkout v1.1.0                # rollback to a previous production state
  ```

## Hotfix releases

Hotfixes bump a patch on `main` (`hotfix/*` → `main` → patch tag → backmerge to
`develop` only). See `.github/FLOW.md` for the full hotfix flow.

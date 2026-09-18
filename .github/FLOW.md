# Git Environment Flow

This repository follows a three-environment branch model. This is the authoritative
reference for how code flows between environments, which branch to target, and how
branches are protected. It mirrors the `git-environment-flow` Countergank skill.

## Environment branches

| Branch | Role | Default HEAD | Allowed merge source |
|--------|------|:---:|---------------------|
| `develop` | Default & integration branch — all feature work merges here first | Yes | Feature branches (`feat/*`, `fix/*`, `refactor/*`, ...) |
| `staging` | Pre-production mirror — curation testing before production | No | `release/*` only |
| `main` | Production source — always deployable, protected | No | `release/*` and `hotfix/*` |

## Merge direction

```
feature ─PR(squash)─▶ develop ─cut─▶ release/x.y.z ─merge─▶ staging (vX.Y.Z-rcN)
                                     │                          │
                                     └─────approve───────merge─▶ main (vX.Y.Z)
                                                                │
                                                                └──▶ develop (backmerge)
```

- **Feature → develop**: squash merge via PR. All feature work integrates here first.
- **develop → release/x.y.z**: branch cut from `develop` at scope freeze. Bugfixes only
  after cut — no new features on a release branch.
- **release/x.y.z → staging**: merge for curation testing; tag with `vX.Y.Z-rcN`.
- **release/x.y.z → main**: merge to production after staging approval; tag with
  annotated `vX.Y.Z`; then backmerge `main` to `develop` and delete the release branch.
- Feature PRs **MUST** target `develop`. Direct merges to `staging` or `main` are not
  allowed except through release or hotfix branches.

## Hotfix flow

```
main ─branch─▶ hotfix/* ─merge+tag─▶ main (vX.Y.Z patch) ─backmerge─▶ develop
```

- Branch `hotfix/*` from `main` to fix a production bug immediately.
- Merge to `main` with an annotated **patch** tag (e.g. `v1.2.0` → `v1.2.1`).
- **Backmerge to `develop` only** — do not merge the hotfix to `staging` directly.
  `staging` picks up the fix via the next release cut from `develop`.
- `hotfix/*` bypasses `staging` protection as the emergency production path.

## Branch protection

Merging into `develop`, `staging`, or `main` requires both CI and review (ADR-9):

- **Required status checks** — `quality-gates`, `e2e`, and `commitlint` must all pass before
  a PR merges. `preview` is not required.
- **Review** — at least 1 approving review with stale dismissal and last-push approval on
  all three branches. CI-checks cannot be overridden by review bypass; `enforce_admins` is
  on for all three.

See `.github/BRANCH-PROTECTION.md` for the current, verified protection configuration,
including the documented admin Settings backdoor.

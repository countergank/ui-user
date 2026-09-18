# Branch Protection — verified real state

This document reflects the **current, verified** branch protection configuration on
`develop`, `staging`, and `main` (ADR-9, `docs/adr.md`).

> Status: protection is **already configured**. This is a record, not a to-do.

## Current protection (verified)

All three environment branches (`develop`, `staging`, `main`) have:

- **Pull request required** — direct pushes blocked; PR-only workflow.
- **1 required reviewer** (`required_approving_review_count = 1`).
- **Dismiss stale reviews** — re-approval required after new commits.
- **Require last push approval** (`require_last_push_approval = true`).
- **Force pushes blocked** (`allow_force_pushes = false`).
- **Deletions blocked** (`allow_deletions = false`).
- **Enforce administrators / Include administrators** (`enforce_admins = true`).
- **Required status checks** (`required_status_checks.contexts`):
  `["quality-gates", "e2e", "commitlint"]` with `strict: false`, so a PR cannot merge
  until all three CI checks pass. The `preview` check is **not** required (artifact-only).

### Branch-specific review bypass

- **develop**: keeps the admin bypass user `leandrojaviercepeda`
  (`bypass_pull_request_allowances.users = ["leandrojaviercepeda"]`, teams/apps empty)
  for solo self-merge. Required status checks **cannot** be overridden by this review
  bypass (MA-4). **Remove this bypass when the team grows.**
- **staging / main**: no review bypass (`users: []`).

```json
// develop
{
  "required_status_checks": { "strict": false, "contexts": ["quality-gates", "e2e", "commitlint"] },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_last_push_approval": true,
    "bypass_pull_request_allowances": {
      "users": ["leandrojaviercepeda"],
      "teams": [],
      "apps": []
    }
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}

// staging / main
// identical except bypass_pull_request_allowances.users = []
```

## Residual admin override (documented backdoor)

Branch protection rules apply to admins via `enforce_admins: true`, and required status
checks cannot be overridden by review bypass. However, an admin can still bypass
protection **manually through the GitHub Settings UI** (temporarily disabling the branch
protection rule in an emergency). This is an accepted, auditable residual backdoor
(MA-4) and MUST be recorded here whenever it is used.

## Note on branch source restrictions

Per the `git-environment-flow` skill, staging should only receive `release/*` and main
should only receive `release/*` / `hotfix/*`. Track the source-branch restrictions as a
follow-up when releases begin; the current rule set above is the verified baseline.

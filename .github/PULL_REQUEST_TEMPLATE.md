<!--
  PULL REQUEST TEMPLATE
  Fill in each section below. Remove optional sections if not applicable.
  Keep descriptions concise and actionable for reviewers.
-->

> **Target branch**
> - Feature branches (`feat/*`, `fix/*`, `refactor/*`, etc.) MUST target **`develop`** (the default, integration branch). See `.github/FLOW.md`.
> - Release branches (`release/x.y.z`) and hotfix branches (`hotfix/*`) target `staging`/`main` respectively per `.github/FLOW.md`.
> - Do not open feature PRs against `staging` or `main`.

## Summary

<!-- One paragraph: what does this PR do and why? -->

## Changes

<!-- Bullet list of notable changes. Group by area if multiple. -->
-

## Testing

<!-- How was this verified? Unit tests, manual testing, integration tests? -->
-

## Screenshots (optional)

<!-- Before/after, UI changes, or terminal output. Delete section if N/A. -->

## Self-review Checklist

<!-- Check each item before requesting review. -->
- [ ] PR targets the correct environment branch (`develop` for features)
- [ ] Code follows project conventions and style guide
- [ ] Self-reviewed the diff for typos, dead code, and debug leftovers
- [ ] Added or updated tests for new/changed behavior
- [ ] Documentation updated (README, comments, API docs)
- [ ] Commit messages follow Conventional Commits format
- [ ] No unrelated changes included in this PR

## Related Issues

<!-- Link issues: Closes #123, Fixes #456, Refs #789 -->

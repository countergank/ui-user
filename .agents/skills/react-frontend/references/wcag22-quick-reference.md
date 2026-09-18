# WCAG 2.2 Quick Reference

Curated subset of WCAG 2.2 success criteria most relevant to React SPAs. All criteria at Level A and AA.

## Perceivable

| ID | Criterion | Level | What It Means |
|----|-----------|-------|---------------|
| 1.1.1 | Non-text Content | A | All images, icons, charts need alt text or equivalent |
| 1.3.1 | Info and Relationships | A | Semantic HTML conveys structure (headings, lists, landmarks) |
| 1.3.2 | Meaningful Sequence | A | Reading order matches visual order (DOM order matters) |
| 1.3.4 | Orientation | AA | Content works in both portrait and landscape |
| 1.3.5 | Identify Input Purpose | A | Use autocomplete attributes on form fields |
| 1.4.1 | Use of Color | A | Don't convey information by color alone |
| 1.4.3 | Contrast (Minimum) | AA | Text: 4.5:1, large text: 3:1 |
| 1.4.10 | Reflow | AA | No horizontal scrolling at 320px width |
| 1.4.11 | Non-text Contrast | AA | UI components and focus indicators: 3:1 |
| 1.4.12 | Text Spacing | AA | Content readable at 200% letter/line spacing |

## Operable

| ID | Criterion | Level | What It Means |
|----|-----------|-------|---------------|
| 2.1.1 | Keyboard | A | All functionality accessible via keyboard |
| 2.1.2 | No Keyboard Trap | A | Users can navigate away from any element via keyboard |
| 2.4.1 | Bypass Blocks | A | Skip links or landmarks to bypass repeated content |
| 2.4.2 | Page Titled | A | Descriptive, unique page titles |
| 2.4.3 | Focus Order | A | Focus follows logical navigation order |
| 2.4.4 | Link Purpose (In Context) | A | Link text describes destination or purpose |
| 2.4.7 | Focus Visible | AA | Keyboard focus indicator is visible |
| 2.4.11 | Focus Not Obscured (Minimum) | AA | Focus indicator not hidden by other content |
| 2.5.1 | Pointer Gestures | A | No complex gestures required (pinch, shake) |
| 2.5.2 | Pointer Cancellation | A | Single tap/click activates; drag has undo |
| 2.5.3 | Label in Name | A | Visible label matches accessible name |
| 2.5.7 | Dragging Movements | AA | Single-pointer alternative to drag operations |
| 2.5.8 | Target Size (Minimum) | AA | Interactive targets at least 24x24px |

## Understandable

| ID | Criterion | Level | What It Means |
|----|-----------|-------|---------------|
| 3.1.1 | Language of Page | A | Set `lang` attribute on `<html>` |
| 3.2.1 | On Focus | A | Focus change doesn't trigger unexpected context change |
| 3.2.2 | On Input | A | Input change doesn't auto-submit without warning |
| 3.2.6 | Consistent Help | A | Help mechanisms appear in consistent location |
| 3.3.1 | Error Identification | A | Clearly identify and describe form errors in text |
| 3.3.2 | Labels or Instructions | A | Form inputs have labels or instructions |
| 3.3.3 | Error Suggestion | AA | Suggest corrections for input errors |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | AA | Confirm or undo for irreversible actions |
| 3.3.7 | Redundant Entry | A | Don't require re-entering info already provided |
| 3.3.8 | Accessible Authentication (Minimum) | AA | No cognitive tests (memory, transcription) in auth |

## Robust

| ID | Criterion | Level | What It Means |
|----|-----------|-------|---------------|
| 4.1.2 | Name, Role, Value | A | Custom controls have correct ARIA name, role, state |
| 4.1.3 | Status Messages | AA | Status changes announced via aria-live or role=status |

## Key Patterns for SPAs

- **Route changes**: Announce new page title via `aria-live` (RouteAnnouncer component)
- **Dynamic content**: Use `aria-busy` while loading, remove when complete
- **Modals**: Trap focus, return focus on close, set `aria-modal="true"`
- **Forms**: Associate errors with inputs via `aria-describedby` and `aria-invalid`
- **Loading states**: Use skeletons (preserve layout) over spinners when possible

---
priority: P1
category: ux-design-tokens
---

# Use Intl APIs for Locale-Aware Formatting

**Do**: Use `Intl.DateTimeFormat`, `Intl.NumberFormat`, and `Intl.RelativeTimeFormat` for dates, numbers, and currencies. These APIs respect the user's locale automatically and avoid manual formatting bugs.

**Avoid**: Hardcoding locale strings like `en-US` in formatting calls. Manually constructing date/number strings with string concatenation.

**Example**:
```ts
// Correct: locale-aware formatting
const formatDate = (date: Date, locale?: string) =>
  new Intl.DateTimeFormat(locale ?? navigator.language, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);

const formatCurrency = (amount: number, currency = "USD", locale?: string) =>
  new Intl.NumberFormat(locale ?? navigator.language, {
    style: "currency",
    currency,
  }).format(amount);

// Usage
formatDate(new Date());       // "Jun 30, 2026" (en-US) or "30 jun 2026" (es)
formatCurrency(1234.56);      // "$1,234.56" or "1.234,56 US$" (es-AR)

// Wrong: hardcoded locale, manual formatting
const bad = `${month}/${day}/${year}`; // no locale support
```

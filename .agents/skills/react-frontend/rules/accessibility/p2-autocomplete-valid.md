---
priority: P2
category: accessibility
---

# Use Valid Autocomplete Values

**Do**: Use valid HTML `autocomplete` attribute values on form inputs to help browsers and password managers fill fields correctly. Match the autocomplete value to the actual data the field collects.

**Avoid**: Using invalid or made-up autocomplete values. Omitting autocomplete on fields that collect personal data.

**Example**:
```tsx
// Correct: valid autocomplete values
<input name="email" autoComplete="email" />
<input name="name" autoComplete="name" />
<input name="tel" autoComplete="tel" />
<input name="address" autoComplete="street-address" />
<input name="city" autoComplete="address-level2" />
<input name="postal" autoComplete="postal-code" />
<input name="cc-number" autoComplete="cc-number" />
<input name="new-password" type="password" autoComplete="new-password" />
<input name="current-password" type="password" autoComplete="current-password" />

// Wrong: invalid autocomplete value
<input name="userEmail" autoComplete="user-email" />
```

**Reference**: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill

---
priority: P1
category: accessibility
---

# Set Language and Direction Attributes

**Do**: Declare the primary language with `lang` on the `<html>` element. Use `dir` for right-to-left or mixed-direction content. Mark language changes within the page with `lang` on inline elements.

**Avoid**: Omitting `lang` on the root element. Assuming the browser can auto-detect page language.

**Example**:
```html
<!-- Correct: primary language declared -->
<html lang="en">
<html lang="es">
<html lang="ar" dir="rtl">

<!-- Correct: inline language change -->
<p>The term <span lang="fr">déjà vu</span> is French.</p>

<!-- Wrong: no language declared -->
<html>
  <body>
    <p>Content in an unknown language</p>
  </body>
</html>
```

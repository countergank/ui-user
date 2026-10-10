---
priority: P0
category: accessibility
---

# Provide Meaningful Alt Text for Images

**Do**: Write alt text that conveys the image's purpose in context. Use `alt=""` for decorative images so screen readers skip them. Describe charts and diagrams with both alt text and a longer description nearby.

**Avoid**: Generic alt text like "image", "photo", or filenames. Repeating caption text in alt. Leaving alt off non-decorative images.

**Example**:
```tsx
// Correct: descriptive alt text
<img src="/chart-q3.png" alt="Q3 revenue increased 15% to $2.4M" />

// Correct: decorative image
<img src="/divider.svg" alt="" role="presentation" />

// Wrong: generic or missing
<img src="/chart-q3.png" alt="chart" />
<img src="/team-photo.jpg" /> {/* missing alt */}
```

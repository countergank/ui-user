---
priority: P0
category: accessibility
---

# Do Not Use accesskey or AutoFocus

**Do**: Let users navigate with standard browser and OS keyboard shortcuts. Manage focus programmatically only after user-initiated actions like opening a modal or navigating to a new view.

**Avoid**: The `accesskey` attribute (conflicts with browser/screen reader shortcuts). `autoFocus` on page load (disrupts screen reader users and unexpected focus changes).

**Example**:
```tsx
// Correct: programmatic focus after user action
function SearchModal({ isOpen, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  return isOpen ? <input ref={inputRef} /> : null;
}

// Wrong: accesskey and autoFocus on mount
<button accesskey="s">Search</button>
<input autoFocus /> {/* steals focus on page load */}
```

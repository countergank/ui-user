---
priority: P1
category: composition
---

# Lift State to Reduce Prop Drilling

**Do**: Move shared state up to the nearest common ancestor when multiple siblings need it. Use context or state management for deeply nested consumers. Keep state as close to where it's used as possible.

**Avoid**: Passing props through 3+ intermediate components that don't use them. Lifting state to the root unnecessarily.

**Example**:
```tsx
// Correct: state at common ancestor
function Dashboard() {
  const [filter, setFilter] = useState("");
  return (
    <>
      <FilterBar value={filter} onChange={setFilter} />
      <ItemList filter={filter} />
    </>
  );
}

// Correct: context for deep consumers
const ThemeContext = createContext<Theme>(defaultTheme);
function App() {
  const [theme, setTheme] = useState(defaultTheme);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <DeepNestedTree />
    </ThemeContext.Provider>
  );
}

// Wrong: prop drilling through non-consuming layers
<App filter={f} onFilter={setF}>
  <Layout filter={f} onFilter={setF}>
    <Sidebar filter={f} onFilter={setF}>
      <FilterBar filter={f} onChange={setF} />
    </Sidebar>
  </Layout>
</App>
```

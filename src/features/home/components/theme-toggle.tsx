import { Button } from "@/components/ui/button";
import { selectTheme, useUiStore } from "@/stores/use-ui-store";

export function ThemeToggle() {
  const theme = useUiStore(selectTheme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      aria-pressed={isDark}
      onClick={toggleTheme}
    >
      {isDark ? "Dark" : "Light"} theme
    </Button>
  );
}

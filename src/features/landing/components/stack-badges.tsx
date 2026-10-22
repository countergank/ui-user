import { useTranslation } from "react-i18next";

/**
 * Stack badges (COU-310, T10 / S13). Technology names are proper nouns: not translated,
 * only the sentence that introduces them. Badges make the block scannable instead of a
 * paragraph of commas.
 */
const STACK = [
  "React 19",
  "TypeScript",
  "Vite 6",
  "Tailwind CSS",
  "shadcn/ui",
  "TanStack Query 5",
  "React Router 7",
  "Vitest",
  "Playwright",
  "Biome",
  "ESLint",
];

export function StackBadges() {
  const { t } = useTranslation("landing");

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-prose text-muted-foreground">{t("stack.body")}</p>
      <ul className="flex flex-wrap gap-2">
        {STACK.map((item) => (
          <li
            key={item}
            className="rounded-full border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

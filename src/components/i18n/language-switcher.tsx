import { Check, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { writeStoredLanguage } from "@/lib/i18n/language";
import { type AppLanguage, languages } from "@/lib/i18n/resources";

const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  en: "English",
  es: "Español",
  pt: "Português (Brasil)",
};

interface LanguageSwitcherProps {
  variant?: "icon" | "code";
}

/**
 * @param variant - `icon` shows a translate glyph; `code` shows the active language code, the
 * way the console topbar does.
 */
export function LanguageSwitcher({ variant = "icon" }: LanguageSwitcherProps = {}) {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage ?? i18n.language;
  const label = t("shell.language.switch");

  const select = (language: AppLanguage): void => {
    writeStoredLanguage(language);
    void i18n.changeLanguage(language);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={variant === "code" ? "sm" : "icon"}
          className={
            variant === "code"
              ? "h-9 gap-1.5 rounded-md border border-input bg-muted px-2.5 text-muted-foreground hover:bg-muted/80"
              : "text-muted-foreground"
          }
          aria-label={label}
          title={label}
        >
          {variant === "code" ? (
            <>
              <Languages aria-hidden="true" className="h-4 w-4" />
              <span className="font-mono text-xs font-semibold">
                {current.slice(0, 2).toUpperCase()}
              </span>
            </>
          ) : (
            <Languages aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language}
            aria-current={language === current ? "true" : undefined}
            onSelect={() => {
              select(language);
            }}
          >
            {LANGUAGE_NAMES[language]}
            {language === current ? <Check className="ml-auto" aria-hidden="true" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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

/**
 * Language switcher (COU-310, T9 / S12). A menu, not a cycling button: cycling through
 * three languages hides which one is active. Each option is labelled in its own language —
 * translating them would make the menu unreadable to the person who needs it most.
 */
const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  en: "English",
  es: "Español",
  pt: "Português (Brasil)",
};

export function LanguageSwitcher() {
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
          size="icon"
          className="text-muted-foreground"
          aria-label={label}
          title={label}
        >
          <Languages aria-hidden="true" />
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

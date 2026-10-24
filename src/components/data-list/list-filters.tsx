import { FilterX } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_VALUE = "__all__";

export interface ListSelectFilterOption {
  value: string;
  label: string;
}

export interface ListSelectFilter {
  name: string;
  label: string;
  value: string;
  options: readonly ListSelectFilterOption[];
  onChange: (value: string) => void;
}

export interface ListFiltersProps {
  searchValue: string;
  searchLabel: string;
  onSearchChange: (value: string) => void;
  selectFilters?: readonly ListSelectFilter[];
  clearLabel?: string;
  onClear?: () => void;
}

export function ListFilters({
  searchValue,
  searchLabel,
  onSearchChange,
  selectFilters = [],
  clearLabel,
  onClear,
}: ListFiltersProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(searchValue);
  const idPrefix = useId();
  const searchId = `${idPrefix}-search`;

  useEffect(() => {
    setDraft(searchValue);
  }, [searchValue]);

  const onSearchChangeRef = useRef(onSearchChange);
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  });

  useEffect(() => {
    if (draft === searchValue) {
      return;
    }

    const timer = setTimeout(() => {
      onSearchChangeRef.current(draft.trim());
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [draft, searchValue]);

  return (
    // biome-ignore lint/a11y/useSemanticElements: a filter toolbar, not a form; <search> is not it
    <div className="flex w-full flex-wrap items-end gap-2" role="search">
      <div className="flex min-w-48 flex-1 flex-col gap-1.5">
        <Label htmlFor={searchId}>{searchLabel}</Label>
        <Input
          id={searchId}
          type="search"
          placeholder={searchLabel}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
        />
      </div>
      {selectFilters.map((filter) => {
        const selectId = `${idPrefix}-${filter.name}`;

        return (
          <div key={filter.name} className="flex basis-40 flex-1 flex-col gap-1.5">
            <Label htmlFor={selectId}>{filter.label}</Label>
            <Select
              value={filter.value === "" ? ALL_VALUE : filter.value}
              onValueChange={(value) => {
                filter.onChange(value === ALL_VALUE ? "" : value);
              }}
            >
              <SelectTrigger id={selectId} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>{t("ui.list.filters.all")}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
      {onClear !== undefined ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-auto shrink-0"
          aria-label={clearLabel ?? t("ui.list.clear")}
          title={clearLabel ?? t("ui.list.clear")}
          onClick={onClear}
        >
          <FilterX aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}

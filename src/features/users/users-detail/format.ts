export const NO_VALUE = "—";

export function formatDateTime(value: string, language: string): string {
  const date = new Date(value);
  const datePart = new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat(language, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);

  return `${datePart} · ${timePart}`;
}

export function formatRelative(value: string, language: string): string {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  const relative = new Intl.RelativeTimeFormat(language, { numeric: "auto", style: "short" });

  if (Math.abs(minutes) < 60) {
    return relative.format(-minutes, "minute");
  }

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return relative.format(-hours, "hour");
  }

  return relative.format(-Math.round(hours / 24), "day");
}

export function initialsOf(name: string, lastName: string): string {
  return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

const AVATAR_PALETTE = [
  "bg-[hsl(var(--avatar-1-bg))] text-[hsl(var(--avatar-1-fg))]",
  "bg-[hsl(var(--avatar-2-bg))] text-[hsl(var(--avatar-2-fg))]",
  "bg-[hsl(var(--avatar-3-bg))] text-[hsl(var(--avatar-3-fg))]",
  "bg-[hsl(var(--avatar-4-bg))] text-[hsl(var(--avatar-4-fg))]",
] as const;

/**
 * Assigns palette colours in order and cycles back to the first once the four are spent, so
 * consecutive users differ while the same user keeps a stable colour per page load.
 *
 * @returns The Tailwind classes for the avatar background and its initials.
 */
let nextTone = 0;

export function avatarToneOf(): string {
  const tone = AVATAR_PALETTE[nextTone % AVATAR_PALETTE.length] as string;
  nextTone += 1;

  return tone;
}

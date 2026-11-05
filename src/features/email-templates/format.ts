/**
 * @param isoDate - an ISO timestamp from the API.
 * @param language - the active UI language, so the date renders localized.
 * @returns The localized short date, or the raw value when it does not parse.
 */
export function formatDate(isoDate: string, language: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(date);
}

const SAMPLE_VALUE = "sample";

/**
 * @param variables - the template variable names.
 * @returns One sample value per variable, so the preview and the test email render with data
 * instead of leaving raw placeholders.
 */
export function sampleVariablesOf(variables: readonly string[]): Record<string, string> {
  return Object.fromEntries(variables.map((variable) => [variable, SAMPLE_VALUE]));
}

const TEMPLATE_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

/**
 * @param text - a template subject or body containing `{{variable}}` placeholders.
 * @param variables - the variable names declared by the template.
 * @returns The text with every known placeholder replaced by its sample value; unknown
 * placeholders stay visible so the reviewer spots them.
 */
export function renderSample(text: string, variables: readonly string[]): string {
  const samples = sampleVariablesOf(variables);

  return text.replace(TEMPLATE_PATTERN, (match, name: string) => samples[name] ?? match);
}

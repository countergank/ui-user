export const repositoryUrl = "https://github.com/countergank/ui-user";
export const docsUrl = `${repositoryUrl}/tree/develop/docs`;
export const licenseUrl = `${repositoryUrl}/blob/develop/LICENSE`;
export const issuesUrl = `${repositoryUrl}/issues`;

/**
 * @param file - a file inside the standards library (`docs/`).
 * @returns The URL the about page links to for that file.
 */
export function docUrl(file: string): string {
  return `${docsUrl}/${file}`;
}

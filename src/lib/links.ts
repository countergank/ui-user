/**
 * Project links (COU-310, T10 / S4): one place for the URLs the public surface advertises,
 * so header, hero, footer and about page cannot drift apart. They point at the repository
 * itself: an open-source project, not a product site with its own domain.
 */
export const repositoryUrl = "https://github.com/countergank/ui-user";
export const docsUrl = `${repositoryUrl}/tree/develop/docs`;
export const licenseUrl = `${repositoryUrl}/blob/develop/LICENSE`;
export const issuesUrl = `${repositoryUrl}/issues`;

/** A file inside the standards library (`docs/`), so the about page can link to each one. */
export function docUrl(file: string): string {
  return `${docsUrl}/${file}`;
}

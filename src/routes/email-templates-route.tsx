import { EmailTemplatesPage } from "@/features/email-templates/email-templates-page";

import { RequireSection } from "@/features/console/require-section";

export function Component() {
  return (
    <RequireSection>
      <EmailTemplatesPage />
    </RequireSection>
  );
}

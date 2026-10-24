import { UsersCreatePage } from "@/features/users/users-create-page";

import { RequireSection } from "@/features/console/require-section";

export function Component() {
  return (
    <RequireSection>
      <UsersCreatePage />
    </RequireSection>
  );
}

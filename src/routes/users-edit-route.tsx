import { UsersEditPage } from "@/features/users/users-edit-page";

import { RequireSection } from "@/features/console/require-section";

export function Component() {
  return (
    <RequireSection>
      <UsersEditPage />
    </RequireSection>
  );
}

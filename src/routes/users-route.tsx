import { UsersPage } from "@/features/users/users-page";

import { RequireSection } from "@/features/console/require-section";

export function Component() {
  return (
    <RequireSection>
      <UsersPage />
    </RequireSection>
  );
}

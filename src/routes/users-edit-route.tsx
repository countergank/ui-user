import { RequirePermission } from "@/features/authorization/components/require-permission";
import { PERMISSIONS } from "@/features/authorization/permissions";
import { UsersEditPage } from "@/features/users/users-edit-page";

import { RequireSection } from "@/features/console/require-section";

export function Component() {
  return (
    <RequireSection>
      <RequirePermission permission={PERMISSIONS.userUpdate}>
        <UsersEditPage />
      </RequirePermission>
    </RequireSection>
  );
}

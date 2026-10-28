import { RequirePermission } from "@/features/authorization/components/require-permission";
import { PERMISSIONS } from "@/features/authorization/permissions";
import { RequireSection } from "@/features/console/require-section";
import { UsersDetailPage } from "@/features/users/users-detail-page";

export function Component() {
  return (
    <RequireSection>
      <RequirePermission permission={PERMISSIONS.userRead}>
        <UsersDetailPage />
      </RequirePermission>
    </RequireSection>
  );
}

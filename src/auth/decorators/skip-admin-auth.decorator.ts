import { SetMetadata } from '@nestjs/common';

export const SKIP_ADMIN_AUTH_KEY = 'skipAdminAuth';

/** Skips {@link AdminAuthGuard} for this handler (class-level guard on `AdminController`). */
export const SkipAdminAuth = () => SetMetadata(SKIP_ADMIN_AUTH_KEY, true);

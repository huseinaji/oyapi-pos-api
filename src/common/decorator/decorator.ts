import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../../modules/user/utils/user.types";

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const IS_SESSION_FREE_KEY = 'sessionFree';
export const SessionFree = () => SetMetadata(IS_SESSION_FREE_KEY, true);

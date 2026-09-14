import { UserRole } from "../../user/utils/user.types";

export interface accessTokenPayload {
  sub: string;
  username: string;
  email: string;
  role: UserRole
}
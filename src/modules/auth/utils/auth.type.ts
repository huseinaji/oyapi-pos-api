import { StoreRole } from "../../store/utils/store.types";
import { UserRole, UserStatus } from "../../user/utils/user.types";

export interface BaseSessionPayload {
  userPayload: UserAuthPayload;
  rememberMe: boolean;
}

export interface RedisSessionData extends BaseSessionPayload {
  sessionId: string,
}

export interface UserAuthPayload {
  sub: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  store?: StorePayload;
}

export interface StorePayload {
  storeId: string;
  role: StoreRole;
}

import { SetMetadata } from "@nestjs/common";
import { StoreRole } from "../store.types";

export interface StoreAccessOptions {
  roles?: StoreRole[],
  isOwner?: boolean,
}

export const STORE_ACCESS_KEY = 'store_roles';
export const StoreAccess = (
  options: StoreAccessOptions
) => SetMetadata(STORE_ACCESS_KEY, options);

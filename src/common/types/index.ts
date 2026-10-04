import type { BaseSessionPayload, StorePayload } from '../../modules/auth/utils/auth.type';
import { PosSessionEntry } from '../../modules/point-of-sale/entities/pos-session-entry.entity';

declare module '@fastify/session' {
  interface SessionData {
    payload: BaseSessionPayload;
  }
}

declare module 'fastify' {
  interface Session {
    payload: BaseSessionPayload;
  }
  interface FastifyRequest {
    user: BaseSessionPayload;
    storeSession: StorePayload;
    posSession?: PosSessionEntry,
  }
}

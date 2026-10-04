import { Injectable } from "@nestjs/common";
import { RedisProviderService } from "./redis-provider.service";

@Injectable()
export class CacheService {
  constructor(
    private readonly redisProvider: RedisProviderService,
  ) { }

  private get client() {
    return this.redisProvider.getClient();
  }

  async get<T>(key: string) {
    const value = await this.client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T; // fallback string biasa
    }
  }

  async set(key: string, value: string | Buffer | number, ttl?: number) {
    if (ttl === undefined) {
      return this.client.set(key, value);
    }
    return this.client.set(key, value, 'EX', ttl);
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async increment(key: string, value = 1) {
    return await this.client.incrby(key, value);
  }

  async decrement(key: string, value = 1) {
    return await this.client.decrby(key, value);
  }
}


import { Injectable } from "@nestjs/common";
import { RedisProviderService } from "./redis-provider.service";

@Injectable()
export class RedisListService {
  constructor(
    private readonly redisProvider: RedisProviderService,
  ) { }

  private get client() {
    return this.redisProvider.getClient();
  }

  async rpush(key: string, values: unknown[]) {
    const serializedValues = values.map((value) =>
      typeof value === 'string'
        ? value
        : Buffer.isBuffer(value)
          ? value
          : JSON.stringify(value),
    );
    return this.client.rpush(key, ...serializedValues);
  }

  async lpush(key: string, values: unknown[]) {
    const serializedValues = values.map((value) =>
      typeof value === 'string'
        ? value
        : Buffer.isBuffer(value)
          ? value
          : JSON.stringify(value),
    );

    return this.client.lpush(key, ...serializedValues);
  }

  async lrange(key: string, start: number | string, stop: number | string) {
    return this.client.lrange(key, start, stop)
  }

  async ltrim(key: string, start: number | string, stop: number | string) {
    return this.client.ltrim(key, start, stop);
  }

  async lpop(key: string) {
    return this.client.lpop(key)
  }
}


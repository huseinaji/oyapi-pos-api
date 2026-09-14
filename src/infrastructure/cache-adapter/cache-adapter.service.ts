import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheAdapterService {
  constructor(@InjectRedis() private adapter: Redis) { }

  async ping() {
    return await this.adapter.ping()
  }

  async set(key: string, value: object | string, ttl?: number): Promise<void> {
    const serialized =
      typeof value === 'string' ? value : JSON.stringify(value);

    if (ttl !== undefined) {
      await this.adapter.set(key, serialized, 'EX', ttl);
    } else {
      await this.adapter.set(key, serialized);
    }
  }

  async rpush(key: string, values: (string | object | Buffer)[]): Promise<number> {
    const serializedValues = values.map((value) =>
      typeof value === 'string'
        ? value
        : Buffer.isBuffer(value)
          ? value
          : JSON.stringify(value),
    );
    return this.adapter.rpush(key, ...serializedValues);
  }

  async lpush(key: string, values: (string | number | Buffer)[]): Promise<number> {
    const serializedValues = values.map((value) =>
      typeof value === 'string'
        ? value
        : Buffer.isBuffer(value)
          ? value
          : JSON.stringify(value),
    );

    return this.adapter.lpush(key, ...serializedValues);
  }

  lrange(key: string, start: number | string, stop: number | string) {
    return this.adapter.lrange(key, start, stop)
  }

  lpop(key: string) {
    return this.adapter.lpop(key)
  }

  ltrim(key: string, start: number | string, stop: number | string) {
    return this.adapter.ltrim(key, start, stop);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.adapter.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T; // fallback string biasa
    }
  }

  async del(key: string) {
    await this.adapter.del(key);
  }

  async increment(key: string, value: number = 1): Promise<number> {
    return await this.adapter.incrby(key, value);
  }

  async decrement(key: string, value: number = 1): Promise<number> {
    return await this.adapter.decrby(key, value);
  }
}

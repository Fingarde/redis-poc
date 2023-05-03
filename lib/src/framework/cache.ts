import { createClient, RedisClientType } from 'redis';


export class Cache {
    private client: RedisClientType;

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL,
        });
    }

    async connect() {
        await this.client.connect();
        console.log("⚡️ Connected to redis");
    }

    async has(key: string): Promise<boolean> {
        return await this.client.exists(key) === 1;
    }

    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }


    async getObj(key: string): Promise<any | null> {
        const value = await this.client.get(key);

        if (!value) {
            return null;
        }

        return JSON.parse(value);
    }
    

    async set(key: string, value: string, ttl: number = 600): Promise<string | null> {
        return await this.client.set(key, value, {
            EX: ttl,
        });
    }

    async setObj(key: string, value: any, ttl: number = 600): Promise<string | null> {
        return await this.client.set(key, JSON.stringify(value), {
            EX: ttl,
        });
    }

    async del(key: string): Promise<number> {
        return await this.client.del(key);
    }
}
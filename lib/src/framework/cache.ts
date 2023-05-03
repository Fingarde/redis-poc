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

    async get(key: string) {
        return this.client.get(key);
    }


    async getObj(key: string) {
        const value = await this.client.get(key);

        if (!value) {
            return null;
        }

        return JSON.parse(value);
    }
    

    async set(key: string, value: string, ttl: number = 600) {
        return this.client.set(key, value, {
            EX: ttl,
        });
    }

    async setObj(key: string, value: any, ttl: number = 600) {
        return this.client.set(key, JSON.stringify(value), {
            EX: ttl,
        });
    }

    async del(key: string) {
        return this.client.del(key);
    }
}
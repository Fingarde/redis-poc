import { createClient } from 'redis';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv'
import { RequestMessage, ResponseMessage } from './types/message';

import UserService from './services/user';

dotenv.config()

const clientId = process.env.CLIENT_ID || uuid();
const client = createClient({
    url: process.env.REDIS_URL,
    name: clientId
});

const queue = process.env.QUEUE || 'user';

client.on('error', err => console.log('Redis Client Error', err));


async function main() {
    await client.connect();
    const sub = client.duplicate();
    await sub.connect();

    console.log('⚡️ Connected to redis');
    console.log('Listening for queue', queue);

    const listener = async (message: string, channel: string) => {
        let reqMessage: RequestMessage = JSON.parse(message);
        const { action, replyTo, correlationId, data } = reqMessage;
    
        console.log('Received message', reqMessage);
    
        let reply: ResponseMessage = {
            correlationId,
        }

        try {
            switch (action) {
            case 'get-all':
                reply.data = await UserService.getAll();
                break;
            case 'get':
                const id = Number(data.id);


                reply.data = await UserService.get(id);
                break;
            case 'create':
                reply.data = await UserService.create(data);
                break;
        }
        } catch (err) {
            reply.error = err;
        }
    
        client.publish(replyTo, JSON.stringify(reply));
    }

    sub.subscribe(queue, listener);
}

main().catch(err => console.log(err));



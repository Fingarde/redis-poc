import { createClient } from 'redis';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv'
import { RequestMessage, ResponseMessage } from './types/message';

import { Consumer } from './lib/consumer';
import { GetUserCommand } from './command/get-user';

dotenv.config()

const clientId = process.env.CLIENT_ID || uuid();
const client = createClient({
    url: process.env.REDIS_URL,
    name: clientId
});

const queue = process.env.QUEUE || 'user';

client.on('error', err => console.log('Redis Client Error', err));

const commands = [
    new GetUserCommand()
]

const consumer = new Consumer([queue], clientId);

async function main() {
    // Register commands
    console.debug('Registering commands');
    commands.forEach(command => { 
        consumer.register(command);
        console.debug(`\t - ${command.name()}`);
    });





    await consumer.connect();
    await consumer.perform();
}

main().catch(err => console.log(err));



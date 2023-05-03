import { createClient } from 'redis';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv'

import { load } from 'js-yaml';
import { readFileSync } from 'fs';

dotenv.config()

const clientId = process.env.CLIENT_ID || uuid();
const client = createClient({
    url: process.env.REDIS_URL,
    name: clientId
});

const queue = process.env.QUEUE ;

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();
const sub = client.duplicate();
await sub.connect();

console.log('⚡️ Connected to redis');
console.log('Listening for queue', queue);

const listener = (message, channel) => {
    let data = JSON.parse(message);
    const { action, replyTo, correlationId} = data;

    console.log('Received message', data);

    let reply = {
        correlationId,
    }
    switch (action) {
        case 'is-authorized':
            reply.data = isAuthorized(data.role, data.permission);
    }

    client.publish(replyTo, JSON.stringify(reply));
}

sub.subscribe(queue, listener);

const roles = load(readFileSync('./roles.yml', 'utf8'));

function isAuthorized(role, permission) {
    return roles[role].includes(permission);
}

console.log(isAuthorized('admin', 'user:get-all'));
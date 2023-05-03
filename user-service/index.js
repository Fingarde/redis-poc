import { createClient } from 'redis';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv'

const users = [
    {
        id: 1,
        name: 'John Doe'
    },
    {
        id: 2,
        name: 'Jane Doe'
    }
]

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
        case 'get-all':
            reply.data = getAll();
            break;
        case 'get':
            reply.data = get(data.id);
            break;
    }

    client.publish(replyTo, JSON.stringify(reply));
}

sub.subscribe(queue, listener);


function getAll() {
    return users
}

function get(id) {
    return users.find(u => u.id == id);;
}


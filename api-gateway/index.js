import { createClient } from 'redis';
import express from 'express';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv'

dotenv.config()

const app_port = process.env.APP_PORT || 3000;
const app = express();

const clientId = process.env.CLIENT_ID || uuid();
const client = createClient({
    url: process.env.REDIS_URL,
    name: clientId
});

let replies = Object.create(null);

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();
const sub = client.duplicate();
await sub.connect();

console.log('Connected to redis');
console.log('Reply queue is', clientId);

async function send(data) {
    if (!data.correlationId) {
        data.correlationId = uuid();
    }
    const { correlationId } = data;

    data.replyTo = clientId;

    client.publish('user', JSON.stringify(data));

    const promise = new Promise((resolve) => {
        replies[correlationId] = resolve;
    })

    return await promise;
}


// Reply subscription
sub.subscribe(clientId, (message, channel) => {
    let json = JSON.parse(message);
    const {  correlationId, data, error } = json;

    const reply = replies[correlationId];
 
    console.log('Received message', json);
    if (reply) {
        reply({ data , error });
    }
});

app.use(express.json());

app.get('/users', async (req, res) => {
    const { data: users, error } = await send({ action: 'get-all' });

    if (error) {
        res.status(error.status).json(...error.message);
        return;
    }
    res.json(users);
})

app.get('/users/:id', async (req, res) => {
    const { data: user, error } = await send({ action: 'get', data: { id: req.params.id} });

    if (error) {
        res.status(error.status).json({message: error.message});
        return;
    }

    res.json(user);
})


app.post('/users', async (req, res) => {
    const newUserData = req.body;

    const { data: user, error } = await send({ action: 'create', data: newUserData });

    if (error) {
        res.status(error.status).json({message: error.message});
        return;
    }

    res.json(user);
})

app.listen(app_port, () => {
    console.log(`⚡️ Listening on port ${app_port}`)
})

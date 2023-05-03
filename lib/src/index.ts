import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv'

import { Cache } from './framework/cache';
import { Messaging } from './framework/messaging';

dotenv.config()

const cache = new Cache();
const messaging = new Messaging();

async function test() { 
    cache.connect();
   console.log(await cache.setObj('test', {
        name: 'test',
    }, 2))

    console.log('exists: ', await cache.has('teest'));

    console.log((await cache.getObj('test')).name);
    setTimeout(async () => {
        console.log(await cache.get('test'));
    }, 1000);

    await messaging.connect();
    let response = await messaging.publish('user', 
    {
        action: 'get-all',
    });

    console.log(response);
}

test().catch(err => console.log(err));






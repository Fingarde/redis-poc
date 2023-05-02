const express = require('express')
const { Kafka } = require('kafkajs')
const { v4: uuidv4 } = require('uuid');
const app = express()
const port = 3000

const groupId = `api-gateway`
const clientId = `${groupId}-${uuidv4()}`
const responseTopic = `response-${clientId}`

const kafka = new Kafka({
    clientId: clientId,
    brokers: ['localhost:9092']
})

const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: groupId })

let responses = Object.create(null)

const init = async () => {
    await producer.connect()

    await consumer.connect()
    await consumer.subscribe({ topic: responseTopic })

    consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const correlationId = message.headers['correlation-id'].toString()
            const res = responses[correlationId]
            if (res) {
                res.send(message.value.toString())
                delete responses[correlationId]
            }
        }
    })

    // user logger
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
        next()
    })

    app.get('/users', async (req, res) => {
        const id = uuidv4();
        responses[id] = res;


        await producer.send({
            topic: 'user',
            messages: [
                {
                    value: JSON.stringify({
                        action: 'get-all',
                    }),
                    headers: {
                        'correlation-id': id,
                        'response-topic': responseTopic
                    }
                },
            ]
        })
    })
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

init().catch(console.error)




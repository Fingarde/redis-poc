const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
})

const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: 'test-group' })

const run = async () => {
  // Producing
  await producer.connect()


  // Consuming
  await consumer.connect()
  await consumer.subscribe({ topic: 'user'})

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log('received message')
      let correlationId = message.headers['correlation-id'].toString()
      let responseTopic = message.headers['response-topic'].toString()

      await producer.send({
        topic: responseTopic,
        messages: [
            {
                value: JSON.stringify([
                    {
                        id: 1,
                        name: 'John Doe',
                    }
                ]),
                headers: {
                    'correlation-id': correlationId
                }
            },
        ]
    })
    },
  })
}

run().catch(console.error)
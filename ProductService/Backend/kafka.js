const {kafka} = require('kafkajs');

const kafka = new Kafka({
  clientId: "product-service",
  brokers: ["kafka:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({groupId: "product-service-group"});

const connectProducer = async () => { 
  await producer.connect();
  console.log("Producer connected to Kafka");
}

const connectConsumer = async (topic, handler) => {
  await consumer.connect();
  await consumer.subscribe({topic, fromBeginning: true});

  await consumer.run({
    eachMessage: async ({message}) => {
      console.log("Received message", message.value.toString());
      handler(message.value.toString());
    }
  })
}

module.exports = {producer, connectProducer, connectConsumer};

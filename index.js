import { createClient } from 'redis';
import { config } from 'dotenv';

config();

const client = await createClient({
  url: process.env.REDIS_URL
})
  .on('error', err => console.log('Redis Client Error', err))
  .connect()
  .then((client) => {
    console.log(`Connected to Redis!`);
    return client;
  });


const disconnect = async () => {
  await client.disconnect();
  console.log(`Disconnected from Redis!`);
};

process.on('exit', disconnect);
process.on('uncaughtException', disconnect);
process.on('unhandledRejection', disconnect);
process.on('SIGINT', async () => {
  await disconnect();
  process.exit();
});
  
const delay = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));
const randomBelow = (max) => Math.random() * max;

let entryNumber = 1;

while (true) {
  const randomData = crypto.randomUUID();

  try {
    await client.set((entryNumber++).toString(), randomData);

    if (entryNumber % 20 == 0) {
        console.log(`${entryNumber}. Uploading data...`);
    }

    await delay(randomBelow(200));
  }
  catch (error) {
    console.error(`Error sending data: ${error.message}`);
    console.error('Retrying...');
    await delay(1000);
  }
}
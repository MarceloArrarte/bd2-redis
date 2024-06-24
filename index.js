import { createClient } from 'redis';
import { config } from 'dotenv';

config();
console.log(`URL Redis: ${process.env.REDIS_URL}`);

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
  console.log(`Last entry processed: ${entryNumber}`);
};

process.on('exit', disconnect);
process.on('uncaughtException', disconnect);
process.on('unhandledRejection', disconnect);
process.on('SIGINT', async () => {
  await disconnect();
  process.exit();
});
  
const DELAY_MS = Number(process.env.DELAY_MS);
const delay = (ms = DELAY_MS) => new Promise((resolve, reject) => setTimeout(resolve, ms));

let entryNumber = 1;

while (true) {
  const randomData = crypto.randomUUID();

  try {
    await client.set((entryNumber).toString(), randomData);
    entryNumber++;

    if (entryNumber % 10 == 0) {
        console.log(`${entryNumber}. Uploading data...`);
    }

    await delay();
  }
  catch (error) {
    console.error(`Error sending data: ${error.message}`);
    console.error('Retrying...');
    await delay(1000);
  }
}
import { createClient } from 'redis';

const client = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect()
  .then((client) => {
    console.log(`Connected to Redis!`);
    return client;
  });

const delay = (max) => () => Math.random() * max;
const delay100 = delay(100);

let t = delay100();
let entryNumber = 1;

setInterval(async () => {
    const randomData = crypto.randomUUID();
    await client.set((entryNumber++).toString(), randomData);
    if (entryNumber % 20 == 0) {
        console.log(`${entryNumber}. Uploading data...`)
    }
    t = delay100();
}, t);

const disconnect = async () => {
    await client.disconnect();
    console.log(`Disconnected from Redis!`);
}

process.on('exit', disconnect);
process.on('uncaughtException', disconnect);
process.on('unhandledRejection', disconnect);
process.on('SIGINT', async () => {
    await disconnect();
    process.exit();
});
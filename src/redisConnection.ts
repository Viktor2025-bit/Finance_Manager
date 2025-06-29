import redis = require('redis');

const client = redis.createClient(); // defaults to localhost:6379

client.on('error', (err : any) => console.error('Redis Client Error', err));

export const  connectRedis = async () => {
  await client.connect();

  await client.set('mykey', 'Hello Redis!');
  const value = await client.get('mykey');

  console.log(value); // → Hello Redis!

  await client.quit();
}


import { promisify } from 'util';
import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.connected = false;
    this.client = createClient().on('error', (err) => {
      console.log('Redis Client Error', err);
    });
    this.getAsync = promisify(this.client.get).bind(this.client);
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    const val = await this.getAsync(key);
    return val;
  }

  async set(key, val, dur) {
    this.client.set(key, val, 'EX', dur);
  }

  async del(key) {
    this.client.del(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;

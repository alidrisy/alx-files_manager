/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/no-hooks */
/* eslint-disable jest/prefer-expect-assertions */
import { expect } from 'chai';
import redisClient from '../utils/redis';

describe('redisClient test', () => {
  const key = 'Id';
  const val = 12;

  before(async () => {
    await redisClient.del(key);
  });

  it('test isAlive', () => {
    const status = redisClient.isAlive();
    expect(status).to.be.true;
  });

  it('test get before set value', async () => {
    const status = await redisClient.get(key);
    expect(status).to.equal(null);
  });

  it('test set value', async () => {
    await redisClient.set(key, val, 200);
    const status = await redisClient.get(key);
    expect(Number(status)).to.equal(val);
  });

  it('test del value', async () => {
    await redisClient.del(key);
    const status = await redisClient.get(key);
    expect(status).to.equal(null);
  });

  it('test expiration set value', async () => {
    await redisClient.set(key, val, 2);
    setTimeout(async () => {
      const status = await redisClient.get(key);
      expect(Number(status)).to.equal(null);
    }, 2100);
  });
});

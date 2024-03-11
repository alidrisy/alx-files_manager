/* eslint-disable jest/no-test-callback */
/* eslint-disable no-unused-expressions */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/no-hooks */
/* eslint-disable jest/prefer-expect-assertions */
import { expect } from 'chai';
import request from 'request';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

describe('- UsersController test', () => {
  const API_URL = 'http://localhost:5000';

  const email = 'abdo@dylan.com';
  const password = 'alx1234!';

  // eslint-disable-next-line no-undef
  before(async () => {
    await dbClient.userCollection.deleteMany({ email });
  });

  describe('- POST /users', () => {
    it('- Create a new user,', (done) => {
      request.post(
        `${API_URL}/users`,
        { json: { email, password } },
        async (_err, res, body) => {
          expect(res.statusCode).to.be.equal(201);
          const user = await dbClient.userCollection.findOne({
            email,
          });
          expect(body.email).to.equal(user.email);
          expect(body.id).to.equal(user._id.toString());
          done();
        },
      );
    });

    it('- Create an exist user,', (done) => {
      request.post(
        `${API_URL}/users`,
        { json: { email, password } },
        (_err, res, body) => {
          expect(res.statusCode).to.be.equal(400);
          expect(body.error).to.equal('Already exist');
          done();
        },
      );
    });

    it('- Create a new user without email', (done) => {
      request.post(
        `${API_URL}/users`,
        { json: { password } },
        (_err, res, body) => {
          expect(res.statusCode).to.be.equal(400);
          expect(body.error).to.equal('Missing email');
          done();
        },
      );
    });

    it('- Create a new user without password', (done) => {
      request.post(
        `${API_URL}/users`,
        { json: { email } },
        (_err, res, body) => {
          expect(res.statusCode).to.be.equal(400);
          expect(body.error).to.equal('Missing password');
          done();
        },
      );
    });
  });

  describe('- Authenticate a user', () => {
    let token = '';
    it('- GET /connect', (done) => {
      const buffer = Buffer.from(`${email}:${password}`);
      const base64Auth = buffer.toString('base64');
      const Authorization = `Basic ${base64Auth}`;
      request.get(
        `${API_URL}/connect`,
        { headers: { Authorization } },
        async (_err, res, body) => {
          expect(res.statusCode).to.be.equal(200);
          const user = await dbClient.userCollection.findOne({
            email,
          });
          const data = JSON.parse(body);
          const key = `auth_${data.token}`;
          token = data.token;
          const userId = await redisClient.get(key);
          expect(userId).to.equal(user._id.toString());
          done();
        },
      );
    });

    it('- GET /users/me', (done) => {
      const headers = {};
      headers['X-Token'] = token;
      request.get(
        `${API_URL}/users/me`,
        { headers },
        async (_err, res, body) => {
          expect(res.statusCode).to.be.equal(200);
          const data = JSON.parse(body);
          const key = `auth_${token}`;
          const userId = await redisClient.get(key);
          const user = await dbClient.userCollection.findOne({
            _id: ObjectId(userId),
          });
          expect(data.email).to.equal(user.email);
          expect(data.id).to.equal(user._id.toString());
          done();
        },
      );
    });

    it('- GET /disconnect', (done) => {
      const headers = {};
      headers['X-Token'] = token;
      request.get(`${API_URL}/disconnect`, { headers }, async (_err, res) => {
        expect(res.statusCode).to.be.equal(204);
        const key = `auth_${token}`;
        const userId = await redisClient.get(key);
        expect(userId).to.be.null;
        done();
      });
    });

    it('- GET /users/me after GET /disconnect', (done) => {
      const headers = {};
      headers['X-Token'] = token;
      request.get(`${API_URL}/users/me`, { headers }, (_err, res, body) => {
        const data = JSON.parse(body);
        expect(res.statusCode).to.be.equal(401);
        expect(data.error).to.equal('Unauthorized');
        done();
      });
    });
  });
});

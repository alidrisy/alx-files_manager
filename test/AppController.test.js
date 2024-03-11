/* eslint-disable jest/no-test-callback */
/* eslint-disable no-unused-expressions */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/no-hooks */
/* eslint-disable jest/prefer-expect-assertions */
import { expect } from 'chai';
import request from 'request';
import dbClient from '../utils/db';

describe('- AppController test', () => {
  const API_URL = 'http://localhost:5000';

  it('- GET /status', (done) => {
    request.get(`${API_URL}/status`, (_err, res, body) => {
      expect(res.statusCode).to.be.equal(200);
      const data = JSON.parse(body);
      expect(data.db).to.be.true;
      expect(data.redis).to.be.true;
      done();
    });
  });

  it('- GET /stats', (done) => {
    request.get(`${API_URL}/stats`, async (_err, res, body) => {
      expect(res.statusCode).to.be.equal(200);
      const data = JSON.parse(body);
      const users = await dbClient.nbUsers();
      const files = await dbClient.nbFiles();
      expect(data.users).to.equal(users);
      expect(data.files).to.equal(files);
      done();
    });
  });
});

/* eslint-disable no-undef */
/* eslint-disable jest/no-test-callback */
/* eslint-disable no-unused-expressions */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/no-hooks */
/* eslint-disable jest/prefer-expect-assertions */
import { expect } from 'chai';
import request from 'request';
import { existsSync } from 'fs';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

describe('- FilesController test', () => {
  const API_URL = 'http://localhost:5000';

  const email = 'abdo@dylan.com';
  const password = 'alx1234!';
  const headers = {};
  const file = {
    name: 'test.txt',
    type: 'file',
    data: 'SGVsbG8gV2Vic3RhY2shCg==',
  };

  before(async () => {
    const key = `auth_${headers['X-Token']}`;
    await redisClient.del(key);
    await dbClient.fileCollection.deleteMany({
      name: file.name,
    });
  });

  it('- GET /connect', (done) => {
    const buffer = Buffer.from(`${email}:${password}`);
    const base64Auth = buffer.toString('base64');
    const Authorization = `Basic ${base64Auth}`;
    request.get(
      `${API_URL}/connect`,
      { headers: { Authorization } },
      async (_err, res, body) => {
        expect(res.statusCode).to.be.equal(200);
        const data = JSON.parse(body);
        headers['X-Token'] = data.token;
        done();
      },
    );
  });

  describe('- POST /files', () => {
    it('- Create a new file,', (done) => {
      expect(1).to.equal(1);
      console.log(headers['X-Token']);
      request.post(
        `${API_URL}/files`,
        {
          json: file,
          headers,
        },
        async (_err, res, body) => {
          expect(res.statusCode).to.be.equal(201);
          const dbFile = await dbClient.fileCollection.findOne({
            name: file.name,
          });
          expect(body.type).to.equal(dbFile.type);
          expect(body.localPath).to.equal(dbFile.localPath);
          expect(existsSync(body.localPath)).to.be.true;
          expect(body.id).to.equal(dbFile._id.toString());
          done();
        },
      );
    });
  });
});

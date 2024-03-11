/* eslint-disable no-unused-expressions */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/no-hooks */
/* eslint-disable jest/prefer-expect-assertions */
import { expect } from 'chai';
import sinon from 'sinon';
import dbClient from '../utils/db';

describe('dbClient test', () => {
  describe('dbClient.userCollection test', () => {
    let countDocuments;
    beforeEach(() => {
      countDocuments = sinon
        .stub(dbClient.userCollection, 'countDocuments')
        .returns(10);
    });

    afterEach(() => {
      countDocuments.restore();
    });

    it('test nbUsers', async () => {
      const status = await dbClient.nbUsers();
      expect(status).to.equal(10);
    });
  });

  describe('dbClient.fileCollection test', () => {
    let countDocuments;
    beforeEach(() => {
      countDocuments = sinon
        .stub(dbClient.fileCollection, 'countDocuments')
        .returns(10);
    });

    afterEach(() => {
      countDocuments.restore();
    });

    it('test nbFiles', async () => {
      const status = await dbClient.nbFiles();
      expect(status).to.equal(10);
    });
  });

  it('test isAlive', async () => {
    const status = await dbClient.isAlive();
    expect(status).to.be.true;
  });
});

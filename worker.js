const Queue = require('bull');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const dbClient = require('./utils/db');

const imageThumbnail = require('image-thumbnail');

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job, done) => {
  console.log('start');
  if (!job.data.fileId) {
    done(new Error('Missing fileId'));
  }
  if (!job.data.userId) {
    done(new Error('Missing userId'));
  }
  const file = await dbClient.fileCollection.findOne({
    _id: ObjectId(job.data.fileId),
    userId: ObjectId(job.data.userId),
  });
  if (!file) {
    done(new Error('File not found'));
  }

  const thumbnail5 = await imageThumbnail(file.locallPath, { width: 500 });
  fs.writeFileSync(`${file.locallPath}_500`, thumbnail5);
  const thumbnail2 = await imageThumbnail(file.locallPath, { width: 250 });
  fs.writeFileSync(`${file.locallPath}_250`, thumbnail2);
  const thumbnail1 = await imageThumbnail(file.locallPath, { width: 100 });
  fs.writeFileSync(`${file.locallPath}_100`, thumbnail1);
  done();
});

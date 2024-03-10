import { v4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { contentType } from 'mime-types';
import { ObjectId } from 'mongodb';
import Queue from 'bull/lib/queue';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { getBase64, createFolder } from '../utils/utils';

const fileQueue = new Queue('fileQueue');

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    const mime = ['folder', 'file', 'image'];

    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // eslint-disable-next-line object-curly-newline
    const { name, type, parentId, isPublic, data } = req.body;

    if (!name) return res.status(400).send({ error: 'Missing name' });

    if (!type || !mime.includes(type)) {
      return res.status(400).send({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).send({ error: 'Missing data' });
    }

    if (parentId) {
      const parintFile = await dbClient.fileCollection.findOne({
        _id: ObjectId(parentId),
      });
      if (!parintFile) {
        return res.status(400).send({ error: 'Parent not found' });
      }
      if (parintFile.type !== 'folder') {
        return res.status(400).send({ error: 'Parent is not a folder' });
      }
    }

    if (type === 'folder') {
      const folder = await dbClient.fileCollection.insertOne({
        userId: ObjectId(userId),
        name,
        type,
        isPublic: isPublic || false,
        parentId: ObjectId(parentId) || 0,
      });
      return res.status(201).send({
        id: folder.insertedId,
        userId,
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
      });
    }
    const storingFolder = process.env.FOLDER_PATH || '/tmp/files_manager';
    await createFolder(storingFolder);
    const filename = v4();
    const localPath = path.join(storingFolder, filename);
    fs.writeFileSync(localPath, getBase64(data));
    const file = await dbClient.fileCollection.insertOne({
      userId: ObjectId(userId),
      name,
      type,
      isPublic: isPublic || false,
      parentId: ObjectId(parentId) || 0,
      localPath,
    });
    const fileId = file.insertedId.toString();
    if (type === 'image') {
      fileQueue.add({ userId, fileId });
    }
    return res.status(201).send({
      id: file.insertedId,
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
      localPath,
    });
  }

  static async getShow(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const fileId = req.params.id;
    const file = await dbClient.fileCollection.findOne({
      _id: ObjectId(fileId),
      userId: ObjectId(userId),
    });
    if (!file) {
      return res.status(404).send({ error: 'Not found' });
    }
    const { _id, ...rest } = file;
    return res.send({ id: _id, ...rest });
  }

  static async getIndex(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const filter = { userId: ObjectId(userId) };
    if (req.query.parentId) {
      filter.parentId = ObjectId(req.query.parentId);
    }
    const page = Number.parseInt(req.query.page, 10) || 0;
    const files = await dbClient.fileCollection
      .aggregate([
        {
          $match: filter,
        },

        {
          $skip: page * 20,
        },
        {
          $limit: 20,
        },
      ])
      .toArray();
    if (!files) {
      return res.status(404).send({ error: 'Not found' });
    }
    const newFiles = files.map((file) => {
      const { _id, ...rest } = file;
      return { id: _id, ...rest };
    });
    return res.send(newFiles);
  }

  static async putPublish(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;
    console.log(req.params.id);
    const file = await dbClient.fileCollection.findOne({
      _id: ObjectId(fileId),
      userId: ObjectId(userId),
    });
    if (!file) {
      return res.status(404).send({ error: 'Not found' });
    }
    await dbClient.fileCollection.updateOne(
      {
        _id: ObjectId(fileId),
        userId: ObjectId(userId),
      },
      {
        $set: { isPublic: true },
      },
    );
    const { _id, isPublic, ...rest } = file;
    return res.send({ id: _id, isPublic: true, ...rest });
  }

  static async putUnpublish(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;
    const file = await dbClient.fileCollection.findOne({
      _id: ObjectId(fileId),
      userId: ObjectId(userId),
    });
    if (!file) {
      return res.status(404).send({ error: 'Not found' });
    }
    await dbClient.fileCollection.updateOne(
      {
        _id: ObjectId(fileId),
        userId: ObjectId(userId),
      },
      {
        $set: { isPublic: false },
      },
    );
    const { _id, isPublic, ...rest } = file;
    return res.send({ id: _id, isPublic: false, ...rest });
  }

  static async getFile(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    const fileId = req.params.id;
    const { size } = req.query;
    const file = await dbClient.fileCollection.findOne({
      _id: ObjectId(fileId),
    });
    if (!file) {
      return res.status(404).send({ error: 'Not found' });
    }
    if (!file.isPublic && file.userId.toString() !== userId) {
      return res.status(404).send({ error: 'Not found' });
    }
    if (file.type === 'folder') {
      return res.status(400).send({ error: "A folder doesn't have content" });
    }
    let filePath = file.localPath;
    if (size) {
      filePath += `_${size}`;
    }
    if (!fs.existsSync(filePath)) {
      return res.status(404).send({ error: 'Not found' });
    }

    res.set(
      'Content-Type',
      contentType(file.name) || 'text/plain; charset=utf-8',
    );
    return res.sendFile(filePath);
  }
}

export default FilesController;

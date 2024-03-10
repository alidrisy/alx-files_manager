import { v4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { ObjectId } from 'mongodb';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { getBase64, createFolder } from '../utils/utils';

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
        userId,
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
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
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
      localPath,
    });
    console.log(file);
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
}

export default FilesController;

import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import { v4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class AuthController {
  static async getConnect(req, res) {
    const base64Auth = req.headers.authorization.slice(6);
    const buffer = Buffer.from(base64Auth, 'base64');
    const auth = buffer.toString('utf-8');
    const email = auth.slice(0, auth.indexOf(':'));
    const password = auth.slice(auth.indexOf(':') + 1);
    const user = await dbClient.userCollection.findOne({ email });
    if (!user || user.password !== sha1(password)) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const token = v4();
    const key = `auth_${token}`;
    redisClient.set(key, user._id.toString(), 24 * 60 * 60);
    return res.status(200).send({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    const user = await dbClient.userCollection.findOne({
      _id: ObjectId(userId),
    });
    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    await redisClient.del(token);
    return res.status(204).send();
  }
}

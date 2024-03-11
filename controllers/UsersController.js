import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const userQueue = new Queue('userQueue');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      res.status(400).send({ error: 'Missing email' });
    } else if (!password) {
      res.status(400).send({ error: 'Missing password' });
    } else if (await dbClient.userCollection.findOne({ email })) {
      res.status(400).send({ error: 'Already exist' });
    } else {
      const user = await dbClient.userCollection.insertOne({
        email,
        password: sha1(password),
      });
      userQueue.add({ userId: user.insertedId });
      res.status(201).send({ id: user.insertedId, email });
    }
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    const user = await dbClient.userCollection.findOne({
      _id: ObjectId(userId),
    });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.send({ id: user._id, email: user.email });
  }
}

export default UsersController;

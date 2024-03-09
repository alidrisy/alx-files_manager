import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { ObjectId } from 'mongodb';
import sha1 from 'sha1';

class UsersController {
  static async postNew(req, res) {
    const email = req.body?.email;
    const password = req.body?.password;
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
      res.status(201).send({ id: user.insertedId, email });
    }
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    const user_id = await redisClient.get(token);
    const user = await dbClient.userCollection.findOne({
      _id: ObjectId(user_id),
    });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.send({ id: user._id, email: user.email });
  }
}

export default UsersController;

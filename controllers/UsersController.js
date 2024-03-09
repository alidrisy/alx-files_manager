import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { ObjectId } from 'mongodb';
import sha1 from 'sha1';

class UsersController {
  static postNew = async (req, res) => {
    const email = req.body?.email;
    const password = req.body?.password;
    if (!email) {
      return res.status(400).send({ error: 'Missing email' });
    } else if (!password) {
      return res.status(400).send({ error: 'Missing password' });
    } else if (await dbClient.getUsers('email', email)) {
      return res.status(400).send({ error: 'Already exist' });
    } else {
      const user = await dbClient.setUsers(email, sha1(password));
      return res.send({ id: user._id, email: user.email });
    }
  };

  static getMe = async (req, res) => {
    const token = req.headers['x-token'];
    const user_id = await redisClient.get(token);
    console.log(user_id);
    const user = await dbClient.getUsers('_id', ObjectId(user_id));
    console.log(user);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.send({ id: user._id, email: user.email });
  };
}

export default UsersController;

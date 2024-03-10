import sha1 from 'sha1';
import { v4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { getBase64 } from '../utils/utils';

export default class AuthController {
  static async getConnect(req, res) {
    const base64Auth = req.headers.authorization.slice(6);

    if (!base64Auth) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const auth = getBase64(base64Auth);
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
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    await redisClient.del(key);
    return res.status(204).send();
  }
}

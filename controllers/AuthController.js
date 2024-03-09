import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import sha1 from 'sha1';
import { v4 } from 'uuid';

class AuthController {
  static getConnect = async (req, res) => {
    const base64Auth = req.headers.authorization.slice(6);
    const buffer = Buffer.from(base64Auth, 'base64');
    const auth = buffer.toString();
    const email = auth.slice(0, auth.indexOf(':'));
    const password = auth.slice(auth.indexOf(':') + 1);
    const user = await dbClient.getUsers('email', email);
    if (!user || user.password !== sha1(password)) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const token = v4();
    redisClient.set(token, user._id, 24 * 60 * 60);
    return res.send({ token });
  };

  static getDisconnect = async (req, res) => {
    const token = req.headers['x-token'];
    const user = await redisClient.get(token);
    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    await redisClient.del(token);
    return res.status(204).send();
  };
}

export default AuthController;

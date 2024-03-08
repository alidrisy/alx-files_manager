import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus = (_req, res) => {
    res.json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
  };

  static getStats = async (_req, res) => {
    res.json({
      users: await dbClient.nbUsers(),
      files: await dbClient.nbFiles(),
    });
  };
}

export default AppController;

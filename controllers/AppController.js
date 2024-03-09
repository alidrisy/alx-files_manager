import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(_req, res) {
    res
      .status(200)
      .send({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
  }

  static async getStats(_req, res) {
    res.status(200).send({
      users: await dbClient.nbUsers(),
      files: await dbClient.nbFiles(),
    });
  }
}

export default AppController;

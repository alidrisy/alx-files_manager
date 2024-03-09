import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export const getStatus = (request, response) => {
  const status = {
    redis: redisClient.isAlive(),
    db: dbClient.isAlive(),
  };
  response.status(200).send(status);
};

export const getStats = async (request, response) => {
  const stats = {
    users: await dbClient.nbUsers(),
    files: await dbClient.nbFiles(),
  };
  response.status(200).send(stats);
};

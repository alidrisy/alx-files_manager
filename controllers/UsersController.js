import dbClient from '../utils/db';
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
      res.send({ id: user.insertedId, email });
    }
  }
}

export default UsersController;

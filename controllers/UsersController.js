import dbClient from '../utils/db';
import sha1 from 'sha1';

class UsersController {
  static postNew = async (req, res) => {
    const email = req.body?.email;
    const password = req.body?.password;
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
    } else if (!password) {
      res.status(400).json({ error: 'Missing password' });
    } else if (await dbClient.getUsers(email)) {
      res.status(400).json({ error: 'Already exist' });
    } else {
      const user = await dbClient.setUsers(email, sha1(password));
      console.log(user);
      res.json({ email: user.email, id: user._id });
    }
  };
}

export default UsersController;

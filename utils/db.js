import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
        this.db = client.db(database);
      } else {
        console.log(err.message);
        this.db = false;
      }
    });
    // this.userCollection = this.db.collection('users');
  }

  isAlive() {
    return Boolean(this.db);
  }

  async nbUsers() {
    const val = await this.db.collection('users').countDocuments();
    return val;
  }

  async nbFiles() {
    const val = await this.db.collection('files').countDocuments();
    return val;
  }

  async getUsers(key, value) {
    const filter = {};
    filter[key] = value;
    const val = await this.db.collection('users').findOne(filter);
    return val;
  }

  async setUsers(email, password) {
    const val = await this.db
      .collection('users')
      .insertOne({ email, password });
    return val.ops[0];
  }
}

const dbClient = new DBClient();

export default dbClient;

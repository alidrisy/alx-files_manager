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
        this.userCollection = this.db.collection('users');
        this.fileCollection = this.db.collection('files');
      } else {
        console.log(err.message);
        this.db = false;
      }
    });
  }

  isAlive() {
    return Boolean(this.db);
  }

  async nbUsers() {
    const val = await this.userCollection.countDocuments();
    return val;
  }

  async nbFiles() {
    const val = await this.fileCollection.countDocuments();
    return val;
  }
}

const dbClient = new DBClient();

export default dbClient;

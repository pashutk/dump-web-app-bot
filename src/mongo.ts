import { MongoClient } from 'mongodb';
import { config } from './config';

const client = new MongoClient(config.mongoConnectionString);

let connection: Promise<MongoClient> | null = null;

const getConnection = (): Promise<MongoClient> => {
	if (connection === null) {
		connection = client.connect();
	}

	return connection;
};

export const getDb = () => getConnection().then((c) => c.db(config.dbName));

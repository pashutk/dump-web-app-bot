import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;
if (!MONGO_CONNECTION_STRING) {
	throw new Error('No connection string provided');
}

const client = new MongoClient(MONGO_CONNECTION_STRING);

let connection: Promise<MongoClient> | null = null;

const getConnection = (): Promise<MongoClient> => {
	if (connection === null) {
		connection = client.connect();
	}

	return connection;
};

export const getDb = () => getConnection().then((c) => c.db('webdumpbot'));

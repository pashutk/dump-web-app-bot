import * as dotenv from 'dotenv';
dotenv.config();

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
	throw new Error('No bot token provided');
}

const publicUrl = process.env.PUBLIC_URL;
if (!publicUrl) {
	throw new Error('No public url provided');
}

const mongoConnectionString = process.env.MONGO_CONNECTION_STRING;
if (!mongoConnectionString) {
	throw new Error('No connection string provided');
}

export const config = {
	botToken,
	publicUrl,
	mongoConnectionString,
	dbName: 'webdumpbot'
};

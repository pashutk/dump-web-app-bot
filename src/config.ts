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

export const config = {
	botToken,
	publicUrl
};

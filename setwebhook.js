import { Bot } from 'grammy';
import * as dotenv from 'dotenv';
dotenv.config();

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
	console.error('No bot token provided');
	process.exit(1);
}

const publicUrl = process.env.PUBLIC_URL;
if (!publicUrl) {
	console.error('No public url provided');
	process.exit(1);
}

const bot = new Bot(botToken);

await bot.api.setWebhook(`${publicUrl}/bot`);

await bot.api.setChatMenuButton({
	menu_button: { type: 'web_app', text: 'Open UI', web_app: { url: publicUrl } }
});

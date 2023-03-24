import * as dotenv from 'dotenv';
dotenv.config();

import { Bot, webhookCallback } from 'grammy';
import type { Chat as TgChat } from 'grammy/types';
import { getDb } from '../../../../../../../Users/pavelglushkov/projects/webmetabot/src/mongo';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
	throw new Error('No bot token provided');
}

const bot = new Bot(BOT_TOKEN);

type Chat = {
	tgchat: TgChat;
	createdAtMs: number;
	updatedAt: number;
};

const saveChat = async (tgchat: TgChat) => {
	const db = await getDb();
	const now = Date.now();
	await db.collection<Chat>('chats').findOneAndUpdate(
		{ 'tgchat.id': tgchat.id },
		{
			$set: { updatedAt: now, tgchat },
			$setOnInsert: { createdAt: now }
		},
		{ upsert: true }
	);
};

const saveEntry = async (chatId: number, text: string, raw: unknown) => {
	const db = await getDb();
	const now = Date.now();
	await db.collection('entries').insertOne({
		chatId,
		text,
		raw,
		createdAt: now,
		id: crypto.randomUUID()
	});
};

bot.command('start', async (ctx) => {
	await saveChat(ctx.chat);
	return ctx.reply('Welcome! Just send me the links.');
});

bot.on('message', async (ctx) => {
	await saveChat(ctx.chat);
	await saveEntry(ctx.chat.id, ctx.message.text ?? '', ctx.message);
	return ctx.reply('Added to collection');
});

export const POST = webhookCallback(bot, 'sveltekit');

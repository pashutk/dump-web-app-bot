import { Bot } from 'grammy';
import type { Chat as TgChat } from 'grammy/types';
import { config } from './config';
import { getDb } from './mongo';

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

const bot = new Bot(config.botToken);

bot.command('start', async (ctx) => {
	await saveChat(ctx.chat);
	return ctx.reply('Welcome! Just send me the links.');
});

bot.on('message', async (ctx) => {
	await saveChat(ctx.chat);
	await saveEntry(ctx.chat.id, ctx.message.text ?? '', ctx.message);
	return ctx.reply('Added to collection');
});

export { bot };

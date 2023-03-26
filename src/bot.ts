import { Bot } from 'grammy';
import type { Chat as TgChat } from 'grammy/types';
import { config } from './config';
import { getDb } from './mongo';
import * as S from '@effect/schema/Schema';
import { Entry } from './model';

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
	await db.collection('entries').insertOne(
		S.encode(Entry)({
			chatId,
			text,
			raw: raw as S.Json,
			createdAt: new Date(),
			id: crypto.randomUUID()
		})
	);
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

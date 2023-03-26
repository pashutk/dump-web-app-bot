import { Bot } from 'grammy';
import type { Chat as TgChat } from 'grammy/types';
import { config } from './config';
import { getDb } from './mongo';
import * as S from '@effect/schema/Schema';
import { Entry } from './model';

/**
 * `Chat` is an object with three properties: `tgchat`, `createdAtMs`, and `updatedAt`.
 * @property {TgChat} tgchat - The chat object from the Telegram API.
 * @property {number} createdAtMs - The time when the chat was created.
 * @property {number} updatedAt - The last time the chat was updated.
 */
type Chat = {
	tgchat: TgChat;
	createdAtMs: number;
	updatedAt: number;
};

/**
 * It saves a chat to the database
 * @param {TgChat} tgchat - TgChat - the chat object from Telegram
 */
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

/**
 * It takes a chat ID, an entry text, and a raw value, and saves it to the database
 * @param {number} chatId - number - the chat id of the chat where the entry was posted
 * @param {string} text - The text of the message
 * @param {unknown} raw - unknown
 */
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

import { webhookCallback } from 'grammy';
import { bot } from '$lib/server/bot';

export const POST = webhookCallback(bot, 'sveltekit');

import { json } from '@sveltejs/kit';
import { config } from '../../../config';
import type { RequestHandler } from './$types';
import * as S from '@effect/schema/Schema';
import * as E from '@effect/data/Either';
import { formatErrors } from '@effect/schema/TreeFormatter';
import type { TelegramWebApps } from '../../../tg';
import { getDb } from '../../../mongo';
const { createHmac } = await import('node:crypto');

type A = TelegramWebApps.WebAppInitData;

const WebAppUser = S.struct({
	id: S.number,
	first_name: S.string,
	last_name: S.optional(S.string),
	username: S.optional(S.string)
});

const WebAppInitData = S.struct({
	query_id: S.string,
	user: WebAppUser
});

/** Source: https://gist.github.com/konstantin24121/49da5d8023532d66cc4db1136435a885  */
const verifyTelegramWebAppData = (
	telegramInitData: string
): E.Either<string, S.To<typeof WebAppInitData>> => {
	const encoded = decodeURIComponent(telegramInitData);

	const secret = createHmac('sha256', 'WebAppData').update(config.botToken);

	const arr = encoded.split('&');
	const hashIndex = arr.findIndex((str) => str.startsWith('hash='));
	const hashPair = arr.splice(hashIndex)[0];
	if (!hashPair) {
		return E.left('No hash param provided');
	}

	const hash = hashPair.split('=')[1];
	arr.sort((a, b) => a.localeCompare(b));
	const dataCheckString = arr.join('\n');

	const actualHash = createHmac('sha256', secret.digest()).update(dataCheckString).digest('hex');

	if (actualHash !== hash) {
		return E.left('Data integrity check failed');
	}

	const parseResult = S.parseEither(WebAppInitData)(
		Object.fromEntries(
			encoded.split('&').map((pair) => {
				const sepIndex = pair.indexOf('=');
				const key = pair.slice(0, sepIndex);
				const value = pair.slice(sepIndex + 1);
				return [key, key === 'user' ? JSON.parse(value) : value];
			})
		),
		{ isUnexpectedAllowed: true }
	);

	if (E.isLeft(parseResult)) {
		return E.left(formatErrors(parseResult.left.errors));
	}

	return E.right(parseResult.right);
};

export const POST: RequestHandler = async ({ request }) => {
	const input = await request.json();
	const initData = input['initData'];
	if (!initData || typeof initData !== 'string') {
		return json(E.left('No initData passed'));
	}

	const appData = verifyTelegramWebAppData(initData);
	if (E.isLeft(appData)) {
		return json(appData);
	}

	const db = await getDb();
	const entries = await db
		.collection('entries')
		.find({
			chatId: appData.right.user.id
		})
		.toArray();

	return json(E.right(entries));
};

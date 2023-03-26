import * as E from '@effect/data/Either';
import * as S from '@effect/schema/Schema';
import { WebAppInitData } from '../model';
import { formatErrors } from '@effect/schema/TreeFormatter';
const { createHmac } = await import('node:crypto');

/**
 * It takes a initData string, decodes it, checks the hash, and then parses it into a WebAppInitData type
 * @param {string} telegramInitData - The data string that was passed to the web app.
 * @param {string} botToken – Telegram bot token used for data integrity check
 * @returns Either<string, WebAppInitData>
 *
 * Source: https://gist.github.com/konstantin24121/49da5d8023532d66cc4db1136435a885
 */
export const verifyTelegramWebAppData = (
	telegramInitData: string,
	botToken: string
): E.Either<string, WebAppInitData> => {
	const encoded = decodeURIComponent(telegramInitData);

	const secret = createHmac('sha256', 'WebAppData').update(botToken);

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

	return parseResult;
};

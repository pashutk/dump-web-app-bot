import * as Effect from '@effect/io/Effect';
import { pipe } from '@effect/data/Function';
import { entriesByChatId, getDb } from '../../../mongo.server';
import { createEndpoint } from '../../../utils/requestHandler';
import { verifyTelegramWebAppData } from '../../../utils/tgWebAppData.server';
import { entries } from '../../../endpoint';
import { config } from '../../../config.server';

export const POST = createEndpoint(entries, ({ initData }) =>
	pipe(
		verifyTelegramWebAppData(initData, config.botToken),
		Effect.fromEither,
		Effect.flatMap(({ user }) => entriesByChatId(user.id))
	)
);

import * as Effect from '@effect/io/Effect';
import { pipe } from '@effect/data/Function';
import { entriesByChatId, getDb } from '../../../mongo';
import { createEndpoint } from '../../../utils/requestHandler';
import { verifyTelegramWebAppData } from '../../../utils/tgWebAppData';
import { entries } from '../../../endpoint';

export const POST = createEndpoint(entries, ({ initData }) =>
	pipe(
		verifyTelegramWebAppData(initData),
		Effect.fromEither,
		Effect.flatMap(({ user }) => entriesByChatId(user.id))
	)
);

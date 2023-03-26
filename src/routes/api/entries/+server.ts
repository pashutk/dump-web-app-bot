import * as Effect from '@effect/io/Effect';
import { pipe } from '@effect/data/Function';
import { entriesByChatId } from '$lib/server/mongo';
import { createEndpoint } from '$lib/utils/requestHandler';
import { verifyTelegramWebAppData } from '$lib/utils/tgWebAppData.server';
import { entries } from '$lib/endpoint';
import { config } from '$lib/server/config';

export const POST = createEndpoint(entries, ({ initData }) =>
	pipe(
		verifyTelegramWebAppData(initData, config.botToken),
		Effect.fromEither,
		Effect.flatMap(({ user }) => entriesByChatId(user.id))
	)
);

import * as S from '@effect/schema/Schema';
import * as Effect from '@effect/io/Effect';
import { pipe } from '@effect/data/Function';
import { entriesByChatId } from '../../../mongo';
import { createHandler } from '../../../utils/requestHandler';
import { Entry } from '../../../model';
import { verifyTelegramWebAppData } from '../../../utils/tgWebAppData';

export const POST = createHandler(
	S.struct({
		initData: S.string
	}),
	S.array(Entry),
	({ initData }) =>
		pipe(
			verifyTelegramWebAppData(initData),
			Effect.fromEither,
			Effect.flatMap(({ user }) => entriesByChatId(user.id))
		)
);

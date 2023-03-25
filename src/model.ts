import * as S from '@effect/schema/Schema';

export const Entry = S.struct({
	chatId: S.number,
	text: S.string,
	raw: S.json,
	createdAt: S.dateFromString,
	id: S.string
});

export type Entry = S.To<typeof Entry>;

const WebAppUser = S.struct({
	id: S.number,
	first_name: S.string,
	last_name: S.optional(S.string),
	username: S.optional(S.string)
});

export const WebAppInitData = S.struct({
	query_id: S.string,
	user: WebAppUser
});

export type WebAppInitData = S.To<typeof WebAppInitData>;

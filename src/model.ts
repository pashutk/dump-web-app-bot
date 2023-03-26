import * as S from '@effect/schema/Schema';

/* Defining a schema for the Entry type. */
export const Entry = S.struct({
	chatId: S.number,
	text: S.string,
	raw: S.json,
	createdAt: S.dateFromString,
	id: S.string
});

/** Defining the type described by Entry schema */
export type Entry = S.To<typeof Entry>;

/* Defining a schema for the WebAppUser type. */
const WebAppUser = S.struct({
	id: S.number,
	first_name: S.string,
	last_name: S.optional(S.string),
	username: S.optional(S.string)
});

/* Defining a schema for the WebAppInitData type. */
export const WebAppInitData = S.struct({
	query_id: S.string,
	user: WebAppUser
});

/** Defining the type described by WebAppInitData schema */
export type WebAppInitData = S.To<typeof WebAppInitData>;

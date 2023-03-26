import { pipe } from '@effect/data/Function';
import * as Effect from '@effect/io/Effect';
import * as S from '@effect/schema/Schema';
import { formatErrors } from '@effect/schema/TreeFormatter';
import { MongoClient } from 'mongodb';
import { config } from './config';
import { Entry } from './model';

/* It's creating a new MongoClient object. */
const client = new MongoClient(config.mongoConnectionString);

let connection: Promise<MongoClient> | null = null;

/**
 * It returns a promise that resolves to a MongoClient
 * @returns A promise that resolves to a MongoClient
 */
const getConnection = (): Promise<MongoClient> => {
	if (connection === null) {
		connection = client.connect();
	}

	return connection;
};

/**
 * It returns a promise that resolves to the database object
 */
export const getDb = () => getConnection().then((c) => c.db(config.dbName));

/**
 * GetDbE is a function returning an effect that attempts to get a db connection,
 * and if it fails, it fails with the string 'Failed to get db connection'
 */
const getDbE = () => Effect.attemptCatchPromise(getDb, (reason) => 'Failed to get db connection');

/**
 * It produces effect which fetches all entries from the database for a given chatId
 * @param {number} chatId - number - the chat id to fetch entries for
 * @returns Effect.Effect<never, string, readonly Entry[]>
 */
export const entriesByChatId = (chatId: number): Effect.Effect<never, string, readonly Entry[]> => {
	return pipe(
		getDbE(),
		Effect.flatMap((db) =>
			Effect.attemptCatchPromise(
				() => db.collection('entries').find({ chatId }).toArray(),
				(reason) => 'Failed to fetch entries from db'
			)
		),
		Effect.flatMap((docs) =>
			pipe(
				S.parseEffect(S.array(Entry))(docs, { isUnexpectedAllowed: true }),
				Effect.mapError((err) => `Failed to parse db entries: ` + formatErrors(err.errors))
			)
		)
	);
};

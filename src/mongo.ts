import { pipe } from '@effect/data/Function';
import * as Effect from '@effect/io/Effect';
import * as S from '@effect/schema/Schema';
import { formatErrors } from '@effect/schema/TreeFormatter';
import { MongoClient } from 'mongodb';
import { config } from './config';
import { Entry } from './model';

const client = new MongoClient(config.mongoConnectionString);

let connection: Promise<MongoClient> | null = null;

const getConnection = (): Promise<MongoClient> => {
	if (connection === null) {
		connection = client.connect();
	}

	return connection;
};

export const getDb = () => getConnection().then((c) => c.db(config.dbName));

const getDbE = () => Effect.attemptCatchPromise(getDb, (reason) => 'Failed to get db connection');

export const entriesByChatId = (chatId: number): Effect.Effect<never, string, readonly Entry[]> =>
	pipe(
		getDbE(),
		Effect.flatMap((db) =>
			Effect.attemptCatchPromise(
				() => db.collection('entries').find({ chatId }).toArray(),
				(reason) => 'Failed to fetch entries from db'
			)
		),
		Effect.flatMap((docs) =>
			pipe(
				docs,
				S.parseEffect(S.array(Entry)),
				Effect.mapError((err) => `Failed to parse db entries: ` + formatErrors(err.errors))
			)
		)
	);

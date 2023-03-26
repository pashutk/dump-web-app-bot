import type * as Kit from '@sveltejs/kit';
import * as S from '@effect/schema/Schema';
import * as Effect from '@effect/io/Effect';
import { pipe } from '@effect/data/Function';
import { formatErrors } from '@effect/schema/TreeFormatter';
import { json } from '@sveltejs/kit';
import type { Endpoint } from '../endpoint';

export const createHandler =
	<
		InputFrom,
		InputTo,
		OutputFrom,
		OutputTo,
		P extends Partial<Record<string, string>>,
		R extends string | null
	>(
		inputSchema: S.Schema<InputFrom, InputTo>,
		outputSchema: S.Schema<OutputFrom, OutputTo>,
		handler: (input: InputTo) => Effect.Effect<never, string, OutputTo>
	): Kit.RequestHandler<P, R> =>
	async ({ request }) => {
		const effect = pipe(
			Effect.attemptPromise(() => request.json()),
			Effect.flatMap((input) =>
				pipe(
					input,
					S.parseEffect(inputSchema),
					Effect.mapError((err) => `Failed to parse input: ` + formatErrors(err.errors))
				)
			),
			Effect.flatMap(handler),
			Effect.flatMap(S.encodeEffect(outputSchema))
		);

		return Effect.runPromiseEither(effect).then(json);
	};

export const createEndpoint = <IFrom, OFrom, ITo = IFrom, OTo = OFrom>(
	{ input, output }: Endpoint<IFrom, OFrom, ITo, OTo>,
	handler: (input: ITo) => Effect.Effect<never, string, OTo>
) => createHandler(input, output, handler);

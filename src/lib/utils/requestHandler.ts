import type * as Kit from '@sveltejs/kit';
import * as S from '@effect/schema/Schema';
import * as Effect from '@effect/io/Effect';
import { pipe } from '@effect/data/Function';
import { formatErrors } from '@effect/schema/TreeFormatter';
import { json } from '@sveltejs/kit';
import type { Endpoint } from '$lib/endpoint';

/**
 * It takes a Schema of the input, a Schema of the output, and a function that takes the
 * input and returns an SvelteKit RequestHandler. It returns a request handler that takes a
 * request, parses the input, runs the effect, and encodes the output
 * @param inputSchema - The schema that will be used to parse the input.
 * @param outputSchema - S.Schema<OutputFrom, OutputTo>
 * @param handler - (input: InputTo) => Effect.Effect<never, string, OutputTo>
 * @returns RequestHandler.
 */
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

/**
 * CreateEndpoint takes an Endpoint and a handler function and returns a RequestHandler
 * @param  - Endpoint<IFrom, OFrom, ITo = IFrom, OTo = OFrom>
 * @param handler - (input: ITo) => Effect.Effect<never, string, OTo>
 */
export const createEndpoint = <IFrom, OFrom, ITo = IFrom, OTo = OFrom>(
	{ input, output }: Endpoint<IFrom, OFrom, ITo, OTo>,
	handler: (input: ITo) => Effect.Effect<never, string, OTo>
) => createHandler(input, output, handler);

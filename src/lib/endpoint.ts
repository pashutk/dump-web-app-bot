import * as S from '@effect/schema/Schema';
import { Entry } from '$lib/model';

/**
 * `Endpoint` is a type that describes a function that takes an input of type `IFrom` and returns an
 * output of type `OFrom`.
 *
 * The `input` and `output` properties are schemas that describe how to convert the input and output
 * types to and from the types that the function actually takes and returns.
 *
 * The `IFrom` and `OFrom` types are the types that the function takes and returns.
 *
 * The `ITo` and `OTo` types are the types that the function actually takes and returns.
 *
 * @property input - The input schema.
 * @property output - The output schema.
 */
export type Endpoint<IFrom, OFrom, ITo = IFrom, OTo = OFrom> = {
	input: S.Schema<IFrom, ITo>;
	output: S.Schema<OFrom, OTo>;
};

/**
 * Constructor of Endpoint type. It takes two schemas and returns an endpoint
 * @param input - The input schema.
 * @param output - The output schema.
 */
const endpoint = <IFrom, OFrom, ITo, OTo>(
	input: S.Schema<IFrom, ITo>,
	output: S.Schema<OFrom, OTo>
): Endpoint<IFrom, OFrom, ITo, OTo> => ({ input, output });

/**
 * Creating an endpoint that takes a struct with a string property called initData and returns an array of Entry objects.
 */
export const entries = endpoint(
	S.struct({
		initData: S.string
	}),
	S.array(Entry)
);

export const preview = endpoint(
	S.struct({
		url: S.string
	}),
	S.void
);

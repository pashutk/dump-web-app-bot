import * as S from '@effect/schema/Schema';
import { Entry } from './model';

export type Endpoint<IFrom, OFrom, ITo = IFrom, OTo = OFrom> = {
	input: S.Schema<IFrom, ITo>;
	output: S.Schema<OFrom, OTo>;
};

const endpoint = <IFrom, OFrom, ITo, OTo>(
	input: S.Schema<IFrom, ITo>,
	output: S.Schema<OFrom, OTo>
): Endpoint<IFrom, OFrom, ITo, OTo> => ({ input, output });

export const entries = endpoint(
	S.struct({
		initData: S.string
	}),
	S.array(Entry)
);

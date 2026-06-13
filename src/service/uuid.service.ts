import { v1, v4, v6, v7 } from 'uuid';

export type GeneratorType = 'V_4' | 'V_6' | 'V_1' | 'V_7';

const GENERATOR_MAP: Record<GeneratorType, ()=>string> = {
	V_4: v4,
	V_6: v6,
	V_7: v7,
	V_1: v1,
} as const;

const generateValues = (type: GeneratorType, count: number) => {
	const values: string[] = [];

	const generator = GENERATOR_MAP[type];

	for (let i = 0; i < count; i++) {
		const value = generator();
		values.push(value);
	}

	return values;
};

export const UuidService = {
	generateValues
};

export const HashOptionTypeConstant = {
	ARGON: 'ARGON',
	BCRYPT: 'BCRYPT',
} as const;

export type HashOptionType = keyof typeof HashOptionTypeConstant;
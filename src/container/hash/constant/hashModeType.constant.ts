
export const HashModeTypeConstant = {
	ARGON: 'ARGON',
	BCRYPT: 'BCRYPT',
} as const;

export type HashModeType = keyof typeof HashModeTypeConstant;
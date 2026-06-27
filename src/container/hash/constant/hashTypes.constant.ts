export const HashTypesConstant = {
	SHA_224: 'SHA_224',
	SHA_256: 'SHA_256',
	SHA_384: 'SHA_384',
	SHA_512: 'SHA_512',
	SHA3_224: 'SHA3_224',
	SHA3_256: 'SHA3_256',
	SHA3_384: 'SHA3_384',
	SHA3_512: 'SHA3_512',
	MD5: 'MD5',
	BCRYPT: 'BCRYPT',
	ARGON2D: 'ARGON2D',
	ARGON2I: 'ARGON2I',
	ARGON2ID: 'ARGON2ID',
} as const;

export type HashType = keyof typeof HashTypesConstant;
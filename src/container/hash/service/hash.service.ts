import { HashType, HashTypesConstant } from '@/container/hash/constant/hashTypes.constant.ts';
import {
	sha224,
	sha256,
	sha384,
	sha512,
	md5,
	bcrypt,
	argon2i,
	argon2d,
	argon2id,
	sha3,
	BcryptOptions,
	IArgon2Options
} from 'hash-wasm';

export type ExcludedBcrypt = Omit<BcryptOptions, 'password'>;
export type ExcludedArgon = Omit<IArgon2Options, 'password'>;

type ExcludedOptionType = Exclude<HashType, 'ARGON2D' | 'ARGON2I' | 'ARGON2ID' | 'BCRYPT'>;

type HashOptionMapType = {
    ARGON2D: ExcludedArgon;
    ARGON2I: ExcludedArgon;
    ARGON2ID: ExcludedArgon;
    BCRYPT: ExcludedBcrypt;
} & {
    [x in ExcludedOptionType]: never
}

export type HashOptionTypes = HashOptionMapType[keyof HashOptionMapType];

const hashContent = async <T extends HashType>(type: T, content: string, options: HashOptionMapType[T]) => {
	switch (type) {
		case HashTypesConstant.SHA_256: {
			return sha256(content);
		}
		case HashTypesConstant.MD5: {
			return md5(content);
		}
		case HashTypesConstant.BCRYPT: {
			return bcrypt({
				password: content,
				...options as ExcludedBcrypt
			});
		}
		case HashTypesConstant.ARGON2D: {
			return argon2d({
				password: content,
				...options as ExcludedArgon
			});
		}
		case HashTypesConstant.ARGON2I: {
			return argon2i({
				password: content,
				...options as ExcludedArgon
			});
		}
		case HashTypesConstant.ARGON2ID: {
			return argon2id({
				password: content,
				...options as ExcludedArgon
			});
		}
		case HashTypesConstant.SHA_224: {
			return sha224(content);
		}
		case HashTypesConstant.SHA_384: {
			return sha384(content);
		}
		case HashTypesConstant.SHA_512: {
			return sha512(content);
		}
		case HashTypesConstant.SHA3_224: {
			return sha3(content, 224);
		}
		case HashTypesConstant.SHA3_256: {
			return sha3(content, 256);
		}
		case HashTypesConstant.SHA3_384: {
			return sha3(content, 384);
		}
		case HashTypesConstant.SHA3_512: {
			return sha3(content, 512);
		}
	}
};

export const HashService = {
	hashContent
};
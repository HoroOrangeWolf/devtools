import { BaseService } from '@/service/base.service.ts';
import { BaseVariantConstant } from '@/service/constant/baseVariant.constant.ts';
import { importPKCS8, jwtVerify, SignJWT, importSPKI } from 'jose';

const JWT_SEPARATOR = '.';

export type ParsedJwtType = {
    header: {
        [x: string]: any;
    },
    payload: {
        [x: string]: any;
    },
    signature?: string;
}

const parseJwt = (jwt: string): ParsedJwtType => {
	const jwtParts = jwt.split(JWT_SEPARATOR);

	const [header, payload, signature] = jwtParts.map((val, index) => {
		switch (index) {
			case 0: {
				return BaseService.decode(val, BaseVariantConstant.BASE_64);
			}
			case 1: {
				return BaseService.decode(val, BaseVariantConstant.BASE_64);
			}
			default: {
				return val;
			}
		}
	});

	return ({
		header: JSON.parse(header),
		payload: JSON.parse(payload),
		signature: signature,
	});
};

const verifyJWT = async (jwt: string, secret: string) => {
	const decodedJwt = parseJwt(jwt);
	const alg: string = decodedJwt.header.alg;

	if (typeof alg !== 'string' || alg.length === 0) {
		throw new TypeError('JWT Header must contain an algorithm');
	}


	const signingKey = alg.startsWith('HS')
		? new TextEncoder().encode(secret)
		: await importSPKI(secret, alg);

	await jwtVerify(jwt, signingKey);
};

const signJWT = async (header: string, payload: string, secret: string) => {
	const parsedHeader = JSON.parse(header);
	const algorithm = parsedHeader.alg;

	if (typeof algorithm !== 'string' || algorithm.length === 0) {
		throw new TypeError('JWT Header must contain an algorithm');
	}

	const signingKey = algorithm.startsWith('HS')
		? new TextEncoder().encode(secret)
		: await importPKCS8(secret, algorithm);

	return new SignJWT(JSON.parse(payload))
		.setProtectedHeader(parsedHeader)
		.sign(signingKey);
};

export const JwtService = {
	signJWT,
	parseJwt,
	verifyJWT
};

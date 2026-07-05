import { BaseService } from '@/service/base.service.ts';
import { BaseVariantConstant } from '@/service/constant/baseVariant.constant.ts';
import { jwtVerify } from 'jose';

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

const verifyJWT =async (jwt: string, secret: string) => {
	const bytes: Uint8Array = new TextEncoder().encode(secret);

	await jwtVerify(jwt, bytes);
};

export const JwtService = {
	parseJwt,
	verifyJWT
};
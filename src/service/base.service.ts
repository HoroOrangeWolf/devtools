import { BaseVariantConstant, type BaseVariant } from '@/service/constant/baseVariant.constant.ts';

const bytesToBase64 = (bytes: Uint8Array): string => {
	let binary = '';

	for (const byte of bytes) {
		binary += String.fromCodePoint(byte);
	}

	return btoa(binary);
};

const base64ToBytes = (value: string): Uint8Array => {
	const binary = atob(value);
	const bytes = new Uint8Array(binary.length);

	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.codePointAt(index)!;
	}

	return bytes;
};

const addBase64Padding = (value: string): string => {
	const paddingLength = (4 - (value.length % 4)) % 4;

	return value.padEnd(value.length + paddingLength, '=');
};

const toBase64Url = (value: string): string => value
	.replaceAll('+', '-')
	.replaceAll('/', '_')
	.replaceAll('=', '');

const fromBase64Url = (value: string): string => addBase64Padding(
	value
		.replaceAll('-', '+')
		.replaceAll('_', '/')
);

const encode = (value: string, variant: BaseVariant): string => {
	const base64 = bytesToBase64(new TextEncoder().encode(value));

	if (variant === BaseVariantConstant.BASE_64_URL) {
		return toBase64Url(base64);
	}

	return base64;
};

const decode = (value: string, variant: BaseVariant): string => {
	const normalizedValue = variant === BaseVariantConstant.BASE_64_URL
		? fromBase64Url(value)
		: addBase64Padding(value);

	return new TextDecoder().decode(base64ToBytes(normalizedValue));
};

export const BaseService = {
	decode,
	encode,
};

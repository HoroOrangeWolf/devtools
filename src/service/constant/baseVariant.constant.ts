export const BaseVariantConstant = {
	BASE_64: 'BASE_64',
	BASE_64_URL: 'BASE_64_URL',
} as const;

export type BaseVariant = keyof typeof BaseVariantConstant;
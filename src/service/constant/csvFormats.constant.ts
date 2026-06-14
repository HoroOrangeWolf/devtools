export const CsvFormatsConstant = {
	CSV: 'CSV',
	JSON: 'JSON',
} as const;

export type CsvFormatsType = keyof typeof CsvFormatsConstant;
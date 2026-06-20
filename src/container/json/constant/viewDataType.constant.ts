export const ViewDataTypeConstant = {
	JSON: 'JSON',
	XML: 'XML',
	CSV: 'CSV'
} as const;

export type ViewDataType = keyof typeof ViewDataTypeConstant;
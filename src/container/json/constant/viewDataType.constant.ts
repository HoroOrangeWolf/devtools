export const ViewDataTypeConstant = {
	JSON: 'JSON',
	XML: 'XML',
} as const;

export type ViewDataType = keyof typeof ViewDataTypeConstant;
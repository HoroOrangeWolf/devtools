export const ViewDataTypeConstant = {
	JSON: 'JSON',
	XML: 'XML',
	CSV: 'CSV',
	TEXT: 'TEXT',
} as const;

export type ViewDataType = keyof typeof ViewDataTypeConstant;
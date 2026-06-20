export const ViewTypeConstant = {
	RAW: 'RAW',
	CODE: 'CODE',
	TREE: 'TREE',
} as const;

export type ViewType = keyof typeof ViewTypeConstant;
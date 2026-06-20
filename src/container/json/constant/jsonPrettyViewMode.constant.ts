export const JsonPrettyViewModeConstant = {
	COMPACT: 'COMPACT',
	BEAUTIFIED: 'BEAUTIFIED',
} as const;

export type JsonPrettyViewModeType = keyof typeof JsonPrettyViewModeConstant;
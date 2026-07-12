
export const CronTypesConstant = {
	UNIX: 'UNIX',
	QUARTZ: 'QUARTZ',
} as const;

export type CronTypes = keyof typeof CronTypesConstant;
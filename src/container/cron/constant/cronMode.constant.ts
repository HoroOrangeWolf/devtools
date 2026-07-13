
export const CronModeConstant = {
	SECOND: 'SECOND',
	MINUTE: 'MINUTE',
	HOUR: 'HOUR',
	DAY: 'DAY',
	MONTH: 'MONTH',
	WEEK_DAY: 'WEEK_DAY',
	YEAR: 'YEAR',
} as const;

export type CronModeType = keyof typeof CronModeConstant;
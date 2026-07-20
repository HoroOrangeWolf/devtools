import { CronModeType } from '@/container/cron/constant/cronMode.constant.ts';
import { CronWeekDaysConstant } from '@/container/cron/constant/cronWeekDays.constant.ts';
import { CronMonthsConstant } from '@/container/cron/constant/cronMonths.constant.ts';

export const QuartzRangesConstant: Record<CronModeType, string[]> = {
	MINUTE: Array.from({ length: 60 }, (_, index) => `${index }`),
	SECOND: Array.from({ length: 60 }, (_, index) => `${index}`),
	HOUR: Array.from({ length: 24 }, (_, index) => `${index}`),
	DAY: Array.from({ length: 31 }, (_, index) => `${index + 1}`),
	WEEK_DAY: Object.values(CronWeekDaysConstant),
	MONTH: Object.values(CronMonthsConstant),
	YEAR: Array.from({ length: 129 }, (_, index) => `${index + 1971}`), // 1970-2099
} as const;
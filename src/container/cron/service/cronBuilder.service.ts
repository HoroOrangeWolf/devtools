import { QuartzValueWithModeType } from '@/container/cron/container/quartzFragment.container.tsx';
import { QuartzRangesConstant } from '@/container/cron/constant/quartzRanges.constant.ts';
import { CronModeConstant } from '@/container/cron/constant/cronMode.constant.ts';

const getCronPartValue = (isQuartz: boolean, quartzValuePart: QuartzValueWithModeType) => {
	const suffix = quartzValuePart.step ? `/${quartzValuePart.step}` : '';

	if (quartzValuePart.every) {
		return `*${suffix}`;
	}

	let positionalRemainder = 0;

	switch (quartzValuePart.mode) {
		case CronModeConstant.MONTH: {
			positionalRemainder = 1;
			break;
		}
		case CronModeConstant.WEEK_DAY: {
			// Quartz starts it's weekdays from SUN-SAT, when Unix from Monday or SUNDAY but 0/7 position.
			if (isQuartz) {
				positionalRemainder = 1;
				break;
			}

			positionalRemainder = 0;
			break;
		}
		default: {
			positionalRemainder = 0;
		}
	}

	if (quartzValuePart.selected) {
		return quartzValuePart.selected.map((val) => {
			if (!quartzValuePart.isPositionBased) {
				return val;
			}

			const position = QuartzRangesConstant[quartzValuePart.mode].indexOf(val) + positionalRemainder;

			if (position === -1) {
				throw new Error('Failed to find position');
			}

			return `${position + 1}`;
		}).join(',');
 	}

	if (quartzValuePart.range) {
		const startValue = quartzValuePart.isPositionBased ? QuartzRangesConstant[quartzValuePart.mode].indexOf(quartzValuePart.range[0]) + positionalRemainder : quartzValuePart.range[0];
		const endValue = quartzValuePart.isPositionBased ? QuartzRangesConstant[quartzValuePart.mode].indexOf(quartzValuePart.range[1]) + positionalRemainder : quartzValuePart.range[1];

		if (startValue === -1 || endValue === - 1) {
			throw new Error('Failed to find cron part values');
		}

		return `${startValue}-${endValue}${suffix}`;
	}

	throw new Error('Invalid cron setup');
};

const buildCron = (isQuartz: boolean, quartzValues: QuartzValueWithModeType[]) => {
	return quartzValues.map((quartzValue) => getCronPartValue(quartzValue)).join(' ');
};

export const CronBuilderService = {
	buildCron
};
import { QuartzValueWithModeType } from '@/container/cron/container/quartzBuilder.container.tsx';
import { QuartzRangesConstant } from '@/container/cron/constant/quartzRanges.constant.ts';

const getCronPartValue = (quartzValuePart: QuartzValueWithModeType) => {
	const suffix = quartzValuePart.step ? `/${quartzValuePart.step}` : '';

	if (quartzValuePart.every) {
		return `*${suffix}`;
	}

	if (quartzValuePart.selected) {
		return quartzValuePart.selected.map((val) => {
			if (!quartzValuePart.isPositionBased) {
				return val;
			}

			const position = QuartzRangesConstant[quartzValuePart.mode].indexOf(val);

			if (position === -1) {
				throw new Error('Failed to find position');
			}

			return `${position + 1}`;
		}).join(',');
 	}

	if (quartzValuePart.range) {
		const startValue = quartzValuePart.isPositionBased ? QuartzRangesConstant[quartzValuePart.mode].indexOf(quartzValuePart.range[0]) + 1: quartzValuePart.range[0];
		const endValue = quartzValuePart.isPositionBased ? QuartzRangesConstant[quartzValuePart.mode].indexOf(quartzValuePart.range[1]) + 1: quartzValuePart.range[1];

		if (startValue === -1 || endValue === - 1) {
			throw new Error('Failed to find cron part values');
		}

		return `${startValue}-${endValue}${suffix}`;
	}

	throw new Error('Invalid cron setup');
};

const buildCron = (quartzValues: QuartzValueWithModeType[]) => {
	return quartzValues.map((quartzValue) => getCronPartValue(quartzValue)).join(' ');
};

export const CronBuilderService = {
	buildCron
};
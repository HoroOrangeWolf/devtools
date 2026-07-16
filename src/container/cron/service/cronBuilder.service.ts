import { QuartzValueType } from '@/container/cron/container/quartzBuilder.container.tsx';

const getCronPartValue = (quartzValuePart: QuartzValueType) => {
	const suffix = quartzValuePart.step ? `/${quartzValuePart.step}` : '';

	if (quartzValuePart.every) {
		return `*${suffix}`;
	}

	if (quartzValuePart.selected) {
		return quartzValuePart.selected.join(',');
	}

	if (quartzValuePart.range) {
		return `${quartzValuePart.range[0]}-${quartzValuePart.range[1]}${suffix}`;
	}

	throw new Error('Invalid cron setup');
};

const buildCron = (quartzValues: QuartzValueType[]) => {
	return quartzValues.map((quartzValue) => getCronPartValue(quartzValue)).join(' ');
};

export const CronBuilderService = {
	buildCron
};
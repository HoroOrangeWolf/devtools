import type { QuartzValueWithModeType } from '@/container/cron/container/quartzBuilder.container.tsx';
import { CronModeConstant, CronModeType } from '@/container/cron/constant/cronMode.constant.ts';
import { QuartzRangesConstant } from '@/container/cron/constant/quartzRanges.constant.ts';

const UNIX_MODES: CronModeType[] = [
	CronModeConstant.MINUTE,
	CronModeConstant.HOUR,
	CronModeConstant.DAY,
	CronModeConstant.MONTH,
	CronModeConstant.WEEK_DAY,
];

const QUARTZ_MODES: CronModeType[] = [
	CronModeConstant.SECOND,
	...UNIX_MODES,
	CronModeConstant.YEAR,
];

const POSITION_BASED_MODES = new Set<CronModeType>([
	CronModeConstant.MONTH,
	CronModeConstant.WEEK_DAY,
]);

type ParsedValuesType = {
	values: string[];
	isPositionBased: boolean;
};

const invalidField = (mode: CronModeType, fragment: string, reason: string): Error => (
	new Error(`Invalid ${mode} cron field "${fragment}": ${reason}`)
);

const normalizeValues = (
	rawValues: string[],
	mode: CronModeType,
	fragment: string
): ParsedValuesType => {
	const allowedValues = QuartzRangesConstant[mode];
	const canBePositionBased = POSITION_BASED_MODES.has(mode);
	const numericValues = rawValues.map((value) => /^\d+$/.test(value));

	if (canBePositionBased && numericValues.some(Boolean) && !numericValues.every(Boolean)) {
		throw invalidField(mode, fragment, 'names and positions cannot be mixed');
	}

	if (canBePositionBased && numericValues.every(Boolean)) {
		const values = rawValues.map((value) => {
			const position = Number(value);

			if (!Number.isSafeInteger(position) || position < 1 || position > allowedValues.length) {
				throw invalidField(mode, fragment, `position must be between 1 and ${allowedValues.length}`);
			}

			return allowedValues[position - 1];
		});

		return { values, isPositionBased: true };
	}

	const values = rawValues.map((value) => {
		if (!canBePositionBased && !/^\d+$/.test(value)) {
			throw invalidField(mode, fragment, 'value must be an integer');
		}

		const normalizedValue = canBePositionBased
			? allowedValues.find((allowedValue) => allowedValue.toLowerCase() === value.toLowerCase())
			: `${Number(value)}`;

		if (!normalizedValue || !allowedValues.includes(normalizedValue)) {
			throw invalidField(mode, fragment, `unsupported value "${value}"`);
		}

		return normalizedValue;
	});

	return { values, isPositionBased: false };
};

const parseStep = (fragment: string, mode: CronModeType): { value: string; step?: number } => {
	const parts = fragment.split('/');

	if (parts.length > 2 || parts[0] === '') {
		throw invalidField(mode, fragment, 'invalid step syntax');
	}

	if (parts.length === 1) {
		return { value: parts[0] };
	}

	const [value, rawStep] = parts;

	if (!/^[1-9]\d*$/.test(rawStep)) {
		throw invalidField(mode, fragment, 'step must be a positive integer');
	}

	const step = Number(rawStep);

	if (!Number.isSafeInteger(step)) {
		throw invalidField(mode, fragment, 'step is too large');
	}

	return { value, step };
};

const parseFragment = (fragment: string, mode: CronModeType): QuartzValueWithModeType => {
	const { value, step } = parseStep(fragment, mode);

	if (value === '*') {
		return {
			mode,
			every: true,
			isPositionBased: false,
			step,
		};
	}

	if (value.includes(',')) {
		if (step) {
			throw invalidField(mode, fragment, 'steps are not supported for selected values');
		}

		const rawValues = value.split(',');

		if (rawValues.includes('')) {
			throw invalidField(mode, fragment, 'selected values cannot be empty');
		}

		const parsed = normalizeValues(rawValues, mode, fragment);

		return {
			mode,
			every: false,
			isPositionBased: parsed.isPositionBased,
			selected: [...new Set(parsed.values)],
		};
	}

	if (value.includes('-')) {
		const rawRange = value.split('-');

		if (rawRange.length !== 2 || rawRange.includes('')) {
			throw invalidField(mode, fragment, 'invalid range syntax');
		}

		const parsed = normalizeValues(rawRange, mode, fragment);

		return {
			mode,
			every: false,
			isPositionBased: parsed.isPositionBased,
			range: [parsed.values[0], parsed.values[1]],
			step,
		};
	}

	if (step) {
		throw invalidField(mode, fragment, 'a step requires "*" or a range');
	}

	const parsed = normalizeValues([value], mode, fragment);

	return {
		mode,
		every: false,
		isPositionBased: parsed.isPositionBased,
		selected: parsed.values,
	};
};

const parseCron = (cron: string, isQuartz: boolean): QuartzValueWithModeType[] => {
	const modes = isQuartz ? QUARTZ_MODES : UNIX_MODES;
	const trimmedCron = cron.trim();
	const fragments = trimmedCron ? trimmedCron.split(/\s+/) : [];

	if (fragments.length !== modes.length) {
		throw new Error(
			`Invalid ${isQuartz ? 'Quartz' : 'Unix'} cron: expected ${modes.length} segments, received ${fragments.length}`
		);
	}

	return modes.map((mode, index) => parseFragment(fragments[index], mode));
};

export const CronParserService = {
	parseCron,
};

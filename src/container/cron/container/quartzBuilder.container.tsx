import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input.tsx';
import { OptionType, SelectWrapper } from '@/components/select/selectWrapper.component.tsx';
import { ComboboxOption, ComboboxWrapper } from '@/components/comboboxWrapper.component.tsx';
import { CronModeConstant, CronModeType } from '@/container/cron/constant/cronMode.constant.ts';
import { CronWeekDaysConstant } from '@/container/cron/constant/cronWeekDays.constant.ts';
import { CronMonthsConstant } from '@/container/cron/constant/cronMonths.constant.ts';

type CheckboxProps = {
	checked?: boolean;
	onChange?: (value: boolean) => void;
	isDisabled?: boolean;
	description?: string;
	id?: string;
	label?: React.ReactNode;
	children?: React.ReactNode;
}

const QuartzCreatorCheckbox = ({ checked, onChange, id, label, children, isDisabled, description }: CheckboxProps) => (
	<Field orientation="horizontal">
		<Checkbox
			id={id}
			checked={checked}
			onCheckedChange={(e)=>onChange?.(Boolean(e))}
			disabled={isDisabled}
		/>
		<FieldContent>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			{description && (
				<FieldDescription>
					{description}
				</FieldDescription>
			)}
			{children}
		</FieldContent>
	</Field>
);

export type QuartzValueType = {
	every: boolean;
	isPositionBased: boolean;
	range?: [string, string];
	selected?: string[];
	step?: number;
}

type PropsType = {
	mode: CronModeType;
	value?: QuartzValueType;
	onChange?: (value: QuartzValueType) => void;
}

const RANGES: Record<CronModeType, string[]> = {
	MINUTE: Array.from({ length: 60 }, (_, index)=>`${index + 1}`),
	SECOND: Array.from({ length: 60 },(_,index)=>`${index + 1}`),
	HOUR: Array.from({ length: 24 }, (_, index)=>`${index + 1}`),
	DAY: Array.from({ length: 31 }, (_, index)=>`${index + 1}`),
	WEEK_DAY: Object.values(CronWeekDaysConstant),
	MONTH: Object.values(CronMonthsConstant),
	YEAR: Array.from({ length: 129 },(_, index)=>`${index + 1971}`), // 1970-2099
} as const;

const CAN_USE_POSITION_BASE: CronModeType[] = [
	CronModeConstant.MONTH,
	CronModeConstant.WEEK_DAY
] as const;

export const QuartzBuilderContainer = ({ mode, value, onChange }: PropsType) => {
	const rawOptions = RANGES[mode];
	const id = `${mode}`;

	const canUsePositionBase = CAN_USE_POSITION_BASE.includes(mode);

	const [usePositionBase, setUsePositionBase] = useState<boolean>(!!value?.isPositionBased && canUsePositionBase);
	const [every, setEvery] = useState<boolean>(true);
	const [range, setRange] = useState<[string, string]>([rawOptions[0], rawOptions.at(-1) as string]);
	const [useRange, setUseRange] = useState<boolean>(false);
	const [useSelected, setUseSelected] = useState<boolean>(false);
	const [useStep, setUseStep] = useState<boolean>(false);
	const [step, setStep] = useState<number>(1);
	const [selected, setSelected] = useState<string[]>([rawOptions[0]]);

	useEffect(() => {
		if (!value) {
			return;
		}

		setUsePositionBase(!!value?.isPositionBased && canUsePositionBase);

		if (value.step && !value.selected) {
			setUseStep(!!value.step);
			setStep(value.step);
		}

		setEvery(value.every);

		if (value.every) {
			setUseRange(false);
			setUseSelected(false);
			 return;
		}

		setUseSelected(!!value.selected);
		if (value.selected) {
			setSelected(value.selected);
			setUseRange(false);
			return;
		}

		setUseRange(!!value.range);
		if (value.range) {
			setRange(value.range);
		}
	},[value]);

	const rangeOptions = useMemo((): OptionType[] => {
		return rawOptions.map((val): OptionType => ({
			label: val,
			value: val
		}));
	}, [rawOptions]);

	const selectedOptions = useMemo((): ComboboxOption[] => {
		return rawOptions.map((val): ComboboxOption => ({
			label: val,
			value: val
		}));
	},
		 [rawOptions]
	);

	const setupEvery = () => {
		setEvery(true);
		setUseSelected(false);
		setUseRange(false);
		onChange?.({
			isPositionBased: usePositionBase,
			every: true,
			step: useStep ? step : undefined
		});
	};

	const handleEveryChange = (value: boolean) => {
		if (!value) {
			return;
		}

		onChange?.({
			isPositionBased: usePositionBase,
			every: value
		});

		setEvery(value);
		setUseRange(false);
		setUseSelected(false);
	};


	const handleRangeChange = (value: boolean) => {
		if (!value && !useSelected) {
			setupEvery();
			return;
		}

		onChange?.({
			isPositionBased: usePositionBase,
			every: false,
			range,
			step: useStep && value ? step : undefined
		});

		setUseRange(value);
		setUseSelected(false);
		setEvery(false);
	};

	const handleBeginRange = (value: string) => {
		const newRange: [string, string] = [value, range[1]];

		setRange(newRange);
		onChange?.({
			isPositionBased: usePositionBase,
			every: false,
			step: useStep ? step : undefined,
			range: newRange
		});
	};

	const handleEndRange = (value: string) => {
		const newRange: [string, string] = [range[0], value];

		setRange(newRange);

		onChange?.({
			isPositionBased: usePositionBase,
			every: false,
			step: useStep ? step : undefined,
			range: newRange
		});
	};

	const handleStepChange = (value: boolean) => {
		setUseStep(value);
		setUseSelected(false);
		setEvery(!useRange);

		onChange?.({
			isPositionBased: usePositionBase,
			every: every || !useRange,
			range: useRange ? range : undefined,
			step: value ? step : undefined,
			selected: useSelected ? selected : undefined
		});
	};

	const handleEnableSelected = (value: boolean) => {
		setUseSelected(value);

		if (!value) {
			setEvery(true);
			onChange?.({
				isPositionBased: usePositionBase,
				every: true,
			});
			return;
		}

		setEvery(false);
		setUseRange(false);
		setUseStep(false);
		onChange?.({
			isPositionBased: usePositionBase,
			every: false,
			selected
		});
	};

	const handleChangeSelected = (value: ComboboxOption[]) => {
	  const selected = 	[...new Set<string>(value.map(({ value })=>value))];
	  onChange?.({
		  isPositionBased: usePositionBase,
		  every: false,
		  selected
	  });
	  setSelected(selected);
	};

	return (
		<div className="flex flex-col gap-2">
			{canUsePositionBase && (
				<QuartzCreatorCheckbox
					label="Position Base"
					description={'Some Cron parsers might not support names like (e.g. day of week Mon,Wed,Thu...), instead they might require it\'s position.'}
					id={id && `${id}-position-base`}
					onChange={(e) => {
						setUsePositionBase(e);
					}}
					checked={usePositionBase}
				/>
			)}
			<QuartzCreatorCheckbox
				label="Every Second"
				id={id && `${id}-every`}
				onChange={handleEveryChange}
				checked={every}
			/>
			<QuartzCreatorCheckbox
				label="Range Between"
				id={id && `${id}-range`}
				onChange={handleRangeChange}
				checked={useRange}
			>
				<div className="flex flex-row items-center gap-2">
					Range from
					<SelectWrapper
						isDisabled={!useRange}
						onChange={handleBeginRange}
						value={range[0]}
						fullWidth={false}
						options={rangeOptions}
					/>
					to
					<SelectWrapper
						isDisabled={!useRange}
						value={range[1]}
						fullWidth={false}
						onChange={handleEndRange}
						options={rangeOptions}
					/>
				</div>
			</QuartzCreatorCheckbox>
			<QuartzCreatorCheckbox
				id={id && `${id}-step`}
				label="Step"
				checked={useStep}
				onChange={handleStepChange}
			>
				<Input
					min={1}
					className="w-1/5"
					disabled={!useStep}
					value={step}
					onChange={(e) => setStep(Number(e.target.value))}
				/>
			</QuartzCreatorCheckbox>
			<QuartzCreatorCheckbox
				id={id && `${id}-step-selected`}
				label="Selected"
				onChange={handleEnableSelected}
				checked={useSelected}
			>
				<ComboboxWrapper
					placeholder="Select"
					options={selectedOptions}
					multiple={true}
					isDisabled={!useSelected}
					onChange={handleChangeSelected}
					value={selected}
				/>
			</QuartzCreatorCheckbox>
		</div>
	);
};

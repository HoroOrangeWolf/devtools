import { Field, FieldContent, FieldLabel } from '@/components/ui/field.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input.tsx';
import { OptionType, SelectWrapper } from '@/components/select/selectWrapper.component.tsx';
import { ComboboxOption, ComboboxWrapper } from '@/components/comboboxWrapper.component.tsx';
import { CronModeType } from '@/container/cron/constant/cronMode.constant.ts';
import { CronWeekDaysConstant } from '@/container/cron/constant/cronWeekDays.constant.ts';
import { CronMonthsConstant } from '@/container/cron/constant/cronMonths.constant.ts';

type CheckboxProps = {
	checked?: boolean;
	onChange?: (value: boolean) => void;
	isDisabled?: boolean;
	id?: string;
	label?: React.ReactNode;
	children?: React.ReactNode;
}

const QuartzCreatorCheckbox = ({ checked, onChange, id, label, children, isDisabled }: CheckboxProps) => (
	<Field orientation="horizontal">
		<Checkbox
			id={id}
			checked={checked}
			onCheckedChange={(e)=>onChange?.(Boolean(e))}
			disabled={isDisabled}
		/>
		<FieldContent>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			{children}
		</FieldContent>
	</Field>
);

type QuartzChangeModelType<T = number> = {
	every: boolean;
	range?: [T, T];
	selected?: T[];
	step?: number;
}

type PropsType = {
	mode: CronModeType;
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

export const QuartzCronContainer = ({ mode }: PropsType) => {
	const rawOptions = RANGES[mode];
	const id = `${mode}`;

	const [every, setEvery] = useState<boolean>(true);
	const [range, setRange] = useState<[string, string]>([rawOptions[0], rawOptions.at(-1) as string]);
	const [useRange, setUseRange] = useState<boolean>(false);
	const [useSelected, setUseSelected] = useState<boolean>(false);
	const [useStep, setUseStep] = useState<boolean>(false);
	const [step, setStep] = useState<number>(1);
	const [selected, setSelected] = useState<string[]>([rawOptions[0]]);

	const rangeOptions = useMemo((): OptionType<string>[] => {
		return rawOptions.map((val): OptionType<string> => ({
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
	const handleEveryChange = (value: boolean) => {
		setEvery(value);
		setUseRange(false);
		setUseSelected(false);
	};

	const handleRangeChange = (value: boolean) => {
		setUseRange(value);
		setUseSelected(false);
		setEvery(false);
	};

	const handleBeginRange = (value: string) => {
		setRange([value, range[1]]);
	};

	const handleEndRange = (value: string) => {
		setRange([range[0], value]);
	};

	const handleStepChange = (value: boolean) => {
		setUseStep(value);
		setUseSelected(false);

		if (useRange) {
			return;
		}

		setEvery(true);
	};

	const handleEnableSelected = (value: boolean) => {
		setUseSelected(value);

		if (!value) {
			return;
		}

		setEvery(false);
		setUseRange(false);
		setUseStep(false);
	};

	const handleChangeSelected = (value: ComboboxOption[]) => {
	  const selected = 	[...new Set<string>(value.map(({ value })=>value))];
	  setSelected(selected);
	};

	return (
		<div className="flex flex-col gap-2">
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

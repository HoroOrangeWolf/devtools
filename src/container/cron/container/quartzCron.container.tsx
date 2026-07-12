import { Field, FieldContent, FieldLabel } from '@/components/ui/field.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input.tsx';
import { OptionType, SelectWrapper } from '@/components/select/selectWrapper.component.tsx';
import { ComboboxOption, ComboboxWrapper } from '@/components/comboboxWrapper.component.tsx';

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
	id?: string;

}

export const QuartzCronContainer = ({ id }: PropsType) => {
	const [every, setEvery] = useState<boolean>(true);
	const [range, setRange] = useState<[number, number]>([1,31]);
	const [useRange, setUseRange] = useState<boolean>(false);
	const [useSelected, setUseSelected] = useState<boolean>(false);
	const [useStep, setUseStep] = useState<boolean>(false);
	const [step, setStep] = useState<number>(1);
	const [selected, setSelected] = useState<string[]>(['1', '3']);

	const rangeOptions = useMemo((): OptionType<number>[] => {
		return Array.from({ length: 31 }, (_, i): OptionType<number> => ({
			label: `${i + 1}`,
			value: i + 1
		}));
	}, []);

	const selectedOptions = useMemo((): ComboboxOption[] => (
	 Array.from({ length: 31 }, (_, i): ComboboxOption => ({
			label: `${i + 1}`,
			value: `${i + 1}`
		}))),
		 []
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

	const handleBeginRange = (value: number) => {
		setRange([value, range[1]]);
	};

	const handleEndRange = (value: number) => {
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

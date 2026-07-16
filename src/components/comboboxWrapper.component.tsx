import {
	Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList, ComboboxValue
} from '@/components/ui/combobox.tsx';

export type ComboboxOption = {
    label: string;
    value: string;
}

type PropsType = {
	options?: ComboboxOption[];
	id?: string;
	isDisabled?: boolean;
	ariaLabel?: string;
	placeholder?: string;
} & ({
	multiple: true;
	onChange?: (value: ComboboxOption[]) => void;
	value?: string[];
} | {
	multiple?: false;
	onChange?: (value: ComboboxOption) => void;
	value?: string;
})

export const ComboboxWrapper = ({ options, value,onChange, id, ariaLabel, multiple, isDisabled, placeholder }: PropsType) => {
	const getValue = () => {
		if (multiple && Array.isArray(value)) {
			return value.map((value) => ({ label: value, value }));
		}

		if (!multiple && !Array.isArray(value) && value) {
			return ({ label: value, value });
		}

		return;
	};

	const renderProperSelection = () => {
		if (multiple) {
			const val = value ?? [];

			return (
				<ComboboxChips>
					<ComboboxValue>
						{val.map((item) => (
							<ComboboxChip key={item}>{item}</ComboboxChip>
						))}
					</ComboboxValue>
					<ComboboxChipsInput disabled={isDisabled} placeholder={placeholder} />
				</ComboboxChips>
			);
		}

		return <ComboboxInput disabled={isDisabled} placeholder={placeholder} aria-label={ariaLabel} />;
	};

	return (
		<Combobox
			items={options}
			id={id}
			multiple={multiple}
			disabled={isDisabled}
			value={getValue()}
			itemToStringValue={(option: ComboboxOption) => option.label}
			onValueChange={(val: ComboboxOption | ComboboxOption[] | null) => {
				if (!val) {
					return;
				}

				if (multiple && Array.isArray(val)) {
					onChange?.(val);
					return;
				}

				if (!multiple && !Array.isArray(val)) {
					onChange?.(val);
					return;
				}
			}}
		>
			{renderProperSelection()}
			<ComboboxContent>
				<ComboboxEmpty>No items found.</ComboboxEmpty>
				<ComboboxList>
					{(option) => (
						<ComboboxItem key={option.value} value={option}>
							{option.label}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
};
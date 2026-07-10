import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList
} from '@/components/ui/combobox.tsx';

export type ComboboxOption = {
    label: string;
    value: string;
}

type PropsType = {
    options?: ComboboxOption[];
    value?: string;
    id?: string;
    ariaLabel?: string;
    onChange?: (value: ComboboxOption) => void;
}

export const ComboboxWrapper = ({ options, value,onChange, id, ariaLabel }: PropsType) => {
	return (
		<Combobox
			items={options}
			id={id}
			value={value ? ({ label: value, value }) : undefined}
			itemToStringValue={(option: ComboboxOption) => option.label}
			onValueChange={(val) => val && onChange?.(val)}
		>
			<ComboboxInput placeholder="Select a framework" aria-label={ariaLabel} />
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
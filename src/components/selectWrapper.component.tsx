import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select.tsx';
import { FieldDescription } from '@/components/ui/field.tsx';
import React from 'react';

export type OptionType<T = string> = {
    value: T;
    label: React.ReactNode;
	tooltip?: string;
}

type PropsType<T = string> = {
	id?: string;
	ariaLabel?: string;
    placeholder?: string;
    defaultValue?: string | boolean;
	onChange?: (value: T) => void;
    options?: OptionType<T>[];
}

export const SelectWrapper = <T,>({ id, ariaLabel, options = [], defaultValue, placeholder, onChange }: PropsType<T>) => {
	const renderOptions = () => {
		return options.map(({ label, value, tooltip }, index) => (
			<SelectItem value={value as string} key={`option-${index}-${label}-${value}`}>
				{label}
				{tooltip && (
					<FieldDescription>
						{tooltip}
					</FieldDescription>
				)}
			</SelectItem>
		));
	};

	return (
		<Select
			onValueChange={onChange as any}
			defaultValue={defaultValue as any}
		>
			<SelectTrigger
				id={id}
				aria-label={ariaLabel}
				className="w-full"
			>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{renderOptions()}
			</SelectContent>
		</Select>
	);
};

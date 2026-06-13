import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select.tsx';

export type OptionType<T = string> = {
    value: T;
    label: string;
}

type PropsType<T = string> = {
    placeholder?: string;
    defaultValue?: string;
	onChange?: (value: T) => void;
    options?: OptionType<T>[];
}

export const SelectWrapper = <T = string,>({ options = [], defaultValue, placeholder, onChange }: PropsType<T>) => {
	const renderOptions = () => {
		return options.map(({ label, value }) => (
			<SelectItem value={value as string} key={value as string}>
				{label}
			</SelectItem>
		));
	};

	return (
		<Select
			onValueChange={onChange as any}
			defaultValue={defaultValue}
		>
			<SelectTrigger className="w-full">
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{renderOptions()}
			</SelectContent>
		</Select>
	);
};
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu.tsx';

export type DropdownOptionType = {
    label: string;
    onClick?: () => void;
}

type PropsType = {
    options?: DropdownOptionType[];
    asChild?: boolean;
    children?: React.ReactNode;
}

export const DropdownWrapperComponent = ({ options = [], children, asChild = true }: PropsType) => {
	const renderOptions = () => {
		return options.map((option)=>(
			<DropdownMenuItem
				key={option.label}
				onClick={option.onClick}
			>
				{option.label}
			</DropdownMenuItem>
		));
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				asChild={asChild}
			>
				{children}
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{renderOptions()}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
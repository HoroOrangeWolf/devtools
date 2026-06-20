import  { useState } from 'react';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { Button } from '@/components/ui/button.tsx';
import { OptionType } from '@/components/select/selectWrapper.component.tsx';
import { TooltipWrapper } from '@/components/tooltipWrapper.component.tsx';

type PropsType<T> = {
    options?: OptionType<T>[];
	value?: T;
	defaultValue?: T;
	onClick?: (val: T) => void;
}

export const ButtonSelectWrapper = <T = string,>({ options = [], onClick, value, defaultValue }: PropsType<T>) => {
	const [currentValue, setCurrentValue] = useState<T>(defaultValue as T);

	if (options.length === 0) {
		return null;
	}

	const getButton = (option: OptionType<T>, index: number) => {
		const button = (
			<Button
				key={`${option.value ?? index}`}
				aria-disabled={option.isDisabled || undefined}
				className="aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
				variant={(value ?? currentValue) === option.value ? 'default' : 'outline'}
				onClick={()=> {
					if (option.isDisabled) {
						return;
					}

					setCurrentValue(option.value);
					onClick?.(option.value);
				}}
			>
				{option.label}
			</Button>
		);

		return option.tooltip ? (
			<TooltipWrapper key={`${option.value ?? index}`} tooltip={option.tooltip}>
				{button}
			</TooltipWrapper>
		) : button;
	};

	return (
		<ButtonGroup orientation="horizontal">
			{options.map((option, index) => getButton(option, index))}
		</ButtonGroup>
	);
};

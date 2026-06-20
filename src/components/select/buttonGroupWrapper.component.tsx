import React, { useState } from 'react';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { Button } from '@/components/ui/button.tsx';
import { OptionType } from '@/components/selectWrapper.component.tsx';

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

	return (
		<ButtonGroup orientation="horizontal">
			{options.map((option, index) => (
				<Button
					key={`${option.value ?? index}`}
					variant={(value ?? currentValue) === option.value ? 'default' : 'outline'}
					onClick={()=> {
						setCurrentValue(option.value);
						onClick?.(option.value);
					}}
				>
					{option.label}
				</Button>
			))}
		</ButtonGroup>
	);
};
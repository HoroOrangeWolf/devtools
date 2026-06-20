import React, { useState } from 'react';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { Button } from '@/components/ui/button.tsx';

export type ButtonSelectOption<T = string> = {
    label: React.ReactNode;
    value: T;
}

type PropsType<T> = {
    options?: ButtonSelectOption<T>[];
	value?: T;
	onClick?: (val: T) => void;
}

export const ButtonSelectWrapper = <T = string,>({ options = [], onClick, value }: PropsType<T>) => {
	const [currentValue, setCurrentValue] = useState<T>();

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
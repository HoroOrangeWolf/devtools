import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

type PropsType = {
	localStorageKey: string;
	idsToClear: string[];
}

export const SidebarHiddenButton = ({ localStorageKey, idsToClear }: PropsType) => {
	const [isHidden, setIsHidden] = useState<boolean>(true);

	const handleChangeValue = useCallback((val: boolean) => {
		setIsHidden(val);
		localStorage.setItem(localStorageKey, `${val}`);

		for (const id of idsToClear) {
			if (val) {
				document.querySelector(`#${id}`)?.classList?.add('hidden');
			} else {
				document.querySelector(`#${id}`)?.classList?.remove('hidden');
			}
		}
	},[idsToClear, localStorageKey]);

	useEffect(() => {
		const savedVal = localStorage.getItem(localStorageKey) === 'true';

		handleChangeValue(savedVal);
	}, []);

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		handleChangeValue(!isHidden);
	};

	return (
		<Button
			variant="ghost"
			className={cn('h-full rounded-none')}
			onClick={handleClick}
		>
			{isHidden ? <ChevronsRight className={cn('size-8')} /> :<ChevronsLeft className={cn('size-8')} /> }
		</Button>
	);
};
import { cn } from '@/lib/utils.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { useState } from 'react';
import { OptionType, SelectWrapper } from '@/components/selectWrapper.component.tsx';
import { BaseVariant, BaseVariantConstant } from '@/service/constant/baseVariant.constant.ts';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group.tsx';

const BASE_VARIANTS: OptionType<BaseVariant>[] = [
	{
		label: 'Base64',
		value: BaseVariantConstant.BASE_64
	},
	{
		label: 'Url-safe Base64',
		value: BaseVariantConstant.BASE_64
	}
];

export const Base64Container = () => {
	const [isEncodeMode, setIsEncodeMode] = useState<boolean>(true);
	const [baseVariant, setBaseVariant] = useState<BaseVariant>(BaseVariantConstant.BASE_64);

	const switchEncodeMode = () => {
		setIsEncodeMode(true);
	};

	const switchDecodeMode = () => {
		setIsEncodeMode(false);
	};

	return (
		<div className={cn('flex flex-col gap-2')}>
			<SelectWrapper
				options={BASE_VARIANTS}
				defaultValue={baseVariant}
				onChange={setBaseVariant}
			/>
			<div className={cn('flex flex-col gap-2')}>
				<Textarea
					className={cn('h-64')}
					placeholder=""
				/>
				<div className={cn('flex flex-row')}>
					<ButtonGroup>
						<Button variant={isEncodeMode ? 'default' : 'outline'} onClick={switchEncodeMode}>Encode</Button>
						<Button variant={isEncodeMode ? 'outline' : 'default'} onClick={switchDecodeMode}>Decode</Button>
					</ButtonGroup>
				</div>
				<Textarea
					placeholder=""
					readOnly={true}
					className={cn('h-64')}
				/>
			</div>
		</div>
	);
};
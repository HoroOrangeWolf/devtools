import { cn } from '@/lib/utils.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { useEffect, useState } from 'react';
import { OptionType, SelectWrapper } from '@/components/selectWrapper.component.tsx';
import { BaseVariant, BaseVariantConstant } from '@/service/constant/baseVariant.constant.ts';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { Field, FieldLabel } from '@/components/ui/field.tsx';
import { Label } from 'radix-ui';
import { BaseService } from '@/service/base.service.ts';

const BASE_VARIANTS: OptionType<BaseVariant>[] = [
	{
		label: 'Base64',
		value: BaseVariantConstant.BASE_64
	},
	{
		label: 'Url-safe Base64',
		value: BaseVariantConstant.BASE_64_URL
	}
];

export const Base64Container = () => {
	const [sourceText, setSourceText] = useState<string>('');
	const [targetText, setTargetText] = useState<string>('');
	const [isEncodeMode, setIsEncodeMode] = useState<boolean>(true);
	const [baseVariant, setBaseVariant] = useState<BaseVariant>(BaseVariantConstant.BASE_64);
	const [isEncodingError, setIsEncodingError] = useState<boolean>(false);

	useEffect(() => {
		const fn = async () => {
			try {
				const method = isEncodeMode ? BaseService.encode : BaseService.decode;

				const result = method(sourceText, baseVariant);

				setTargetText(result);
				setIsEncodingError(false);
			} catch (error) {
				console.error('Failed to',error);
				setIsEncodingError(true);
			}
		};

		fn()
			.catch(console.error);
	}, [isEncodeMode, baseVariant, sourceText]);

	const switchEncodeMode = () => {
		setIsEncodeMode(true);
	};

	const switchDecodeMode = () => {
		setIsEncodeMode(false);
	};

	return (
		<div className={cn('flex flex-col gap-2')}>
			<div className={cn('w-48')}>
				<Field>
					<FieldLabel htmlFor="base_variant">
						Base64 Variant
					</FieldLabel>
					<SelectWrapper
						id="base_variant"
						options={BASE_VARIANTS}
						defaultValue={baseVariant}
						onChange={setBaseVariant}
					/>
				</Field>
			</div>
			<div className={cn('flex flex-col gap-2')}>
				<Textarea
					className={cn('h-64')}
					onChange={(e)=>setSourceText(e.target.value)}
					placeholder={`Type here value to ${isEncodeMode ? 'encode' : 'decode'}...`}
				/>
				<div className={cn('flex flex-row')}>
					<ButtonGroup>
						<Button variant={isEncodeMode ? 'default' : 'outline'} onClick={switchEncodeMode}>Encode</Button>
						<Button variant={isEncodeMode ? 'outline' : 'default'} onClick={switchDecodeMode}>Decode</Button>
					</ButtonGroup>
				</div>
				<Textarea
					placeholder={isEncodeMode ? 'Encoding results...' : 'Decoding results...'}
					value={targetText}
					readOnly={true}
					className={cn('h-64')}
				/>
			</div>
		</div>
	);
};
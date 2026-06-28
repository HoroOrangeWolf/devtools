import { cn } from '@/lib/utils.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { useEffect, useState } from 'react';
import { OptionType, SelectWrapper } from '@/components/select/selectWrapper.component.tsx';
import { BaseVariant, BaseVariantConstant } from '@/service/constant/baseVariant.constant.ts';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { Field, FieldLabel } from '@/components/ui/field.tsx';
import { BaseService } from '@/service/base.service.ts';
import { BannerComponent } from '@/components/banner.component.tsx';
import { FileService } from '@/service/file.service.ts';
import { ClipboardCopy, DownloadIcon } from 'lucide-react';
import { ToastUtils } from '@/utils/toast.utils.ts';

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

				setIsEncodingError(false);
				setTargetText(result);
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

	const download = () => {
		FileService.downloadFile(`${isEncodeMode ? 'encode' : 'decode'}_result.txt`, targetText, 'text/plain');
		ToastUtils.info('Download complete');
	};

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(targetText);
			ToastUtils.info('Copied to clipboard');
		} catch (error) {
			console.error('Failed to copy to clipboard', error);
			ToastUtils.error('Could not copy to clipboard');
		}
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
						ariaLabel="Base64 variant"
						options={BASE_VARIANTS}
						defaultValue={baseVariant}
						onChange={setBaseVariant}
					/>
				</Field>
			</div>
			<div className={cn('flex flex-col gap-2')}>
				<Textarea
					aria-label="Source content"
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
					aria-label="Converted content"
					placeholder={isEncodeMode ? 'Encoding results...' : 'Decoding results...'}
					value={targetText}
					readOnly={true}
					className={cn('h-64')}
				/>
			</div>
			{isEncodingError && (
				<BannerComponent
					title="Error"
				>
					Failed to {isEncodeMode ? 'encode' : 'decode'} value...
				</BannerComponent>
			)}
			{targetText && (
				<div className={cn('flex flex-row gap-2 justify-end')}>
					<Button
						variant="outline"
						onClick={copyToClipboard}
					>
						<ClipboardCopy />
						Copy to clipboard
					</Button>
					<Button
						onClick={download}
					>
						<DownloadIcon />
						Download Result
					</Button>
				</div>
			)}
		</div>
	);
};

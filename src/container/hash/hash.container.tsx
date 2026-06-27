import { cn } from '@/lib/utils.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Button } from '@/components/ui/button.tsx';
import { DownloadIcon, UploadIcon } from 'lucide-react';
import { OptionType, SelectWrapper } from '@/components/select/selectWrapper.component.tsx';
import { FileDropzone } from '@/components/csvFileDropzone.component.tsx';
import { useEffect, useState } from 'react';
import { FileService } from '@/service/file.service.ts';
import { HashType, HashTypesConstant } from '@/container/hash/constant/hashTypes.constant.ts';
import { Field, FieldLabel } from '@/components/ui/field.tsx';
import { useDebounceValue } from '@/hooks/useDebounce.hook.ts';
import { HashOptionTypes } from '@/container/hash/service/hash.service.ts';
import { HashOptionsContainer } from '@/container/hash/hashOptions.container.tsx';

const options: OptionType<HashType>[] = Object.keys(HashTypesConstant)
	.map((value): OptionType<HashType> => ({
		label: value.replace('_', '-'),
		value: value as HashType
	}));

export const HashContainer  = () => {
	const [value, setValue] = useState<string>('');
	const debouncedValue = useDebounceValue(value, 250);
	const [hashValue, setHashValue] = useState<string>('');
	const [hashType, setHashType] = useState<HashType>(HashTypesConstant.SHA_256);
	const [hashOptions, setHashOptions] = useState<HashOptionTypes>();

	const handleFileDrop = async (file: File) => {
		const result  = await file.text();

		setValue(result);
	};

	useEffect(() => {
		const fn = async () => {
			try {
				setHashValue('');
			} catch (error) {
				console.error('Failed to load hash', error);
			}
		};

		fn()
			.catch(console.error);
	}, [debouncedValue]);

	const onInitUploadFile = async () => {
		try {
			const result = await FileService.getFileContent(undefined, false);
			setValue(result);
		} catch (error) {
			console.error('Failed to get file content', error);
		}
	};

	const onDownloadFile = () => {
		FileService.downloadFile('result_hash.txt', hashValue, 'text/plain');
	};

	return (
		<div className={cn('grid grid-cols-[1fr_minmax(0,1fr)_1fr] gap-2')}>
			<FileDropzone onDropFile={handleFileDrop}>
				<Textarea
					className={cn('h-64')}
					value={value}
					onChange={(e) => setHashValue(e.target.value)}
				/>
			</FileDropzone>
			<div className={cn('flex-col gap-2')}>
				<Button
					onClick={onInitUploadFile}
				>
					<UploadIcon /> Upload
				</Button>
				<Field>
					<FieldLabel>
						Hash Type
					</FieldLabel>
					<SelectWrapper
						onChange={setHashType}
						options={options}
						defaultValue={hashType}
					/>
				</Field>
				<Button
					onClick={onDownloadFile}
				>
					<DownloadIcon /> Download
				</Button>
				<HashOptionsContainer onChange={()=>{}} />
			</div>
			<Textarea
				className={cn('h-64')}
				value={hashValue}
			/>
		</div>
	);
};
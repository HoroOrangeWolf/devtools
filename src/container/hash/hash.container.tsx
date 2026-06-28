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
import { HashOptionTypes, HashService } from '@/container/hash/service/hash.service.ts';
import { HashOptionsContainer } from '@/container/hash/hashOptions.container.tsx';
import { HashModeType, HashModeTypeConstant } from '@/container/hash/constant/hashModeType.constant.ts';
import { SaltUtils } from '@/container/hash/service/salt.utils.ts';
import { ErrorBanner } from '@/components/error.component.tsx';

const options: OptionType<HashType>[] = Object.keys(HashTypesConstant)
	.map((value): OptionType<HashType> => ({
		label: value.replace('_', '-'),
		value: value as HashType
	}));

const bcryptDef: HashOptionTypes = {
	salt: SaltUtils.generateSalt(8),
	costFactor: 4
};

export const HashContainer  = () => {
	const [value, setValue] = useState<string>('Test hash value');
	const [hashValue, setHashValue] = useState<string>('');
	const [hashType, setHashType] = useState<HashType>(HashTypesConstant.SHA_256);
	const [hashOptions, setHashOptions] = useState<HashOptionTypes>(bcryptDef);
	const [errorMessage, setErrorMessage] = useState<string>();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleFileDrop = async (file: File) => {
		const result  = await file.text();

		setValue(result);
	};

	const getOptionMode = () => {
		const argon: HashType[] = [
			HashTypesConstant.ARGON2D,
			HashTypesConstant.ARGON2I,
			HashTypesConstant.ARGON2ID
		];

		if (argon.includes(hashType)){
			return HashModeTypeConstant.ARGON;
		}

		return HashTypesConstant.BCRYPT === hashType ? HashModeTypeConstant.BCRYPT : undefined;
	};

	const optionMode = getOptionMode();

	const generateHash = async () => {
		try {
			setIsLoading(true);
			setErrorMessage(undefined);

			const hashResult = await HashService.hashContent(hashType, value, hashOptions);

			setHashValue(hashResult);
		} catch (error) {
			setErrorMessage((error as Error).message);
			console.error('Failed to load hash', error);
		} finally {
			setIsLoading(false);
		}
	};

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
		<div className={cn('flex flex-col gap-2')}>
			<div className={cn('flex flex-col lg:grid lg:grid-cols-3 gap-2')}>
				<FileDropzone onDropFile={handleFileDrop}>
					<Textarea
						className={cn('min-h-64')}
						value={value}
						onChange={(e) => setValue(e.target.value)}
					/>
				</FileDropzone>
				<div className={cn('flex flex-col gap-2')}>
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
					{optionMode && (
						<HashOptionsContainer
							onChange={setHashOptions}
							isArgonSettings={optionMode === HashModeTypeConstant.ARGON}
						/>
					)}
					<Button
						onClick={onDownloadFile}
					>
						<DownloadIcon /> Download
					</Button>
					<Button
						onClick={generateHash}
						disabled={isLoading}
					>
						{isLoading ? 'Generating...' : 'Generate'}
					</Button>
				</div>
				<Textarea
					className={cn('min-h-64')}
					value={hashValue}
				/>
			</div>
			<ErrorBanner
				className={cn(errorMessage ? 'opacity-100' : 'opacity-0')}
				title="Error"
			>
				{errorMessage}
			</ErrorBanner>
		</div>
	);
};
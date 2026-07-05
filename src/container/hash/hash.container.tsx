import { cn } from '@/lib/utils.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Button } from '@/components/ui/button.tsx';
import { DownloadIcon, Eraser, UploadIcon } from 'lucide-react';
import { OptionType, SelectWrapper } from '@/components/select/selectWrapper.component.tsx';
import { FileDropzone } from '@/components/csvFileDropzone.component.tsx';
import { useState } from 'react';
import { FileService } from '@/service/file.service.ts';
import { HashType, HashTypesConstant } from '@/container/hash/constant/hashTypes.constant.ts';
import { Field, FieldLabel } from '@/components/ui/field.tsx';
import { HashOptionTypes, HashService } from '@/container/hash/service/hash.service.ts';
import { HashOptionsContainer } from '@/container/hash/hashOptions.container.tsx';
import { HashModeTypeConstant } from '@/container/hash/constant/hashModeType.constant.ts';
import { SaltUtils } from '@/container/hash/service/salt.utils.ts';
import { BannerComponent } from '@/components/banner.component.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';

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
	const [value, setValue] = useState<string>('');
	const [hashValue, setHashValue] = useState<string>('');
	const [hashType, setHashType] = useState<HashType>(HashTypesConstant.SHA_256);
	const [hashOptions, setHashOptions] = useState<HashOptionTypes>(bcryptDef);
	const [errorMessage, setErrorMessage] = useState<string>();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isFile, setIsFile] = useState<boolean>(false);
	const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);

	const handleFileDrop = async (file: File) => {
		try {
			setIsLoadingFile(true);
			const result  = await file.text();

			setIsFile(true);
			setValue(result);
		} catch (error) {
			console.error('Failed to upload file', error);
		} finally {
			setIsLoadingFile(false);
		}
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
			setIsLoadingFile(true);
			const result = await FileService.getFileContent(undefined, false);
			setIsFile(true);
			setValue(result);
		} catch (error) {
			console.error('Failed to get file content', error);
		} finally {
			setIsLoadingFile(false);
		}
	};

	const onDownloadFile = () => {
		FileService.downloadFile('result_hash.txt', hashValue, 'text/plain');
	};

	const getEditor = () => {
		if (isLoadingFile) {
			return (
				<div className={cn('h-full flex align-center justify-center')}>
					<Spinner className={cn('size-8 mt-auto mb-auto')} />
				</div>
			);
		}

		if (isFile) {
			return (
				<BannerComponent
					title="File"
					variant="default"
				>
					<div className={cn('flex flex-col')}>
						<p>File has been loaded, click &quot;Generate&quot; to calculate hash.</p>
						<Button
							onClick={() => {
								setValue('');
								setIsFile(false);
							}}
							className={cn('ml-auto')}
						>
							Clean
							<Eraser />
						</Button>
					</div>
				</BannerComponent>
			);
		}

		return (
			<Textarea
				aria-label="Content to hash"
				placeholder="Type or drop file here..."
				className={cn('h-full')}
				value={value}
				onChange={(e) => setValue(e.target.value)}
			/>
		);
	};

	return (
		<div className={cn('flex flex-col gap-2')}>
			<div className={cn('flex flex-col lg:grid lg:grid-cols-3 gap-2')}>
				<FileDropzone
					className={cn('min-h-64')}
					isDisabled={isLoadingFile}
					onDropFile={handleFileDrop}
				>
					{getEditor()}
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
							ariaLabel="Hash type"
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
						disabled={isLoading || isLoadingFile}
					>
						{isLoading ? 'Generating...' : 'Generate'}
					</Button>
				</div>
				<Textarea
					aria-label="Generated hash"
					placeholder="Result..."
					className={cn('min-h-64')}
					value={hashValue}
					readOnly={true}
				/>
			</div>
			<BannerComponent
				className={cn(errorMessage ? 'opacity-100' : 'opacity-0')}
				title="Error"
			>
				{errorMessage}
			</BannerComponent>
		</div>
	);
};

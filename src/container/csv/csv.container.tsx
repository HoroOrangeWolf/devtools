import { cn } from '@/lib/utils.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Button } from '@/components/ui/button.tsx';
import { OptionType, SelectWrapper } from '@/components/selectWrapper.component.tsx';
import { useEffect, useState } from 'react';
import { HardDriveUploadIcon, DownloadIcon } from 'lucide-react';
import { CsvService } from '@/service/csv.service.ts';
import { CsvOptionsContainer } from '@/container/csv/csvOptions.container.tsx';
import { CsvFormatsConstant, CsvFormatsType } from '@/service/constant/csvFormats.constant.ts';
import { ErrorList, ErrorModel } from '@/components/errorList.component.tsx';
import { ContentFormat, FileExtension, FileService } from '@/service/file.service.ts';
import { UnparseConfig } from 'papaparse';
import { FileDropzone } from '@/components/csvFileDropzone.component.tsx';

const formatOptions: OptionType<CsvFormatsType>[] = [
	{
		label: 'JSON',
		value: 'JSON',
	},
	{
		label: 'CSV',
		value: 'CSV',
	}
];

const acceptableFiles: (ContentFormat | FileExtension)[] = [
	'.json',
	'.csv',
	'application/json',
	'text/csv'
];

export const CsvContainer = () => {
	const [fileFormat, setFileFormat] = useState<CsvFormatsType>(CsvFormatsConstant.CSV);
	const [config, setConfig] = useState<UnparseConfig>({});
	const [targetContent, setTargetContent] = useState<string>('');
	const [csvContent, setCsvContent] = useState('');
	const [errors, setErrors] = useState<ErrorModel[]>([]);

	useEffect(()=>{
		if (!csvContent) {
			return;
		}

		const fn = async () => {
			try {
				const result = await	CsvService.parseCSV(fileFormat, csvContent, config);

				setTargetContent(result.content);

				const mappedErrors: ErrorModel[] = result.errors?.map((error)=>({
					error: `${error.row && `Row: ${error.row}`} ${error.message}`
				}));

				setErrors(mappedErrors);
			} catch (error) {
				const err = error as Error;
				console.error('Failed to parse csv', error);
				setErrors([
					{
						error: `Failed to parse config: "${err.message}"`
					}
				]);
			}
		};

		fn()
			.catch(console.error);
	},[config, fileFormat, csvContent]);

	const handleUpload = async () => {
		const uploadedContent = await FileService.getFileContent(acceptableFiles);

		if (!uploadedContent) {
			return;
		}

		setCsvContent(uploadedContent);
	};

	const handleFileDrop = async (file: File) => {
		const uploadedContent = await FileService.readFileContent(file);

		if (!uploadedContent) {
			return;
		}

		setCsvContent(uploadedContent);
	};

	const download = () => {
		FileService.downloadFile(
			`export${fileFormat === CsvFormatsConstant.CSV ? '.csv' : '.json'}`,
			targetContent,
			fileFormat === CsvFormatsConstant.CSV ? 'text/csv' : 'application/json'
		);
	};

	return (
		<div className={cn('flex flex-col gap-2')}>
			<div className={cn('grid grid-cols-2 gap-2 max-h-64')}>
				<FileDropzone accept={acceptableFiles} onDropFile={handleFileDrop} className="max-h-64">
					<Textarea
						aria-label="Source content"
						placeholder="Paste csv content or upload file..."
						value={csvContent}
						className="h-64 w-full"
						onChange={(event) => {
							setCsvContent(event.target.value);
						}}
					/>
				</FileDropzone>
				<Textarea
					aria-label="Converted content"
					readOnly={true}
					value={targetContent}
					className="h-64"
				/>
			</div>
			<div className={cn('flex flex-row justify-between')}>
				<Button onClick={handleUpload}>
					<HardDriveUploadIcon />
					Upload
				</Button>
				<div className={cn('flex flex-row gap-2')}>
					<SelectWrapper<CsvFormatsType>
						ariaLabel="Output format"
						defaultValue={fileFormat}
						onChange={setFileFormat}
						options={formatOptions}
					/>
					<Button
						onClick={download}
					>
						<DownloadIcon />
						Export
					</Button>
				</div>
			</div>
			<CsvOptionsContainer onSettingsChange={setConfig} />
			<ErrorList errors={errors} />
		</div>
	);
};

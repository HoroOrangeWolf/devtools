import { cn } from '@/lib/utils.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Button } from '@/components/ui/button.tsx';
import { OptionType, SelectWrapper } from '@/components/selectWrapper.component.tsx';
import { useEffect, useState } from 'react';
import { HardDriveUploadIcon, DownloadIcon } from 'lucide-react';
import { CsvService } from '@/service/csv.service.ts';
import { CsvOptionsContainer } from '@/container/csv/csvOptions.container.tsx';
import {  UnparseConfig } from 'papaparse';
import { CsvFormatsConstant, CsvFormatsType } from '@/service/constant/csvFormats.constant.ts';
import { ErrorList, ErrorModel } from '@/components/errorList.component.tsx';
import { FileService } from '@/service/file.service.ts';

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
		const uploadedContent = await FileService.getFileContent(['.csv,text/csv', '.json']);

		if (!uploadedContent) {
			return;
		}

		setCsvContent(uploadedContent);
	};

	return (
		<div className={cn('flex flex-col gap-2')}>
			<div className={cn('grid grid-cols-2 gap-2 max-h-64')}>
				<Textarea
					placeholder="Paste csv content or upload file..."
					value={csvContent}
					className="max-h-64"
					onChange={(event) => {
						setCsvContent(event.target.value);
					}}
				/>
				<Textarea
					readOnly={true}
					value={targetContent}
					className="max-h-64"
				/>
			</div>
			<div className={cn('flex flex-row justify-between')}>
				<Button onClick={handleUpload}>
					<HardDriveUploadIcon />
					Upload
				</Button>
				<div className={cn('flex flex-row gap-2')}>
					<SelectWrapper<CsvFormatsType>
						defaultValue={fileFormat}
						onChange={setFileFormat}
						options={formatOptions}
					/>
					<Button>
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

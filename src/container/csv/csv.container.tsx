import { cn } from '@/lib/utils.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Button } from '@/components/ui/button.tsx';
import { OptionType, SelectWrapper } from '@/components/selectWrapper.component.tsx';
import { useState } from 'react';
import { HardDriveUploadIcon, DownloadIcon } from 'lucide-react';
import { CsvService } from '@/service/csv.service.ts';
import { CsvOptionsContainer } from '@/container/csv/csvOptions.container.tsx';

type SupportedFormats = 'json' | 'csv';

const formatOptions: OptionType<SupportedFormats>[] = [
	{
		label: 'JSON',
		value: 'json',
	},
	{
		label: 'CSV',
		value: 'csv',
	}
];

export const CsvContainer = () => {
	const [fileFormat, setFileFormat] = useState<SupportedFormats>('csv');
	const [csvContent, setCsvContent] = useState('');

	const handleUpload = async () => {
		const uploadedContent = await CsvService.uploadCSV();

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
					className="max-h-64"
				/>
			</div>
			<div className={cn('flex flex-row justify-between')}>
				<Button onClick={handleUpload}>
					<HardDriveUploadIcon />
					Upload
				</Button>
				<div className={cn('flex flex-row gap-2')}>
					<SelectWrapper<SupportedFormats>
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
			<CsvOptionsContainer />
		</div>
	);
};

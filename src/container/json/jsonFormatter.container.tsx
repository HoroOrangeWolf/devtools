import { JsonEditorContainer } from '@/container/json/jsonEditor.container.tsx';
import { cn } from '@/lib/utils.ts';
import { useState } from 'react';
import {  ButtonSelectWrapper } from '@/components/select/buttonSelectWrapper.component.tsx';
import {
	JsonPrettyViewModeConstant,
	JsonPrettyViewModeType
} from '@/container/json/constant/jsonPrettyViewMode.constant.ts';
import { OptionType, SelectWrapper } from '@/components/select/selectWrapper.component.tsx';
import { ViewDataType, ViewDataTypeConstant } from '@/container/json/constant/viewDataType.constant.ts';
import { Button } from '@/components/ui/button.tsx';
import { DownloadIcon } from 'lucide-react';
import { Field, FieldLabel } from '@/components/ui/field.tsx';
import { FileDropzone } from '@/components/csvFileDropzone.component.tsx';
import { ContentFormat, FileExtension, FileService } from '@/service/file.service.ts';
import { FileDataTypeExtensionMapConstant } from '@/container/json/constant/fileDataTypeExtensionMap.constant.ts';
import { ErrorBanner } from '@/components/error.component.tsx';

const exp = `{
  "employees": {
    "employee": [
      {
        "id": "1",
        "firstName": "Tom",
        "lastName": "Cruise",
        "photo": "https://jsonformatter.org/img/tom-cruise.jpg"
      },
      {
        "id": "2",
        "firstName": "Maria",
        "lastName": "Sharapova",
        "photo": "https://jsonformatter.org/img/Maria-Sharapova.jpg"
      },
      {
        "id": "3",
        "firstName": "Robert",
        "lastName": "Downey Jr.",
        "photo": "https://jsonformatter.org/img/Robert-Downey-Jr.jpg"
      }
    ]
  }
}`;

const options: OptionType<JsonPrettyViewModeType>[] = [
	{
		label: 'Compact',
		value: JsonPrettyViewModeConstant.COMPACT,
	},
	{
		label: 'Beautified',
		value: JsonPrettyViewModeConstant.BEAUTIFIED,
	}
];

const convertOptions: OptionType<ViewDataType>[] = [
	{
		label: 'JSON',
		value: ViewDataTypeConstant.JSON
	},
	{
		label: 'XML',
		value: ViewDataTypeConstant.XML,
	},
	{
		label: 'CSV',
		value: ViewDataTypeConstant.CSV
	}
];

const tabs: OptionType<number>[] = Array.from({ length: 3 }, ()=>null)
	.map((_, index): OptionType<number> => ({
		label: `Tab ${index + 1}`,
		value: index + 1
	}));

const acceptableFiles: (FileExtension | ContentFormat)[] = [
	'.csv',
	'application/json',
	'.json',
	'text/csv',
	'.xml',
	'application/xml'
];

const languageByType: Record<ViewDataType, string> = {
	[ViewDataTypeConstant.JSON]: 'json',
	[ViewDataTypeConstant.XML]: 'xml',
	[ViewDataTypeConstant.CSV]: 'csv',
};

export const JsonFormatterContainer = () => {
	const [value, setValue] = useState<string>(exp);
	const [targetTransform, setTargetTransform] = useState<ViewDataType>(ViewDataTypeConstant.JSON);
	const [jsonPrettyMode, setJsonPrettyMode] = useState<JsonPrettyViewModeType>(JsonPrettyViewModeConstant.BEAUTIFIED);
	const [tabCount, setTabCount] = useState<number>(2);
	const [errorMessage, setErrorMessage] = useState<string>();

	const onDropFile = async (file: File) => {
		try {
			const result = await FileService.readFileAsJson(file);

			const stringifyVal = JSON.stringify(result);

			setValue(stringifyVal);
		} catch (error) {
			console.error('Failed to read file', error);
			setErrorMessage((error as Error).message);
		}
	};

	const onDownloadFile = () => {
		try {
			const transformed = FileService.transformJsonToTarget(JSON.parse(value), FileDataTypeExtensionMapConstant[targetTransform], {
				tabs: jsonPrettyMode === JsonPrettyViewModeConstant.COMPACT ? undefined : tabCount
			});

			FileService.downloadFile(`result_${targetTransform}.${languageByType[targetTransform]}`, transformed, FileDataTypeExtensionMapConstant[targetTransform]);
		} catch (error) {
			console.error('Failed to download file', error);
			throw error;
		}
	};

	const onError = (error: Error) => {
		setErrorMessage(error?.message ?? 'Unknown error');
	};

	// TODO: Code edition improved [{ new lines.
	return (
		<div className={cn('flex flex-col gap-2')}>
			<div className={cn('xl:grid xl:grid-cols-[minmax(0,1fr)_13rem_minmax(0,1fr)] flex flex-col xl:grid-rows-1 gap-2 w-full min-h-[calc(100dvh-25rem)] overflow-y-auto')}>
				<FileDropzone
					accept={acceptableFiles}
					className="max-h-full"
					onDropFile={onDropFile}
				>
					<JsonEditorContainer
						className={cn('max-h-full h-full')}
						value={value}
						displayMode={JsonPrettyViewModeConstant.BEAUTIFIED}
						onChange={(value) => {
							setErrorMessage(undefined);
							setValue(value);
						}}
					/>
				</FileDropzone>
				<div className={cn('flex flex-col gap-2')}>
					<ButtonSelectWrapper
						onClick={setJsonPrettyMode}
						value={jsonPrettyMode}
						options={options}
					/>
					<Field>
						<FieldLabel>
							JSON tabs
						</FieldLabel>
						<SelectWrapper
							options={tabs}
							onChange={setTabCount}
							defaultValue={tabCount}
						/>
					</Field>
					<Field>
						<FieldLabel>
							Transform to
						</FieldLabel>
						<SelectWrapper
							defaultValue={ViewDataTypeConstant.JSON}
							options={convertOptions}
							onChange={setTargetTransform}
						/>
					</Field>
					<Button
						onClick={onDownloadFile}
						disabled={!!errorMessage}
					>
						<DownloadIcon /> Download
					</Button>
				</div>
				<JsonEditorContainer
					className={cn('max-w-full h-full')}
					readOnly={true}
					displayMode={jsonPrettyMode}
					onError={onError}
					value={value}
					tabCount={tabCount}
					targetTransform={targetTransform}
				/>
			</div>
			{errorMessage && (
				<ErrorBanner title="Error">
					{errorMessage}
				</ErrorBanner>
			)}
		</div>
	);
};
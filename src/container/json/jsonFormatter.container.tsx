
// TODO: Zablokować textarea
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

export const JsonFormatterContainer = () => {
	const [value, setValue] = useState<string>(exp);
	const [targetTransform, setTargetTransform] = useState<ViewDataType>(ViewDataTypeConstant.JSON);
	const [jsonPrettyMode, setJsonPrettyMode] = useState<JsonPrettyViewModeType>(JsonPrettyViewModeConstant.BEAUTIFIED);
	const [tabCount, setTabCount] = useState<number>(2);

	const onDropFile = async (file: File) => {
		try {
			const result = FileService.readFileAsJson(file);

			const stringifyVal = JSON.stringify(result);

			setValue(stringifyVal);
		} catch (error) {
			console.error('Failed to read file', error);
		}
	};

	return (
		<div className={cn('lg:grid lg:grid-cols-[minmax(0,1fr)_13rem_minmax(0,1fr)] flex flex-col lg:grid-rows-1 gap-2 w-full')}>
			<FileDropzone
				accept={acceptableFiles}
				className="max-h-full"
				onDropFile={onDropFile}
			>
				<JsonEditorContainer
					className={cn('max-h-full')}
					value={value}
					displayMode={JsonPrettyViewModeConstant.BEAUTIFIED}
					onChange={(value) => setValue(value)}
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
				<Button>
					<DownloadIcon /> Download
				</Button>
			</div>
			<JsonEditorContainer
				className={cn('max-w-full')}
				readOnly={true}
				displayMode={jsonPrettyMode}
				value={value}
				tabCount={tabCount}
				targetTransform={targetTransform}
			/>
		</div>
	);
};
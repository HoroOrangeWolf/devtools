
// TODO: Zablokować textarea
import { JsonEditorContainer } from '@/container/json/jsonEditor.container.tsx';
import { cn } from '@/lib/utils.ts';
import { useState } from 'react';
import { ButtonSelectOption, ButtonSelectWrapper } from '@/components/select/buttonGroupWrapper.component.tsx';
import {
	JsonPrettyViewModeConstant,
	JsonPrettyViewModeType
} from '@/container/json/constant/jsonPrettyViewMode.constant.ts';
import { OptionType, SelectWrapper } from '@/components/selectWrapper.component.tsx';
import { ViewDataType, ViewDataTypeConstant } from '@/container/json/constant/viewDataType.constant.ts';
import { Button } from '@/components/ui/button.tsx';
import { DownloadIcon } from 'lucide-react';
import { Field, FieldLabel } from '@/components/ui/field.tsx';

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

export const JsonFormatterContainer = () => {
	const [value, setValue] = useState<string>(exp);

	return (
		<div className={cn('grid md:grid-cols-[1fr_1fr_1fr] grid-cols-1 grid-rows-3 md:grid-rows-1 gap-2')}>
			<JsonEditorContainer value={value} onChange={({ value }) => setValue(value)} />
			<div className={cn('flex flex-col gap-2')}>
				<ButtonSelectWrapper
					defaultValue={JsonPrettyViewModeConstant.BEAUTIFIED}
					options={options}
				/>
				<Field>
					<FieldLabel>
						Transform to
					</FieldLabel>
					<SelectWrapper
						defaultValue={ViewDataTypeConstant.JSON}
						options={convertOptions}
					/>
				</Field>
				<Button>
					<DownloadIcon /> Download
				</Button>
			</div>
			<JsonEditorContainer
				readOnly={true}
				value={value}
			/>
		</div>
	);
};
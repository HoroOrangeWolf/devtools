import { CodeView } from '@/container/json/view/codeView.component.tsx';
import { useState } from 'react';
import { ViewDataType, ViewDataTypeConstant } from '@/container/json/constant/viewDataType.constant.ts';
import { cn } from '@/lib/utils.ts';
import { ViewType, ViewTypeConstant } from '@/container/json/constant/viewType.constant.ts';
import { ButtonSelectOption, ButtonSelectWrapper } from '@/components/select/buttonGroupWrapper.component.tsx';
import { CodeXml, TextAlignStart, LucideListTree } from 'lucide-react';

type PropsType = {
	value?: string | string[];
	className?: string;
}

const options: ButtonSelectOption<ViewType>[] = [
	{
		label: <CodeXml />,
		value: ViewTypeConstant.CODE,
	},
	{
		label: <TextAlignStart />,
		value: ViewTypeConstant.RAW,
	},
	{
		label: <LucideListTree />,
		value: ViewTypeConstant.TREE
	}
];

export const JsonEditorContainer = ({ value = '', className }: PropsType) => {
	const [jsonViewType, setJsonViewType] = useState<ViewType>(ViewTypeConstant.CODE);
	const [dataType, setDataType] = useState<ViewDataType>(ViewDataTypeConstant.JSON);

	return (
		<div className={cn('flex flex-col gap-1', className)}>
			<div className={cn('flex flex-row justify-start')}>
				<ButtonSelectWrapper
					options={options}
					value={jsonViewType}
					onClick={setJsonViewType}
				/>
			</div>
			<CodeView type={dataType} >
				{value}
			</CodeView>
		</div>
	);
};

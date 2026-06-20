import {  ButtonSelectWrapper } from '@/components/select/buttonGroupWrapper.component.tsx';
import { ErrorBanner } from '@/components/error.component.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { ViewDataTypeConstant } from '@/container/json/constant/viewDataType.constant.ts';
import { ViewType, ViewTypeConstant } from '@/container/json/constant/viewType.constant.ts';
import { CodeView } from '@/container/json/view/codeView.component.tsx';
import { JsonTreeSettings, JsonTreeView, JsonValue } from '@/container/json/view/jsonTreeView.component.tsx';
import { cn } from '@/lib/utils.ts';
import { CodeXml, LucideListTree, TextAlignStart } from 'lucide-react';
import { useMemo, useState } from 'react';
import { OptionType } from '@/components/selectWrapper.component.tsx';

export type JsonEditorChange = {
	value: string;
	errorMessage?: string;
};

type PropsType = {
	value?: string;
	onChange?: (change: JsonEditorChange) => void;
	readOnly?: boolean;
	treeSettings?: JsonTreeSettings;
	className?: string;
}

const options: OptionType<ViewType>[] = [
	{
		label: <CodeXml aria-label="Code view" />,
		value: ViewTypeConstant.CODE,
	},
	{
		label: <TextAlignStart aria-label="Raw view" />,
		value: ViewTypeConstant.RAW,
	},
	{
		label: <LucideListTree aria-label="Tree view" />,
		value: ViewTypeConstant.TREE,
	},
];

const parseJson = (value: string): { data?: JsonValue; errorMessage?: string } => {
	if (value.trim() === '') {
		return { errorMessage: 'JSON input cannot be empty.' };
	}

	try {
		return { data: JSON.parse(value) as JsonValue };
	} catch (error) {
		return {
			errorMessage: error instanceof Error ? error.message : 'Invalid JSON.',
		};
	}
};

export const JsonEditorContainer = ({
	value = '',
	onChange,
	readOnly = false,
	treeSettings,
	className,
}: PropsType) => {
	const [jsonViewType, setJsonViewType] = useState<ViewType>(ViewTypeConstant.CODE);
	const parsedJson = useMemo(() => parseJson(value), [value]);

	const handleRawChange = (nextValue: string) => {
		const { errorMessage } = parseJson(nextValue);

		onChange?.({
			value: nextValue,
			...(errorMessage ? { errorMessage } : {}),
		});
	};

	const handleTreeChange = (nextValue: JsonValue) => {
		onChange?.({ value: JSON.stringify(nextValue) });
	};

	const getView = () => {
		switch (jsonViewType) {
			case ViewTypeConstant.CODE: {
				return (
					<CodeView type={ViewDataTypeConstant.JSON}>
						{value}
					</CodeView>
				);
			}
			case ViewTypeConstant.RAW: {
				return (
					<div className="flex flex-col gap-2">
						<Textarea
							value={value}
							readOnly={readOnly}
							aria-invalid={Boolean(parsedJson.errorMessage)}
							onChange={(event) => handleRawChange(event.target.value)}
						/>
						{parsedJson.errorMessage && (
							<ErrorBanner title="Invalid JSON">
								{parsedJson.errorMessage}
							</ErrorBanner>
						)}
					</div>
				);
			}
			case ViewTypeConstant.TREE: {
				if (parsedJson.errorMessage || parsedJson.data === undefined) {
					return (
						<ErrorBanner title="Invalid JSON">
							{parsedJson.errorMessage ?? 'Unable to parse JSON.'}
						</ErrorBanner>
					);
				}

				return (
					<JsonTreeView
						value={parsedJson.data}
						readOnly={readOnly}
						settings={treeSettings}
						onChange={handleTreeChange}
					/>
				);
			}
		}
	};

	return (
		<div className={cn('flex flex-col gap-1', className)}>
			<div className="flex flex-row justify-start">
				<ButtonSelectWrapper
					options={options}
					value={jsonViewType}
					onClick={setJsonViewType}
				/>
			</div>
			{getView()}
		</div>
	);
};
